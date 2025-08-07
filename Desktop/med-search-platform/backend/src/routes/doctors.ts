import express from 'express';
import { Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/clerkAuth';
import { Doctor, DoctorStatus } from '../models/mongodb/Doctor';
import { User, UserRole } from '../models/mongodb/User';
import { Specialty } from '../models/mongodb/Specialty';
import { Types } from 'mongoose';

const router = express.Router();

// Interface for query parameters
interface DoctorsQueryParams {
  page?: string;
  limit?: string;
  city?: string;
  state?: string;
  specialty?: string;
  status?: DoctorStatus;
  search?: string;
  minRating?: string;
  maxFee?: string;
  sortBy?: 'rating' | 'fee' | 'experience' | 'name';
  sortOrder?: 'asc' | 'desc';
  includeAllStatus?: string;
}

// GET /api/doctors - List all doctors with filtering and pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '12',
      city,
      state,
      specialty,
      status,
      search,
      minRating,
      maxFee,
      sortBy = 'rating',
      sortOrder = 'desc',
      includeAllStatus
    } = req.query as DoctorsQueryParams;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter: any = {};
    
    // Solo aplicar filtro de status si se especifica explícitamente
    // o si no se incluye el parámetro includeAllStatus
    if (status) {
      filter.status = status;
    } else if (!includeAllStatus) {
      // Por defecto, mostrar solo verificados para usuarios normales
      filter.status = DoctorStatus.VERIFIED;
    }
    // Si includeAllStatus=true, no aplicar filtro de status (mostrar todos)

    if (city) {
      filter['address.city'] = { $regex: new RegExp(city, 'i') };
    }

    if (state) {
      filter['address.state'] = { $regex: new RegExp(state, 'i') };
    }

    if (specialty) {
      // Find specialty by name or ID
      let specialtyIds: Types.ObjectId[] = [];
      
      if (Types.ObjectId.isValid(specialty)) {
        specialtyIds = [new Types.ObjectId(specialty)];
      } else {
        const specialties = await Specialty.find({
          name: { $regex: new RegExp(specialty, 'i') }
        }).select('_id');
        specialtyIds = specialties.map(s => s._id) as any[];
      }
      
      if (specialtyIds.length > 0) {
        filter.specialtyIds = { $in: specialtyIds };
      }
    }

    if (minRating) {
      filter['ratings.average'] = { $gte: parseFloat(minRating) };
    }

    if (maxFee) {
      filter.consultationFee = { $lte: parseFloat(maxFee) };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { tags: { $in: [searchRegex] } },
        { about: searchRegex },
        { languages: { $in: [searchRegex] } }
      ];
    }

    // Build sort object
    const sort: any = {};
    switch (sortBy) {
      case 'rating':
        sort['ratings.average'] = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'fee':
        sort.consultationFee = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'experience':
        sort.createdAt = sortOrder === 'asc' ? 1 : -1; // Proxy for experience
        break;
      case 'name':
        sort['userId.firstName'] = sortOrder === 'asc' ? 1 : -1;
        break;
      default:
        sort['ratings.average'] = -1;
    }

    // Execute query with population
    const doctors = await Doctor.find(filter)
      .populate({
        path: 'userId',
        select: 'firstName lastName email profileImageUrl'
      })
      .populate({
        path: 'specialtyIds',
        select: 'name description'
      })
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Doctor.countDocuments(filter);

    res.json({
      doctors,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// GET /api/doctors/stats/overview - Get doctor statistics (temporarily no auth for development)
router.get('/stats/overview', async (req: Request, res: Response) => {
  // TODO: Re-enable authentication: requireAuth, requireRole([UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN])
  try {
    const stats = await Doctor.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgRating: { $avg: '$ratings.average' },
          avgFee: { $avg: '$consultationFee' }
        }
      }
    ]);

    const totalDoctors = await Doctor.countDocuments();
    const avgRating = await Doctor.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$ratings.average' } } }
    ]);

    const topSpecialties = await Doctor.aggregate([
      { $unwind: '$specialtyIds' },
      { $group: { _id: '$specialtyIds', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'specialties',
          localField: '_id',
          foreignField: '_id',
          as: 'specialty'
        }
      },
      { $unwind: '$specialty' },
      {
        $project: {
          name: '$specialty.name',
          count: 1
        }
      }
    ]);

    res.json({
      totalDoctors,
      averageRating: avgRating[0]?.avgRating || 0,
      statusBreakdown: stats,
      topSpecialties
    });

  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/doctors/:id - Get single doctor details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid doctor ID' });
    }

    const doctor = await Doctor.findById(id)
      .populate({
        path: 'userId',
        select: 'firstName lastName email profileImageUrl'
      })
      .populate({
        path: 'specialtyIds',
        select: 'name description'
      })
      .lean();

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json(doctor);

  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
});

// POST /api/doctors - Create doctor profile (temporarily no auth for development)
router.post('/', async (req: Request, res: Response) => {
  // TODO: Re-enable authentication: requireAuth, requireRole([UserRole.DOCTOR])
  try {
    // Development mode: create a unique test user for each doctor
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    
    // Create a unique development user for each doctor
    const user = new User({
      clerkUserId: `dev_user_${timestamp}_${randomId}`,
      email: `dev.doctor.${timestamp}@test.com`,
      username: `devdoctor${timestamp}`,
      firstName: 'Development',
      lastName: `Doctor${randomId}`,
      role: UserRole.DOCTOR,
      isActive: true,
      isVerified: true
    });
    await user.save();
    console.log('✅ Created unique development user for doctor creation:', user.email);

    const {
      licenseNumber,
      specialtyIds,
      education,
      experience,
      consultationFee,
      consultationDuration,
      languages,
      about,
      address,
      availability,
      insuranceAccepted,
      tags,
      isAvailableForEmergency
    } = req.body;

    // Validate required fields
    if (!licenseNumber || !specialtyIds || !consultationFee || !about || !address) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if license number already exists
    const existingLicense = await Doctor.findOne({ licenseNumber: licenseNumber.trim() });
    if (existingLicense) {
      return res.status(409).json({ 
        error: 'Ya existe un doctor registrado con este número de licencia',
        field: 'licenseNumber',
        value: licenseNumber 
      });
    }

    // Validate specialty IDs exist
    const specialties = await Specialty.find({ _id: { $in: specialtyIds } });
    if (specialties.length !== specialtyIds.length) {
      return res.status(400).json({ error: 'One or more specialty IDs are invalid' });
    }

    const doctorData = {
      userId: user._id,
      licenseNumber,
      specialtyIds,
      education: education || [],
      experience: experience || [],
      consultationFee,
      consultationDuration: consultationDuration || 30,
      languages: languages || ['Español'],
      about,
      address,
      availability: availability || [],
      insuranceAccepted: insuranceAccepted || [],
      tags: tags || [],
      isAvailableForEmergency: isAvailableForEmergency || false,
      status: DoctorStatus.PENDING_VERIFICATION
    };

    const doctor = new Doctor(doctorData);
    await doctor.save();

    // Populate for response
    await doctor.populate([
      {
        path: 'userId',
        select: 'firstName lastName email profileImageUrl'
      },
      {
        path: 'specialtyIds',
        select: 'name description'
      }
    ]);

    res.status(201).json(doctor);

  } catch (error) {
    console.error('Error creating doctor profile:', error);
    
    if ((error as any).code === 11000) {
      // MongoDB duplicate key error
      const duplicateField = (error as any).keyPattern;
      if (duplicateField?.licenseNumber) {
        return res.status(409).json({ 
          error: 'Ya existe un doctor registrado con este número de licencia',
          field: 'licenseNumber'
        });
      } else if (duplicateField?.userId) {
        return res.status(409).json({ 
          error: 'Este usuario ya tiene un perfil de doctor asociado',
          field: 'userId'
        });
      } else {
        return res.status(409).json({ error: 'Ya existe un doctor con esta información' });
      }
    }
    
    res.status(500).json({ error: 'Failed to create doctor profile' });
  }
});

// PUT /api/doctors/:id - Update doctor profile
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).auth?.userId;
    
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid doctor ID' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find user in MongoDB
    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Check if user owns this doctor profile or is admin
    const isOwner = doctor.userId.toString() === (user as any)._id.toString();
    const isAdmin = user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.SUPER_ADMIN;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to update this profile' });
    }

    const allowedUpdates = [
      'education', 'experience', 'consultationFee', 'consultationDuration',
      'languages', 'about', 'address', 'availability', 'insuranceAccepted',
      'tags', 'isAvailableForEmergency'
    ];

    // Admin-only updates
    if (isAdmin) {
      allowedUpdates.push('status', 'licenseNumber', 'specialtyIds');
    }

    const updates: any = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Validate specialty IDs if provided
    if (updates['specialtyIds']) {
      const specialties = await Specialty.find({ _id: { $in: updates['specialtyIds'] } });
      if (specialties.length !== updates['specialtyIds'].length) {
        return res.status(400).json({ error: 'One or more specialty IDs are invalid' });
      }
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate([
      {
        path: 'userId',
        select: 'firstName lastName email profileImageUrl'
      },
      {
        path: 'specialtyIds',
        select: 'name description'
      }
    ]);

    res.json(updatedDoctor);

  } catch (error) {
    console.error('Error updating doctor:', error);
    
    if ((error as any).code === 11000) {
      return res.status(409).json({ error: 'License number already exists' });
    }
    
    res.status(500).json({ error: 'Failed to update doctor' });
  }
});

// DELETE /api/doctors/:id - Soft delete doctor (admin only)
router.delete('/:id', requireAuth, requireRole([UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN]), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid doctor ID' });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { 
        status: DoctorStatus.SUSPENDED,
        updatedAt: new Date() 
      },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({ message: 'Doctor suspended successfully', doctor });

  } catch (error) {
    console.error('Error suspending doctor:', error);
    res.status(500).json({ error: 'Failed to suspend doctor' });
  }
});

// PUT /api/doctors/:id/verify - Verify doctor (admin only)
router.put('/:id/verify', async (req: Request, res: Response) => {
  // TODO: Re-enable authentication: requireAuth, requireRole([UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN])
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid doctor ID' });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { 
        status: DoctorStatus.VERIFIED,
        updatedAt: new Date() 
      },
      { new: true }
    ).populate([
      {
        path: 'userId',
        select: 'firstName lastName email profileImageUrl'
      },
      {
        path: 'specialtyIds',
        select: 'name description'
      }
    ]);

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({ message: 'Doctor verified successfully', doctor });

  } catch (error) {
    console.error('Error verifying doctor:', error);
    res.status(500).json({ error: 'Failed to verify doctor' });
  }
});

// PUT /api/doctors/:id/reject - Reject doctor verification (admin only)
router.put('/:id/reject', async (req: Request, res: Response) => {
  // TODO: Re-enable authentication: requireAuth, requireRole([UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN])
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid doctor ID' });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { 
        status: DoctorStatus.REJECTED,
        rejectionReason: reason || 'No reason provided',
        updatedAt: new Date() 
      },
      { new: true }
    ).populate([
      {
        path: 'userId',
        select: 'firstName lastName email profileImageUrl'
      },
      {
        path: 'specialtyIds',
        select: 'name description'
      }
    ]);

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({ message: 'Doctor rejected successfully', doctor });

  } catch (error) {
    console.error('Error rejecting doctor:', error);
    res.status(500).json({ error: 'Failed to reject doctor' });
  }
});

export default router;