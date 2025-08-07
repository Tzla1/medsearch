import { Request, Response, NextFunction } from 'express';
import { ClerkExpressWithAuth, ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { User, UserRole } from '../models/mongodb/User';
import { Types } from 'mongoose';

// Extend Express Request interface to include Clerk auth
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        sessionId: string;
        claims: any;
      };
      user?: {
        id: Types.ObjectId;
        clerkUserId: string;
        email: string;
        role: UserRole;
        isActive: boolean;
      };
    }
  }
}

// Initialize Clerk
const clerkWithAuth = ClerkExpressWithAuth();

const clerkRequireAuth = ClerkExpressRequireAuth();

// Middleware to optionally authenticate (doesn't fail if not authenticated)
export const withAuth = clerkWithAuth;

// Middleware to require authentication (fails if not authenticated)  
export const requireAuth = clerkRequireAuth;

// Middleware to populate user data from database
export const populateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.auth?.userId) {
      return next();
    }

    const user = await User.findOne({ 
      clerkUserId: req.auth.userId,
      isActive: true 
    });

    if (user) {
      req.user = {
        id: user._id as Types.ObjectId,
        clerkUserId: user.clerkUserId,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      };
    }

    next();
  } catch (error) {
    console.error('Error populating user:', error);
    next();
  }
};

// Middleware to require specific user role
export const requireRole = (roles: UserRole | UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

// Middleware to require customer role
export const requireCustomer = requireRole(UserRole.CUSTOMER);

// Middleware to require doctor role
export const requireDoctor = requireRole(UserRole.DOCTOR);

// Middleware to require company admin role
export const requireCompanyAdmin = requireRole([UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN]);

// Middleware to require super admin role
export const requireSuperAdmin = requireRole(UserRole.SUPER_ADMIN);

// Middleware for webhook signature verification
export const verifyWebhookSignature = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers['svix-signature'] as string;
  const timestamp = req.headers['svix-timestamp'] as string;
  const id = req.headers['svix-id'] as string;

  if (!signature || !timestamp || !id) {
    return res.status(400).json({ 
      error: 'Missing webhook signature headers' 
    });
  }

  // Store headers for webhook processing
  req.webhookHeaders = {
    signature,
    timestamp,
    id
  };

  next();
};

// Helper function to sync user data with Clerk
export const syncUserWithClerk = async (clerkUserId: string, clerkUserData: any) => {
  try {
    const user = await User.findOne({ clerkUserId });
    
    if (user) {
      // Update user with Clerk data
      Object.assign(user, {
        email: clerkUserData.email_addresses?.[0]?.email_address || user.email,
        firstName: clerkUserData.first_name || user.firstName,
        lastName: clerkUserData.last_name || user.lastName,
        profileImageUrl: clerkUserData.profile_image_url || user.profileImageUrl,
        lastLoginAt: new Date()
      });
      await user.save();
      return user;
    } else {
      // Create new user from Clerk data
      const newUser = new User({
        clerkUserId: clerkUserId,
        email: clerkUserData.email_addresses?.[0]?.email_address,
        username: clerkUserData.username || clerkUserData.email_addresses?.[0]?.email_address,
        firstName: clerkUserData.first_name,
        lastName: clerkUserData.last_name,
        role: UserRole.CUSTOMER,
        profileImageUrl: clerkUserData.profile_image_url,
        isActive: true,
        isVerified: clerkUserData.email_addresses?.[0]?.verification?.status === 'verified' || false,
        lastLoginAt: new Date()
      });
      return await newUser.save();
    }
  } catch (error) {
    console.error('Error syncing user with Clerk:', error);
    throw error;
  }
};

// Middleware to handle rate limiting for authenticated users
export const rateLimitByUser = (req: Request, res: Response, next: NextFunction) => {
  // Use user ID for rate limiting key instead of IP
  if (req.user) {
    req.rateLimitKey = `user:${req.user.clerkUserId}`;
  } else {
    req.rateLimitKey = `ip:${req.ip}`;
  }
  next();
};

// Error handler for Clerk authentication errors
export const handleClerkError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error.name === 'ClerkError') {
    return res.status(401).json({
      error: 'Authentication failed',
      code: 'CLERK_ERROR',
      details: error.message
    });
  }
  next(error);
};

// Utility function to get current user with full profile
export const getCurrentUser = async (clerkUserId: string) => {
  return await User.findOne({ 
    clerkUserId, 
    isActive: true 
  }).select('-__v');
};

// Types for webhook events
export interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      verification: {
        status: string;
      };
    }>;
    first_name?: string;
    last_name?: string;
    username?: string;
    image_url?: string;
    created_at: number;
    updated_at: number;
  };
}

// Extend Request interface for webhook headers
declare global {
  namespace Express {
    interface Request {
      webhookHeaders?: {
        signature: string;
        timestamp: string;
        id: string;
      };
      rateLimitKey?: string;
    }
  }
}