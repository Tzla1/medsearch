import express from 'express';
import { Request, Response } from 'express';
import { requireAuth, requireRole, populateUser } from '../middleware/clerkAuth';
import { Appointment, AppointmentStatus, AppointmentType, PaymentStatus } from '../models/mongodb/Appointment';
import { Doctor } from '../models/mongodb/Doctor';
import { Customer } from '../models/mongodb/Customer';
import { User, UserRole } from '../models/mongodb/User';
import { Types } from 'mongoose';

const router = express.Router();

// Interface for query parameters
interface AppointmentsQueryParams {
  page?: string;
  limit?: string;
  status?: AppointmentStatus;
  type?: AppointmentType;
  doctorId?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  paymentStatus?: PaymentStatus;
  sortBy?: 'date' | 'created' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// GET /api/appointments - List appointments with filtering and pagination (temporarily no auth for development)
router.get('/', async (req: Request, res: Response) => {
  // TODO: Re-enable authentication: requireAuth
  try {
    // Development mode: return all appointments without user filtering
    // TODO: Re-implement user-specific filtering when authentication is restored

    const {
      page = '1',
      limit = '10',
      status,
      type,
      doctorId,
      customerId,
      dateFrom,
      dateTo,
      paymentStatus,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query as AppointmentsQueryParams;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter: any = {};

    // Development mode: No role-based filtering, show all appointments
    // TODO: Re-implement role-based filtering when authentication is restored

    // Apply additional filters
    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.appointmentType = type;
    }

    if (doctorId && Types.ObjectId.isValid(doctorId)) {
      filter.doctorId = new Types.ObjectId(doctorId);
    }

    if (customerId && Types.ObjectId.isValid(customerId)) {
      filter.customerId = new Types.ObjectId(customerId);
    }

    if (dateFrom || dateTo) {
      filter.scheduledDate = {};
      if (dateFrom) {
        filter.scheduledDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.scheduledDate.$lte = new Date(dateTo);
      }
    }

    if (paymentStatus) {
      filter['payment.status'] = paymentStatus;
    }

    // Build sort object
    const sort: any = {};
    switch (sortBy) {
      case 'date':
        sort.scheduledDate = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'created':
        sort.createdAt = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'status':
        sort.status = sortOrder === 'asc' ? 1 : -1;
        sort.scheduledDate = -1; // Secondary sort
        break;
      default:
        sort.scheduledDate = -1;
    }

    // Execute query with population
    const appointments = await Appointment.find(filter)
      .populate({
        path: 'customerId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email profileImageUrl'
        }
      })
      .populate({
        path: 'doctorId',
        populate: [
          {
            path: 'userId',
            select: 'firstName lastName email profileImageUrl'
          },
          {
            path: 'specialtyIds',
            select: 'name nameEn icon'
          }
        ]
      })
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Appointment.countDocuments(filter);

    res.json({
      appointments,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// GET /api/appointments/:id - Get single appointment details
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).auth?.userId;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid appointment ID' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find user in MongoDB
    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const appointment = await Appointment.findById(id)
      .populate({
        path: 'customerId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email profileImageUrl'
        }
      })
      .populate({
        path: 'doctorId',
        populate: [
          {
            path: 'userId',
            select: 'firstName lastName email profileImageUrl'
          },
          {
            path: 'specialtyIds',
            select: 'name nameEn icon description'
          }
        ]
      })
      .lean();

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if user has access to this appointment
    const hasAccess = 
      user.role === UserRole.COMPANY_ADMIN ||
      user.role === UserRole.SUPER_ADMIN ||
      (user.role === UserRole.CUSTOMER && appointment.customerId.toString() === (user as any)._id.toString()) ||
      (user.role === UserRole.DOCTOR && appointment.doctorId.toString() === (user as any)._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ error: 'Not authorized to view this appointment' });
    }

    res.json(appointment);

  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// POST /api/appointments - Create new appointment (customer only)
router.post('/', requireAuth, requireRole([UserRole.CUSTOMER]), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const customer = await Customer.findOne({ userId: (user as any)._id });
    if (!customer) {
      return res.status(404).json({ error: 'Customer profile not found' });
    }

    const {
      doctorId,
      appointmentType,
      scheduledDate,
      scheduledEndTime,
      reasonForVisit,
      symptoms,
      patientNotes
    } = req.body;

    // Validate required fields
    if (!doctorId || !appointmentType || !scheduledDate || !reasonForVisit) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ error: 'Invalid doctor ID' });
    }

    // Validate doctor exists and is verified
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.status !== 'verified') {
      return res.status(400).json({ error: 'Doctor not found or not verified' });
    }

    // Validate appointment date
    const appointmentDate = new Date(scheduledDate);
    const endTime = scheduledEndTime ? new Date(scheduledEndTime) : new Date(appointmentDate.getTime() + (doctor.consultationDuration || 30) * 60000);
    
    if (appointmentDate <= new Date()) {
      return res.status(400).json({ error: 'Appointment date must be in the future' });
    }

    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      doctorId: new Types.ObjectId(doctorId),
      status: { $in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING] },
      $or: [
        {
          scheduledDate: { $lte: appointmentDate },
          scheduledEndTime: { $gt: appointmentDate }
        },
        {
          scheduledDate: { $lt: endTime },
          scheduledEndTime: { $gte: endTime }
        },
        {
          scheduledDate: { $gte: appointmentDate },
          scheduledEndTime: { $lte: endTime }
        }
      ]
    });

    if (conflictingAppointment) {
      return res.status(409).json({ error: 'Doctor is not available at this time' });
    }

    const appointmentData = {
      customerId: (customer as any)._id,
      doctorId: new Types.ObjectId(doctorId),
      appointmentType,
      scheduledDate: appointmentDate,
      scheduledEndTime: endTime,
      reasonForVisit,
      symptoms: symptoms || [],
      patientNotes: patientNotes || '',
      payment: {
        amount: doctor.consultationFee,
        status: PaymentStatus.PENDING
      }
    };

    const appointment = new Appointment(appointmentData);
    await appointment.save();

    // Populate for response
    await appointment.populate([
      {
        path: 'customerId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email profileImageUrl'
        }
      },
      {
        path: 'doctorId',
        populate: [
          {
            path: 'userId',
            select: 'firstName lastName email profileImageUrl'
          },
          {
            path: 'specialtyIds',
            select: 'name nameEn icon'
          }
        ]
      }
    ]);

    res.status(201).json(appointment);

  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// PUT /api/appointments/:id - Update appointment
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).auth?.userId;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid appointment ID' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check authorization based on role
    let isAuthorized = false;
    let allowedUpdates: string[] = [];

    if (user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.SUPER_ADMIN) {
      isAuthorized = true;
      allowedUpdates = ['status', 'scheduledDate', 'scheduledEndTime', 'appointmentType', 'reasonForVisit', 
                       'symptoms', 'diagnosis', 'prescriptions', 'labTests', 'doctorNotes', 'patientNotes',
                       'followUpRequired', 'followUpDate', 'payment', 'vitalSigns'];
    } else if (user.role === UserRole.DOCTOR) {
      const doctor = await Doctor.findOne({ userId: (user as any)._id });
      if (doctor && appointment.doctorId.toString() === (doctor as any)._id.toString()) {
        isAuthorized = true;
        allowedUpdates = ['status', 'diagnosis', 'prescriptions', 'labTests', 'doctorNotes', 
                         'followUpRequired', 'followUpDate', 'vitalSigns'];
      }
    } else if (user.role === UserRole.CUSTOMER) {
      const customer = await Customer.findOne({ userId: (user as any)._id });
      if (customer && appointment.customerId.toString() === (customer as any)._id.toString()) {
        isAuthorized = true;
        allowedUpdates = ['patientNotes', 'symptoms'];
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized to update this appointment' });
    }

    const updates: any = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Additional validation for date changes
    if (updates['scheduledDate'] || updates['scheduledEndTime']) {
      const newDate = updates['scheduledDate'] ? new Date(updates['scheduledDate']) : appointment.scheduledDate;
      const newEndTime = updates['scheduledEndTime'] ? new Date(updates['scheduledEndTime']) : appointment.scheduledEndTime;

      if (newDate <= new Date()) {
        return res.status(400).json({ error: 'Appointment date must be in the future' });
      }

      // Check for conflicts if date is being updated
      const conflictingAppointment = await Appointment.findOne({
        _id: { $ne: id },
        doctorId: appointment.doctorId,
        status: { $in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING] },
        $or: [
          {
            scheduledDate: { $lte: newDate },
            scheduledEndTime: { $gt: newDate }
          },
          {
            scheduledDate: { $lt: newEndTime },
            scheduledEndTime: { $gte: newEndTime }
          },
          {
            scheduledDate: { $gte: newDate },
            scheduledEndTime: { $lte: newEndTime }
          }
        ]
      });

      if (conflictingAppointment) {
        return res.status(409).json({ error: 'Doctor is not available at this time' });
      }
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate([
      {
        path: 'customerId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email profileImageUrl'
        }
      },
      {
        path: 'doctorId',
        populate: [
          {
            path: 'userId',
            select: 'firstName lastName email profileImageUrl'
          },
          {
            path: 'specialtyIds',
            select: 'name nameEn icon'
          }
        ]
      }
    ]);

    res.json(updatedAppointment);

  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// PUT /api/appointments/:id/cancel - Cancel appointment
router.put('/:id/cancel', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).auth?.userId;
    const { reason } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid appointment ID' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if user can cancel this appointment
    let canCancel = false;
    let cancelledBy: 'customer' | 'doctor' | 'system' = 'system';

    if (user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.SUPER_ADMIN) {
      canCancel = true;
      cancelledBy = 'system';
    } else if (user.role === UserRole.DOCTOR) {
      const doctor = await Doctor.findOne({ userId: (user as any)._id });
      if (doctor && appointment.doctorId.toString() === (doctor as any)._id.toString()) {
        canCancel = true;
        cancelledBy = 'doctor';
      }
    } else if (user.role === UserRole.CUSTOMER) {
      const customer = await Customer.findOne({ userId: (user as any)._id });
      if (customer && appointment.customerId.toString() === (customer as any)._id.toString()) {
        canCancel = appointment.status === AppointmentStatus.CONFIRMED;
        cancelledBy = 'customer';
      }
    }

    if (!canCancel) {
      return res.status(403).json({ error: 'Cannot cancel this appointment' });
    }

    const refundAmount = 0; // TODO: Implement refund calculation logic

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      {
        status: AppointmentStatus.CANCELLED,
        cancellation: {
          cancelledBy,
          cancelledAt: new Date(),
          reason: reason || 'No reason provided',
          refundAmount
        },
        updatedAt: new Date()
      },
      { new: true }
    ).populate([
      {
        path: 'customerId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email profileImageUrl'
        }
      },
      {
        path: 'doctorId',
        populate: [
          {
            path: 'userId',
            select: 'firstName lastName email profileImageUrl'
          },
          {
            path: 'specialtyIds',
            select: 'name nameEn icon'
          }
        ]
      }
    ]);

    res.json(updatedAppointment);

  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// PUT /api/appointments/:id/reschedule - Reschedule appointment
router.put('/:id/reschedule', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).auth?.userId;
    const { newDate, newEndTime, reason } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid appointment ID' });
    }

    if (!userId || !newDate || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check authorization
    let canReschedule = false;
    let rescheduledBy: 'customer' | 'doctor' = 'customer';

    if (user.role === UserRole.DOCTOR) {
      const doctor = await Doctor.findOne({ userId: (user as any)._id });
      if (doctor && appointment.doctorId.toString() === (doctor as any)._id.toString()) {
        canReschedule = true;
        rescheduledBy = 'doctor';
      }
    } else if (user.role === UserRole.CUSTOMER) {
      const customer = await Customer.findOne({ userId: (user as any)._id });
      if (customer && appointment.customerId.toString() === (customer as any)._id.toString()) {
        canReschedule = appointment.status === AppointmentStatus.CONFIRMED; // Same rules as cancellation
        rescheduledBy = 'customer';
      }
    }

    if (!canReschedule) {
      return res.status(403).json({ error: 'Cannot reschedule this appointment' });
    }

    const newScheduledDate = new Date(newDate);
    const newScheduledEndTime = newEndTime ? new Date(newEndTime) : new Date(newScheduledDate.getTime() + 60 * 60000); // Default 60 minutes

    if (newScheduledDate <= new Date()) {
      return res.status(400).json({ error: 'New appointment date must be in the future' });
    }

    // Check for conflicts
    const conflictingAppointment = await Appointment.findOne({
      _id: { $ne: id },
      doctorId: appointment.doctorId,
      status: { $in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING] },
      $or: [
        {
          scheduledDate: { $lte: newScheduledDate },
          scheduledEndTime: { $gt: newScheduledDate }
        },
        {
          scheduledDate: { $lt: newScheduledEndTime },
          scheduledEndTime: { $gte: newScheduledEndTime }
        },
        {
          scheduledDate: { $gte: newScheduledDate },
          scheduledEndTime: { $lte: newScheduledEndTime }
        }
      ]
    });

    if (conflictingAppointment) {
      return res.status(409).json({ error: 'Doctor is not available at the new time' });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      {
        scheduledDate: newScheduledDate,
        scheduledEndTime: newScheduledEndTime,
        status: AppointmentStatus.RESCHEDULED,
        $push: {
          rescheduling: {
            previousDate: appointment.scheduledDate,
            rescheduledBy,
            rescheduledAt: new Date(),
            reason
          }
        },
        updatedAt: new Date()
      },
      { new: true }
    ).populate([
      {
        path: 'customerId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email profileImageUrl'
        }
      },
      {
        path: 'doctorId',
        populate: [
          {
            path: 'userId',
            select: 'firstName lastName email profileImageUrl'
          },
          {
            path: 'specialtyIds',
            select: 'name nameEn icon'
          }
        ]
      }
    ]);

    res.json(updatedAppointment);

  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({ error: 'Failed to reschedule appointment' });
  }
});

// GET /api/appointments/stats/overview - Get appointment statistics (temporarily no auth for development)
router.get('/stats/overview', async (req: Request, res: Response) => {
  // TODO: Re-enable authentication: requireAuth, requireRole([UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN])
  try {
    const stats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$payment.amount' }
        }
      }
    ]);

    const totalAppointments = await Appointment.countDocuments();
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyStats = await Appointment.aggregate([
      { $match: { createdAt: { $gte: thisMonth } } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          revenue: { $sum: '$payment.amount' }
        }
      }
    ]);

    const paymentStats = await Appointment.aggregate([
      {
        $group: {
          _id: '$payment.status',
          count: { $sum: 1 },
          amount: { $sum: '$payment.amount' }
        }
      }
    ]);

    res.json({
      totalAppointments,
      monthlyAppointments: monthlyStats[0]?.count || 0,
      monthlyRevenue: monthlyStats[0]?.revenue || 0,
      statusBreakdown: stats,
      paymentBreakdown: paymentStats
    });

  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/appointments/customer - Get appointments for authenticated customer
router.get('/customer', requireAuth, populateUser, requireRole([UserRole.CUSTOMER]), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const customer = await Customer.findOne({ userId: (user as any)._id });
    if (!customer) {
      return res.status(404).json({ error: 'Customer profile not found' });
    }

    const {
      status,
      limit = '20',
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const filter: any = { customerId: (customer as any)._id };
    
    if (status) {
      filter.status = status;
    }

    // Build sort object
    const sort: any = {};
    switch (sortBy) {
      case 'date':
        sort.scheduledDate = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'created':
        sort.createdAt = sortOrder === 'asc' ? 1 : -1;
        break;
      default:
        sort.scheduledDate = -1;
    }

    const appointments = await Appointment.find(filter)
      .populate({
        path: 'doctorId',
        populate: [
          {
            path: 'userId',
            select: 'firstName lastName email'
          },
          {
            path: 'specialtyIds',
            select: 'name nameEn'
          }
        ],
        select: 'userId specialtyIds location contactInfo rating'
      })
      .sort(sort)
      .limit(parseInt(limit as string))
      .lean();

    res.json({
      appointments,
      total: appointments.length
    });

  } catch (error) {
    console.error('Error fetching customer appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// GET /api/appointments/customer/history - Get appointment history for authenticated customer
router.get('/customer/history', requireAuth, populateUser, requireRole([UserRole.CUSTOMER]), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const customer = await Customer.findOne({ userId: (user as any)._id });
    if (!customer) {
      return res.status(404).json({ error: 'Customer profile not found' });
    }

    const filter: any = {
      customerId: (customer as any)._id,
      status: { $in: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] }
    };

    const appointments = await Appointment.find(filter)
      .populate({
        path: 'doctorId',
        populate: [
          {
            path: 'userId',
            select: 'firstName lastName email'
          },
          {
            path: 'specialtyIds',
            select: 'name nameEn'
          }
        ],
        select: 'userId specialtyIds location rating'
      })
      .sort({ scheduledDate: -1 })
      .limit(50)
      .lean();

    res.json({
      appointments,
      total: appointments.length
    });

  } catch (error) {
    console.error('Error fetching appointment history:', error);
    res.status(500).json({ error: 'Failed to fetch appointment history' });
  }
});

export default router;