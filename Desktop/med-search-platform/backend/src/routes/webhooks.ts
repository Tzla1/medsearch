import express from 'express';
import { Request, Response } from 'express';
import { Webhook } from 'svix';
import { User, UserRole } from '../models/mongodb/User';

const router = express.Router();

// Clerk webhook endpoint
router.post('/clerk', 
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    try {
      const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
      
      if (!webhookSecret) {
        console.error('Missing CLERK_WEBHOOK_SECRET');
        return res.status(500).json({ error: 'Webhook configuration error' });
      }

      // Get the headers
      const svix_id = req.headers['svix-id'] as string;
      const svix_timestamp = req.headers['svix-timestamp'] as string;
      const svix_signature = req.headers['svix-signature'] as string;

      // If there are no headers, error out
      if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).json({ error: 'Error occurred -- no svix headers' });
      }

      const body = req.body;
      const wh = new Webhook(webhookSecret);
      
      let evt: any;

      try {
        evt = wh.verify(body, {
          'svix-id': svix_id,
          'svix-timestamp': svix_timestamp,
          'svix-signature': svix_signature,
        });
      } catch (err) {
        console.error('Error verifying webhook:', err);
        return res.status(400).json({ error: 'Error occurred' });
      }

      // Handle different webhook events
      switch (evt.type) {
        case 'user.created':
          await handleUserCreated(evt);
          break;
          
        case 'user.updated':
          await handleUserUpdated(evt);
          break;
          
        case 'user.deleted':
          await handleUserDeleted(evt);
          break;
          
        case 'session.created':
          await handleSessionCreated(evt);
          break;
          
        default:
          console.log(`Unhandled webhook event: ${evt.type}`);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

// Handle user creation
async function handleUserCreated(event: any) {
  try {
    console.log('Processing user.created webhook:', event.data.id);
    
    const clerkUser = event.data;
    
    // Determine user role based on email domain or metadata
    let userRole = UserRole.CUSTOMER;
    const email = clerkUser.email_addresses[0]?.email_address;
    const metadataRole = clerkUser.unsafe_metadata?.role || clerkUser.public_metadata?.role;
    
    if (metadataRole) {
      userRole = metadataRole as UserRole;
    } else if (email?.endsWith('@medsearch-doctors.com')) {
      userRole = UserRole.DOCTOR;
    } else if (email?.endsWith('@medsearch-admin.com')) {
      userRole = UserRole.COMPANY_ADMIN;
    }
    
    // Create user in MongoDB
    const userData = {
      clerkUserId: clerkUser.id,
      email: email,
      username: clerkUser.username || email.split('@')[0],
      firstName: clerkUser.first_name,
      lastName: clerkUser.last_name,
      role: userRole,
      profileImageUrl: clerkUser.image_url,
      isVerified: clerkUser.email_addresses[0]?.verification?.status === 'verified',
      isActive: true,
      lastLoginAt: new Date()
    };

    const user = await User.findOneAndUpdate(
      { clerkUserId: clerkUser.id },
      userData,
      { upsert: true, new: true }
    );
    
    console.log(`User created: ${user.email} with role: ${user.role}`);
  } catch (error) {
    console.error('Error handling user.created:', error);
    throw error;
  }
}

// Handle user updates
async function handleUserUpdated(event: any) {
  try {
    console.log('Processing user.updated webhook:', event.data.id);
    
    const clerkUser = event.data;
    const email = clerkUser.email_addresses[0]?.email_address;
    
    const updateData = {
      email: email,
      firstName: clerkUser.first_name,
      lastName: clerkUser.last_name,
      profileImageUrl: clerkUser.image_url,
      isVerified: clerkUser.email_addresses[0]?.verification?.status === 'verified',
      updatedAt: new Date()
    };

    await User.findOneAndUpdate(
      { clerkUserId: clerkUser.id },
      updateData
    );
    
    console.log(`User updated: ${clerkUser.id}`);
  } catch (error) {
    console.error('Error handling user.updated:', error);
    throw error;
  }
}

// Handle user deletion
async function handleUserDeleted(event: any) {
  try {
    console.log('Processing user.deleted webhook:', event.data.id);
    
    // Soft delete - mark as inactive instead of hard delete
    await User.findOneAndUpdate(
      { clerkUserId: event.data.id },
      { 
        isActive: false,
        updatedAt: new Date()
      }
    );
    
    console.log(`User deactivated: ${event.data.id}`);
  } catch (error) {
    console.error('Error handling user.deleted:', error);
    throw error;
  }
}

// Handle session creation (for tracking last login)
async function handleSessionCreated(event: any) {
  try {
    console.log('Processing session.created webhook for user:', event.data.user_id);
    
    await User.findOneAndUpdate(
      { clerkUserId: event.data.user_id },
      { 
        lastLoginAt: new Date(),
        updatedAt: new Date()
      }
    );
    
    console.log(`Session created for user: ${event.data.user_id}`);
  } catch (error) {
    console.error('Error handling session.created:', error);
    // Don't throw error for session events as they're not critical
  }
}

export default router;