import express from 'express';
import { Request, Response } from 'express';
import { requireAuth, requireRole, populateUser } from '../middleware/clerkAuth';
import { Customer } from '../models/mongodb/Customer';
import { User, UserRole } from '../models/mongodb/User';

const router = express.Router();

// GET /api/customers/count - Get total customer count (development only, no auth)
router.get('/count', async (req: Request, res: Response) => {
  try {
    const count = await Customer.countDocuments({ isActive: true });
    res.json({ count });
  } catch (error) {
    console.error('Error getting customer count:', error);
    res.status(500).json({ error: 'Failed to get customer count' });
  }
});

// GET /api/customers - List customers (development only, no auth)
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '10'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const customers = await Customer.find({ isActive: true })
      .populate('userId', 'firstName lastName email')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Customer.countDocuments({ isActive: true });
    const pages = Math.ceil(total / limitNum);

    res.json({
      customers,
      pagination: {
        current: pageNum,
        pages,
        total,
        hasNext: pageNum < pages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET /api/customers/profile - Get authenticated customer profile
router.get('/profile', requireAuth, populateUser, requireRole([UserRole.CUSTOMER]), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const customer = await Customer.findOne({ userId: (user as any)._id })
      .populate('userId', 'firstName lastName email profileImageUrl createdAt lastLoginAt')
      .lean();

    if (!customer) {
      return res.status(404).json({ error: 'Customer profile not found' });
    }

    res.json({
      customer
    });

  } catch (error) {
    console.error('Error fetching customer profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/customers/profile - Update authenticated customer profile
router.put('/profile', requireAuth, populateUser, requireRole([UserRole.CUSTOMER]), async (req: Request, res: Response) => {
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

    const allowedUpdates = [
      'phoneNumber', 'dateOfBirth', 'gender', 'address', 'emergencyContact',
      'medicalInfo', 'preferences'
    ];

    const updates: any = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedCustomer = await Customer.findByIdAndUpdate(
      (customer as any)._id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName email profileImageUrl createdAt lastLoginAt');

    res.json({
      customer: updatedCustomer
    });

  } catch (error) {
    console.error('Error updating customer profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/customers/favorites - Add doctor to favorites
router.post('/favorites', requireAuth, populateUser, requireRole([UserRole.CUSTOMER]), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    const { doctorId } = req.body;

    if (!userId || !doctorId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const customer = await Customer.findOne({ userId: (user as any)._id });
    if (!customer) {
      return res.status(404).json({ error: 'Customer profile not found' });
    }

    // Check if doctor is already in favorites
    const favorites = customer.favoritesDoctors || [];
    if (favorites.includes(doctorId)) {
      return res.status(409).json({ error: 'Doctor already in favorites' });
    }

    await Customer.findByIdAndUpdate(
      (customer as any)._id,
      { $addToSet: { favoritesDoctors: doctorId } }
    );

    res.json({ message: 'Doctor added to favorites' });

  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

// GET /api/customers/favorites - Get customer's favorite doctors
router.get('/favorites', requireAuth, populateUser, requireRole([UserRole.CUSTOMER]), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const customer = await Customer.findOne({ userId: (user as any)._id })
      .populate({
        path: 'favoritesDoctors',
        populate: [
          {
            path: 'userId',
            select: 'firstName lastName email'
          },
          {
            path: 'specialtyIds',
            select: 'name nameEn'
          }
        ]
      });

    if (!customer) {
      return res.status(404).json({ error: 'Customer profile not found' });
    }

    res.json({
      favorites: customer.favoritesDoctors || []
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// DELETE /api/customers/favorites/:doctorId - Remove doctor from favorites
router.delete('/favorites/:doctorId', requireAuth, populateUser, requireRole([UserRole.CUSTOMER]), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    const { doctorId } = req.params;

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

    await Customer.findByIdAndUpdate(
      (customer as any)._id,
      { $pull: { favoritesDoctors: doctorId } }
    );

    res.json({ message: 'Doctor removed from favorites' });

  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

export default router;