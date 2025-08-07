import express from 'express';
import { Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/clerkAuth';
import { Specialty } from '../models/mongodb/Specialty';
import { Doctor } from '../models/mongodb/Doctor';
import { UserRole } from '../models/mongodb/User';
import { Types } from 'mongoose';

const router = express.Router();

// GET /api/specialties/dev-test - Simple test route for development
router.get('/dev-test', (req: Request, res: Response) => {
  res.json({ 
    message: 'Development route working!', 
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV 
  });
});

// POST /api/specialties/simple-test - Ultra simple test route
router.post('/simple-test', (req: Request, res: Response) => {
  try {
    console.log('✅ Simple test route hit, body:', req.body);
    res.json({ 
      success: true,
      message: 'Simple test route working!',
      receivedData: req.body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in simple test route:', error);
    res.status(500).json({ error: 'Test route failed' });
  }
});

// Interface for query parameters
interface SpecialtiesQueryParams {
  page?: string;
  limit?: string;
  category?: string;
  search?: string;
  active?: string;
  sortBy?: 'name' | 'priority' | 'totalDoctors';
  sortOrder?: 'asc' | 'desc';
}

// GET /api/specialties - List all specialties with filtering and pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      category,
      search,
      active = 'true',
      sortBy = 'priority',
      sortOrder = 'desc'
    } = req.query as SpecialtiesQueryParams;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter: any = {};

    if (active === 'true') {
      filter.isActive = true;
    } else if (active === 'false') {
      filter.isActive = false;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { name: searchRegex },
        { nameEn: searchRegex },
        { description: searchRegex },
        { descriptionEn: searchRegex },
        { seoKeywords: { $in: [searchRegex] } },
        { commonConditions: { $in: [searchRegex] } }
      ];
    }

    // Build sort object
    const sort: any = {};
    switch (sortBy) {
      case 'name':
        sort.name = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'priority':
        sort.priority = sortOrder === 'asc' ? 1 : -1;
        sort.name = 1; // Secondary sort by name
        break;
      case 'totalDoctors':
        sort['statistics.totalDoctors'] = sortOrder === 'asc' ? 1 : -1;
        break;
      default:
        sort.priority = -1;
        sort.name = 1;
    }

    // Execute query
    const specialties = await Specialty.find(filter)
      .populate({
        path: 'parentSpecialty',
        select: 'name nameEn icon'
      })
      .populate({
        path: 'subSpecialties',
        select: 'name nameEn icon isActive'
      })
      .populate({
        path: 'relatedSpecialties',
        select: 'name nameEn icon',
        match: { isActive: true }
      })
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Specialty.countDocuments(filter);

    res.json({
      specialties,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Error fetching specialties:', error);
    res.status(500).json({ error: 'Failed to fetch specialties' });
  }
});

// GET /api/specialties/hierarchy - Get specialty hierarchy (for dropdowns/menus)
router.get('/hierarchy', async (req: Request, res: Response) => {
  try {
    const hierarchy = await (Specialty as any).getHierarchy();
    res.json(hierarchy);
  } catch (error) {
    console.error('Error fetching specialty hierarchy:', error);
    res.status(500).json({ error: 'Failed to fetch specialty hierarchy' });
  }
});

// GET /api/specialties/search/:query - Search specialties
router.get('/search/:query', async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const { limit = '10' } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const results = await (Specialty as any).searchSpecialties(query.trim(), parseInt(limit as string));
    res.json(results);

  } catch (error) {
    console.error('Error searching specialties:', error);
    res.status(500).json({ error: 'Failed to search specialties' });
  }
});

// GET /api/specialties/categories - Get all categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await Specialty.distinct('category', { isActive: true });
    
    // Get counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const count = await Specialty.countDocuments({ category, isActive: true });
        const doctorCount = await Doctor.aggregate([
          { $match: { status: 'verified' } },
          { $lookup: { from: 'specialties', localField: 'specialtyIds', foreignField: '_id', as: 'specialties' } },
          { $match: { 'specialties.category': category } },
          { $count: 'total' }
        ]);
        
        return {
          name: category,
          specialtyCount: count,
          doctorCount: doctorCount[0]?.total || 0
        };
      })
    );

    res.json(categoriesWithCounts.sort((a, b) => b.doctorCount - a.doctorCount));

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/specialties/:id - Get single specialty details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid specialty ID' });
    }

    const specialty = await Specialty.findById(id)
      .populate({
        path: 'parentSpecialty',
        select: 'name nameEn icon'
      })
      .populate({
        path: 'subSpecialties',
        select: 'name nameEn icon description isActive statistics',
        match: { isActive: true }
      })
      .populate({
        path: 'relatedSpecialties',
        select: 'name nameEn icon description statistics',
        match: { isActive: true }
      })
      .lean();

    if (!specialty) {
      return res.status(404).json({ error: 'Specialty not found' });
    }

    // Get doctor count for this specialty
    const doctorCount = await Doctor.countDocuments({
      specialtyIds: id,
      status: 'verified'
    });

    // Get average ratings from doctors in this specialty
    const ratingStats = await Doctor.aggregate([
      { $match: { specialtyIds: new Types.ObjectId(id), status: 'verified' } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$ratings.average' },
          avgFee: { $avg: '$consultationFee' },
          minFee: { $min: '$consultationFee' },
          maxFee: { $max: '$consultationFee' }
        }
      }
    ]);

    const stats = ratingStats[0] || {
      avgRating: 0,
      avgFee: 0,
      minFee: 0,
      maxFee: 0
    };

    res.json({
      ...specialty,
      realTimeStats: {
        totalVerifiedDoctors: doctorCount,
        averageRating: stats.avgRating || 0,
        averageFee: stats.avgFee || 0,
        feeRange: {
          min: stats.minFee || 0,
          max: stats.maxFee || 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching specialty:', error);
    res.status(500).json({ error: 'Failed to fetch specialty' });
  }
});

// POST /api/specialties - Create new specialty (temporarily no auth for development)
router.post('/', async (req: Request, res: Response) => {
  // TODO: Re-enable authentication: requireAuth, requireRole([UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN])
  try {
    const {
      name,
      nameEn,
      description,
      descriptionEn,
      icon,
      imageUrl,
      category,
      parentSpecialty,
      commonConditions,
      commonProcedures,
      requiredEducation,
      averageConsultationDuration,
      priority,
      seoKeywords,
      relatedSpecialties
    } = req.body;

    // Validate required fields
    if (!name || !nameEn || !description || !descriptionEn || !icon || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate parent specialty exists if provided
    if (parentSpecialty && !Types.ObjectId.isValid(parentSpecialty)) {
      return res.status(400).json({ error: 'Invalid parent specialty ID' });
    }

    if (parentSpecialty) {
      const parent = await Specialty.findById(parentSpecialty);
      if (!parent) {
        return res.status(400).json({ error: 'Parent specialty not found' });
      }
    }

    const specialtyData = {
      name,
      nameEn,
      description,
      descriptionEn,
      icon,
      imageUrl,
      category,
      parentSpecialty: parentSpecialty || undefined,
      commonConditions: commonConditions || [],
      commonProcedures: commonProcedures || [],
      requiredEducation: requiredEducation || [],
      averageConsultationDuration: averageConsultationDuration || 30,
      priority: priority || 0,
      seoKeywords: seoKeywords || [],
      relatedSpecialties: relatedSpecialties || []
    };

    const specialty = new Specialty(specialtyData);
    await specialty.save();

    // Update parent's subSpecialties array if has parent
    if (parentSpecialty) {
      await Specialty.findByIdAndUpdate(
        parentSpecialty,
        { $addToSet: { subSpecialties: specialty._id } }
      );
    }

    res.status(201).json(specialty);

  } catch (error) {
    console.error('Error creating specialty:', error);
    
    if ((error as any).code === 11000) {
      return res.status(409).json({ error: 'Specialty name already exists' });
    }
    
    res.status(500).json({ error: 'Failed to create specialty' });
  }
});

// PUT /api/specialties/:id - Update specialty (admin only)
router.put('/:id', requireAuth, requireRole([UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN]), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid specialty ID' });
    }

    const specialty = await Specialty.findById(id);
    if (!specialty) {
      return res.status(404).json({ error: 'Specialty not found' });
    }

    const allowedUpdates = [
      'name', 'nameEn', 'description', 'descriptionEn', 'icon', 'imageUrl',
      'category', 'parentSpecialty', 'commonConditions', 'commonProcedures',
      'requiredEducation', 'averageConsultationDuration', 'priority',
      'seoKeywords', 'relatedSpecialties', 'isActive'
    ];

    const updates: any = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Validate parent specialty if being updated
    if (updates['parentSpecialty']) {
      if (updates['parentSpecialty'] === id) {
        return res.status(400).json({ error: 'Specialty cannot be its own parent' });
      }
      
      const parent = await Specialty.findById(updates['parentSpecialty']);
      if (!parent) {
        return res.status(400).json({ error: 'Parent specialty not found' });
      }
    }

    const updatedSpecialty = await Specialty.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate([
      {
        path: 'parentSpecialty',
        select: 'name nameEn icon'
      },
      {
        path: 'subSpecialties',
        select: 'name nameEn icon isActive'
      }
    ]);

    res.json(updatedSpecialty);

  } catch (error) {
    console.error('Error updating specialty:', error);
    
    if ((error as any).code === 11000) {
      return res.status(409).json({ error: 'Specialty name already exists' });
    }
    
    res.status(500).json({ error: 'Failed to update specialty' });
  }
});

// DELETE /api/specialties/:id - Soft delete specialty (admin only)
router.delete('/:id', requireAuth, requireRole([UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN]), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid specialty ID' });
    }

    // Check if specialty has active doctors
    const doctorCount = await Doctor.countDocuments({
      specialtyIds: id,
      status: 'verified'
    });

    if (doctorCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete specialty with ${doctorCount} active doctors. Deactivate instead.` 
      });
    }

    const specialty = await Specialty.findByIdAndUpdate(
      id,
      { 
        isActive: false,
        updatedAt: new Date() 
      },
      { new: true }
    );

    if (!specialty) {
      return res.status(404).json({ error: 'Specialty not found' });
    }

    // Remove from parent's subSpecialties if has parent
    if (specialty.parentSpecialty) {
      await Specialty.findByIdAndUpdate(
        specialty.parentSpecialty,
        { $pull: { subSpecialties: id } }
      );
    }

    res.json({ message: 'Specialty deactivated successfully', specialty });

  } catch (error) {
    console.error('Error deactivating specialty:', error);
    res.status(500).json({ error: 'Failed to deactivate specialty' });
  }
});

// PUT /api/specialties/:id/activate - Reactivate specialty (admin only)
router.put('/:id/activate', requireAuth, requireRole([UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN]), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid specialty ID' });
    }

    const specialty = await Specialty.findByIdAndUpdate(
      id,
      { 
        isActive: true,
        updatedAt: new Date() 
      },
      { new: true }
    ).populate([
      {
        path: 'parentSpecialty',
        select: 'name nameEn icon'
      },
      {
        path: 'subSpecialties',
        select: 'name nameEn icon isActive'
      }
    ]);

    if (!specialty) {
      return res.status(404).json({ error: 'Specialty not found' });
    }

    // Add back to parent's subSpecialties if has parent
    if (specialty.parentSpecialty) {
      await Specialty.findByIdAndUpdate(
        specialty.parentSpecialty,
        { $addToSet: { subSpecialties: id } }
      );
    }

    res.json({ message: 'Specialty activated successfully', specialty });

  } catch (error) {
    console.error('Error activating specialty:', error);
    res.status(500).json({ error: 'Failed to activate specialty' });
  }
});

// POST /api/specialties/seed - Seed initial specialties (admin only, dev mode)
router.post('/seed', requireAuth, requireRole([UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN]), async (req: Request, res: Response) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ error: 'Seeding only available in development mode' });
    }

    await (Specialty as any).seedSpecialties();
    
    const count = await Specialty.countDocuments({ isActive: true });
    res.json({ message: `Successfully seeded specialties. Total active: ${count}` });

  } catch (error) {
    console.error('Error seeding specialties:', error);
    res.status(500).json({ error: 'Failed to seed specialties' });
  }
});

// POST /api/specialties/dev - Create new specialty (development only, no auth)
router.post('/dev', async (req: Request, res: Response) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ error: 'Development route only available in development mode' });
    }

    const {
      name,
      nameEn,
      description,
      descriptionEn,
      icon,
      category,
      commonConditions = [],
      commonProcedures = [],
      priority = 1,
      seoKeywords = []
    } = req.body;

    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    const specialty = new Specialty({
      name: name.trim(),
      nameEn: nameEn?.trim() || name.trim(),
      description: description.trim(),
      descriptionEn: descriptionEn?.trim() || description.trim(),
      icon: icon || '🏥',
      category: category || 'General',
      commonConditions,
      commonProcedures,
      priority: Math.max(1, Math.min(10, priority)),
      seoKeywords,
      isActive: true,
      statistics: {
        totalDoctors: 0,
        averageRating: 0,
        totalReviews: 0,
        totalAppointments: 0
      }
    });

    await specialty.save();

    console.log(`✅ Development specialty created: ${specialty.name}`);

    res.status(201).json({
      message: 'Specialty created successfully (development mode)',
      specialty: {
        id: specialty._id,
        name: specialty.name,
        nameEn: specialty.nameEn,
        description: specialty.description,
        icon: specialty.icon,
        category: specialty.category
      }
    });

  } catch (error) {
    console.error('Error creating development specialty:', error);
    
    if ((error as any).code === 11000) {
      return res.status(409).json({ error: 'Specialty name already exists' });
    }
    
    res.status(500).json({ error: 'Failed to create specialty' });
  }
});

// PUT /api/specialties/update-statistics - Update all specialty statistics (admin only)
router.put('/update-statistics', requireAuth, requireRole([UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN]), async (req: Request, res: Response) => {
  try {
    const specialties = await Specialty.find({ isActive: true });
    
    for (const specialty of specialties) {
      // Update doctor count and average ratings
      const doctorStats = await Doctor.aggregate([
        { $match: { specialtyIds: specialty._id, status: 'verified' } },
        {
          $group: {
            _id: null,
            totalDoctors: { $sum: 1 },
            averageRating: { $avg: '$ratings.average' },
            totalAppointments: { $sum: '$totalAppointments' },
            avgFee: { $avg: '$consultationFee' },
            minFee: { $min: '$consultationFee' },
            maxFee: { $max: '$consultationFee' }
          }
        }
      ]);

      const stats = doctorStats[0] || {
        totalDoctors: 0,
        averageRating: 0,
        totalAppointments: 0,
        avgFee: 0,
        minFee: 0,
        maxFee: 0
      };

      await Specialty.findByIdAndUpdate(specialty._id, {
        statistics: {
          totalDoctors: stats.totalDoctors,
          averageRating: stats.averageRating || 0,
          totalAppointments: stats.totalAppointments,
          lastUpdated: new Date()
        },
        averageConsultationFee: {
          min: stats.minFee || 0,
          max: stats.maxFee || 0,
          average: stats.avgFee || 0
        }
      });
    }

    res.json({ message: `Updated statistics for ${specialties.length} specialties` });

  } catch (error) {
    console.error('Error updating specialty statistics:', error);
    res.status(500).json({ error: 'Failed to update specialty statistics' });
  }
});

export default router;