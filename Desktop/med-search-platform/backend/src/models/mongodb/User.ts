import { Schema, model, Document } from 'mongoose';

// User roles enum
export enum UserRole {
  CUSTOMER = 'customer',
  DOCTOR = 'doctor',
  COMPANY_ADMIN = 'company_admin',
  SUPER_ADMIN = 'super_admin'
}

// User interface
export interface IUser extends Document {
  clerkUserId: string; // Clerk user ID for authentication
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  phoneNumber?: string;
  profileImageUrl?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: Date;
  metadata?: Record<string, any>; // Additional user metadata
  createdAt: Date;
  updatedAt: Date;
}

// User schema
const UserSchema = new Schema<IUser>({
  clerkUserId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.CUSTOMER,
    index: true
  },
  phoneNumber: {
    type: String,
    sparse: true // Allows null values while maintaining uniqueness
  },
  profileImageUrl: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLoginAt: {
    type: Date
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for performance
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ createdAt: -1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.username;
});

// Method to sync with Clerk data
UserSchema.methods.syncWithClerk = async function(clerkUser: any) {
  this.email = clerkUser.emailAddresses[0]?.emailAddress || this.email;
  this.firstName = clerkUser.firstName || this.firstName;
  this.lastName = clerkUser.lastName || this.lastName;
  this.profileImageUrl = clerkUser.imageUrl || this.profileImageUrl;
  this.isVerified = clerkUser.emailAddresses[0]?.verification?.status === 'verified';
  this.lastLoginAt = new Date();
  await this.save();
};

// Static method to create or update from Clerk webhook
UserSchema.statics.createOrUpdateFromClerk = async function(clerkUser: any, role: UserRole = UserRole.CUSTOMER) {
  const email = clerkUser.emailAddresses[0]?.emailAddress;
  const username = clerkUser.username || email.split('@')[0];
  
  const userData = {
    clerkUserId: clerkUser.id,
    email,
    username,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    profileImageUrl: clerkUser.imageUrl,
    isVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
    role
  };

  return await this.findOneAndUpdate(
    { clerkUserId: clerkUser.id },
    userData,
    { upsert: true, new: true }
  );
};

export const User = model<IUser>('User', UserSchema);