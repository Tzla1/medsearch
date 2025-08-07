import express from 'express';
import { Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/clerkAuth';
import { Review, ReviewStatus } from '../models/mongodb/Review';
import { Doctor } from '../models/mongodb/Doctor';
import { Customer } from '../models/mongodb/Customer';
import { Appointment, AppointmentStatus } from '../models/mongodb/Appointment';
import { User, UserRole } from '../models/mongodb/User';
import { Types } from 'mongoose';

const router = express.Router();

// Interface for query parameters
interface ReviewsQueryParams {
  page?: string;
  limit?: string;
  doctorId?: string;
  customerId?: string;
  status?: ReviewStatus;
  rating?: string;
  minRating?: string;
  maxRating?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'date' | 'rating' | 'helpful';
  sortOrder?: 'asc' | 'desc';
  flagged?: string;
}

// GET /api/reviews - List reviews with filtering and pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '10',
      doctorId,
      customerId,
      status = ReviewStatus.APPROVED,
      rating,
      minRating,
      maxRating,
      dateFrom,
      dateTo,
      sortBy = 'date',
      sortOrder = 'desc',
      flagged
    } = req.query as ReviewsQueryParams;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter: any = {};

    // Default to approved reviews for public view
    if (status) {
      filter.status = status;
    }

    if (doctorId && Types.ObjectId.isValid(doctorId)) {
      filter.doctorId = new Types.ObjectId(doctorId);
    }

    if (customerId && Types.ObjectId.isValid(customerId)) {
      filter.customerId = new Types.ObjectId(customerId);
    }

    if (rating) {
      filter.rating = parseInt(rating);
    }

    if (minRating || maxRating) {
      filter.rating = {};
      if (minRating) {
        filter.rating.$gte = parseInt(minRating);
      }
      if (maxRating) {
        filter.rating.$lte = parseInt(maxRating);
      }
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.createdAt.$lte = new Date(dateTo);
      }
    }

    if (flagged === 'true') {
      filter['flags.0'] = { $exists: true };
      filter['flags.resolved'] = false;
    }

    // Build sort object
    const sort: any = {};
    switch (sortBy) {
      case 'date':
        sort.createdAt = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'rating':
        sort.rating = sortOrder === 'asc' ? 1 : -1;
        sort.createdAt = -1; // Secondary sort
        break;
      case 'helpful':
        sort['helpful.count'] = sortOrder === 'asc' ? 1 : -1;
        sort.createdAt = -1; // Secondary sort
        break;
      default:
        sort.createdAt = -1;
    }

    // Execute query with population
    const reviews = await Review.find(filter)
      .populate({
        path: 'customerId',
        populate: {
          path: 'userId',
          select: 'firstName lastName profileImageUrl'
        }
      })
      .populate({
        path: 'doctorId',
        populate: [
          {
            path: 'userId',
            select: 'firstName lastName'
          },
          {
            path: 'specialtyIds',
            select: 'name nameEn icon'
          }
        ]
      })
      .populate({
        path: 'appointmentId',
        select: 'scheduledDate appointmentType'
      })
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Review.countDocuments(filter);

    res.json({
      reviews,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// GET /api/reviews/:id - Get single review details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid review ID' });
    }

    const review = await Review.findById(id)
      .populate({
        path: 'customerId',
        populate: {
          path: 'userId',
          select: 'firstName lastName profileImageUrl'
        }
      })
      .populate({
        path: 'doctorId',
        populate: [
          {
            path: 'userId',
            select: 'firstName lastName'
          },
          {
            path: 'specialtyIds',
            select: 'name nameEn icon description'
          }
        ]
      })
      .populate({
        path: 'appointmentId',
        select: 'scheduledDate appointmentType reasonForVisit'
      })
      .lean();

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(review);

  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

// POST /api/reviews - Create new review (customer only, after completed appointment)
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
      appointmentId,
      rating,
      title,
      comment,
      aspects,
      wouldRecommend,
      images
    } = req.body;

    // Validate required fields
    if (!appointmentId || !rating || !title || !comment || !aspects || wouldRecommend === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ error: 'Invalid appointment ID' });
    }

    // Validate appointment exists and belongs to customer
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.customerId.toString() !== (customer as any)._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to review this appointment' });
    }

    if (appointment.status !== AppointmentStatus.COMPLETED) {
      return res.status(400).json({ error: 'Can only review completed appointments' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ appointmentId: new Types.ObjectId(appointmentId) });
    if (existingReview) {
      return res.status(409).json({ error: 'Review already exists for this appointment' });
    }

    // Validate aspects ratings
    const requiredAspects = ['punctuality', 'communication', 'treatment', 'facilities', 'overallExperience'];
    for (const aspect of requiredAspects) {
      if (!aspects[aspect] || aspects[aspect] < 1 || aspects[aspect] > 5) {
        return res.status(400).json({ error: `Invalid rating for ${aspect}` });
      }
    }

    const reviewData = {
      customerId: (customer as any)._id,
      doctorId: appointment.doctorId,
      appointmentId: new Types.ObjectId(appointmentId),
      rating,
      title,
      comment,
      aspects,
      wouldRecommend,
      visitDate: appointment.scheduledDate,
      isVerifiedAppointment: true,
      images: images || [],
      status: ReviewStatus.PENDING // Reviews need moderation
    };

    const review = new Review(reviewData);
    await review.save();

    // Populate for response
    await review.populate([
      {
        path: 'customerId',
        populate: {
          path: 'userId',
          select: 'firstName lastName profileImageUrl'
        }
      },
      {
        path: 'doctorId',
        populate: [
          {
            path: 'userId',
            select: 'firstName lastName'
          },
          {
            path: 'specialtyIds',
            select: 'name nameEn icon'
          }
        ]
      },
      {
        path: 'appointmentId',
        select: 'scheduledDate appointmentType'
      }
    ]);

    res.status(201).json(review);

  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// PUT /api/reviews/:id - Update review (customer only, within time limit)
router.put('/:id', requireAuth, requireRole([UserRole.CUSTOMER]), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).auth?.userId;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid review ID' });
    }

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

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if customer owns this review
    if (review.customerId.toString() !== (customer as any)._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this review' });
    }

    // Check if review is still editable (within 24 hours and not approved yet)
    const hoursSinceCreation = (new Date().getTime() - review.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24 || review.status === ReviewStatus.APPROVED) {
      return res.status(403).json({ error: 'Review can no longer be edited' });
    }

    const allowedUpdates = ['rating', 'title', 'comment', 'aspects', 'wouldRecommend', 'images'];
    const updates: any = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Validate aspects if being updated
    if (updates['aspects']) {
      const requiredAspects = ['punctuality', 'communication', 'treatment', 'facilities', 'overallExperience'];
      for (const aspect of requiredAspects) {
        if (!updates['aspects'][aspect] || updates['aspects'][aspect] < 1 || updates['aspects'][aspect] > 5) {
          return res.status(400).json({ error: `Invalid rating for ${aspect}` });
        }
      }
    }

    // Add to edit history if comment is being changed
    if (updates['comment'] && updates['comment'] !== review.comment) {
      if (!review.editHistory) {
        review.editHistory = [];
      }
      review.editHistory.push({
        previousComment: review.comment,
        editedAt: new Date()
      });
      review.isEdited = true;
    }

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate([
      {
        path: 'customerId',
        populate: {
          path: 'userId',
          select: 'firstName lastName profileImageUrl'
        }
      },
      {
        path: 'doctorId',
        populate: [
          {
            path: 'userId',
            select: 'firstName lastName'
          },
          {
            path: 'specialtyIds',
            select: 'name nameEn icon'
          }
        ]
      }
    ]);

    res.json(updatedReview);

  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// PUT /api/reviews/:id/helpful - Mark review as helpful/not helpful (authenticated users)
router.put('/:id/helpful', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isHelpful } = req.body;
    const userId = (req as any).auth?.userId;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid review ID' });
    }

    if (isHelpful === undefined) {
      return res.status(400).json({ error: 'isHelpful field is required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.status !== ReviewStatus.APPROVED) {
      return res.status(403).json({ error: 'Can only rate approved reviews' });
    }

    await (review as any).markHelpfulness((user as any)._id, isHelpful);

    const updatedReview = await Review.findById(id)
      .populate([
        {
          path: 'customerId',
          populate: {
            path: 'userId',
            select: 'firstName lastName profileImageUrl'
          }
        },
        {
          path: 'doctorId',
          populate: [
            {
              path: 'userId',
              select: 'firstName lastName'
            },
            {
              path: 'specialtyIds',
              select: 'name nameEn icon'
            }
          ]
        }
      ]);

    res.json(updatedReview);

  } catch (error) {
    console.error('Error marking review helpfulness:', error);
    res.status(500).json({ error: 'Failed to mark review helpfulness' });
  }
});

// POST /api/reviews/:id/respond - Doctor responds to review (doctor only)
router.post('/:id/respond', requireAuth, requireRole([UserRole.DOCTOR]), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = (req as any).auth?.userId;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid review ID' });
    }

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ error: 'Response comment is required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const doctor = await Doctor.findOne({ userId: (user as any)._id });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if doctor owns this review
    if (review.doctorId.toString() !== (doctor as any)._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to respond to this review' });
    }

    if (review.status !== ReviewStatus.APPROVED) {
      return res.status(403).json({ error: 'Can only respond to approved reviews' });
    }

    if (review.doctorResponse) {
      return res.status(409).json({ error: 'Doctor has already responded to this review' });
    }

    await (review as any).addDoctorResponse(comment.trim());

    const updatedReview = await Review.findById(id)
      .populate([
        {
          path: 'customerId',
          populate: {
            path: 'userId',
            select: 'firstName lastName profileImageUrl'
          }
        },
        {
          path: 'doctorId',
          populate: [
            {
              path: 'userId',
              select: 'firstName lastName'
            },
            {
              path: 'specialtyIds',
              select: 'name nameEn icon'
            }
          ]
        }
      ]);

    res.json(updatedReview);

  } catch (error) {
    console.error('Error adding doctor response:', error);
    res.status(500).json({ error: 'Failed to add doctor response' });
  }
});

// PUT /api/reviews/:id/approve - Approve review (admin only)
router.put('/:id/approve', requireAuth, requireRole([UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN]), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { moderationNotes } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid review ID' });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { 
        status: ReviewStatus.APPROVED,
        moderationNotes: moderationNotes || '',
        updatedAt: new Date() 
      },
      { new: true }
    ).populate([
      {
        path: 'customerId',
        populate: {
          path: 'userId',
          select: 'firstName lastName profileImageUrl'
        }
      },
      {
        path: 'doctorId',
        populate: [
          {
            path: 'userId',
            select: 'firstName lastName'
          },
          {
            path: 'specialtyIds',
            select: 'name nameEn icon'
          }
        ]
      }
    ]);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Update doctor's rating statistics
    const doctor = await Doctor.findById(review.doctorId);
    if (doctor) {
      await (doctor as any).updateRating(review.rating);
    }

    res.json({ message: 'Review approved successfully', review });

  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({ error: 'Failed to approve review' });
  }
});

// PUT /api/reviews/:id/reject - Reject review (admin only)
router.put('/:id/reject', requireAuth, requireRole([UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN]), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { moderationNotes } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid review ID' });
    }

    if (!moderationNotes || moderationNotes.trim().length === 0) {
      return res.status(400).json({ error: 'Moderation notes are required when rejecting a review' });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { 
        status: ReviewStatus.REJECTED,
        moderationNotes: moderationNotes.trim(),
        updatedAt: new Date() 
      },
      { new: true }
    ).populate([
      {
        path: 'customerId',
        populate: {
          path: 'userId',
          select: 'firstName lastName profileImageUrl'
        }
      },
      {
        path: 'doctorId',
        populate: [
          {
            path: 'userId',
            select: 'firstName lastName'
          },
          {
            path: 'specialtyIds',
            select: 'name nameEn icon'
          }
        ]
      }
    ]);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review rejected successfully', review });

  } catch (error) {
    console.error('Error rejecting review:', error);
    res.status(500).json({ error: 'Failed to reject review' });
  }
});

// POST /api/reviews/:id/flag - Flag review for moderation (authenticated users)
router.post('/:id/flag', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = (req as any).auth?.userId;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid review ID' });
    }

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: 'Flag reason is required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.status !== ReviewStatus.APPROVED) {
      return res.status(403).json({ error: 'Can only flag approved reviews' });
    }

    // Check if user already flagged this review
    const existingFlag = review.flags.find(flag => 
      flag.flaggedBy.toString() === (user as any)._id.toString() && !flag.resolved
    );

    if (existingFlag) {
      return res.status(409).json({ error: 'You have already flagged this review' });
    }

    await (review as any).flagReview((user as any)._id, reason.trim());

    res.json({ message: 'Review flagged successfully' });

  } catch (error) {
    console.error('Error flagging review:', error);
    res.status(500).json({ error: 'Failed to flag review' });
  }
});

// GET /api/reviews/doctor/:doctorId/stats - Get review statistics for a doctor
router.get('/doctor/:doctorId/stats', async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;

    if (!Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ error: 'Invalid doctor ID' });
    }

    const stats = await (Review as any).getDoctorStatistics(new Types.ObjectId(doctorId));
    res.json(stats);

  } catch (error) {
    console.error('Error fetching doctor review stats:', error);
    res.status(500).json({ error: 'Failed to fetch review statistics' });
  }
});

// GET /api/reviews/stats/overview - Get review statistics overview (temporarily no auth for development)
router.get('/stats/overview', async (req: Request, res: Response) => {
  // TODO: Re-enable authentication: requireAuth, requireRole([UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN])
  try {
    const stats = await Review.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    const totalReviews = await Review.countDocuments();
    const flaggedReviews = await Review.countDocuments({ 
      'flags.0': { $exists: true },
      'flags.resolved': false 
    });

    const ratingDistribution = await Review.aggregate([
      { $match: { status: ReviewStatus.APPROVED } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const aspectStats = await Review.aggregate([
      { $match: { status: ReviewStatus.APPROVED } },
      {
        $group: {
          _id: null,
          avgPunctuality: { $avg: '$aspects.punctuality' },
          avgCommunication: { $avg: '$aspects.communication' },
          avgTreatment: { $avg: '$aspects.treatment' },
          avgFacilities: { $avg: '$aspects.facilities' },
          avgOverallExperience: { $avg: '$aspects.overallExperience' }
        }
      }
    ]);

    res.json({
      totalReviews,
      flaggedReviews,
      statusBreakdown: stats,
      ratingDistribution,
      aspectAverages: aspectStats[0] || {}
    });

  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;