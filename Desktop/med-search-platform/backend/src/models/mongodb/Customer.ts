import { Schema, model, Document, Types } from 'mongoose';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say'
}

export interface IMedicalHistory {
  condition: string;
  diagnosedDate?: Date;
  notes?: string;
  isCurrent: boolean;
}

export interface IEmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
}

export interface ICustomer extends Document {
  userId: Types.ObjectId; // Reference to User model
  dateOfBirth: Date;
  gender: Gender;
  bloodType?: string;
  allergies: string[];
  chronicConditions: IMedicalHistory[];
  currentMedications: {
    name: string;
    dosage: string;
    frequency: string;
    startDate: Date;
  }[];
  emergencyContact: IEmergencyContact;
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
    expiryDate?: Date;
  };
  preferredLanguage: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  favoritesDoctors: Types.ObjectId[]; // References to Doctor model
  searchHistory: {
    query: string;
    specialty?: string;
    location?: string;
    timestamp: Date;
  }[];
  appointmentPreferences: {
    preferredDays: number[]; // 0-6 (Sunday to Saturday)
    preferredTimeSlots: {
      start: string; // HH:MM format
      end: string;
    }[];
    notificationAdvanceTime: number; // minutes before appointment
  };
  privacySettings: {
    shareDataWithDoctor: boolean;
    allowMarketingEmails: boolean;
    allowSmsNotifications: boolean;
  };
  healthGoals?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: Object.values(Gender),
    required: true
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  allergies: [{
    type: String,
    trim: true
  }],
  chronicConditions: [{
    condition: {
      type: String,
      required: true
    },
    diagnosedDate: Date,
    notes: String,
    isCurrent: {
      type: Boolean,
      default: true
    }
  }],
  currentMedications: [{
    name: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    }
  }],
  emergencyContact: {
    name: {
      type: String,
      required: true
    },
    relationship: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    email: String
  },
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    expiryDate: Date
  },
  preferredLanguage: {
    type: String,
    default: 'es',
    enum: ['es', 'en', 'pt', 'fr']
  },
  address: {
    street: String,
    city: {
      type: String,
      index: true
    },
    state: {
      type: String,
      index: true
    },
    country: {
      type: String,
      default: 'Mexico'
    },
    zipCode: String
  },
  favoritesDoctors: [{
    type: Schema.Types.ObjectId,
    ref: 'Doctor'
  }],
  searchHistory: [{
    query: {
      type: String,
      required: true
    },
    specialty: String,
    location: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  appointmentPreferences: {
    preferredDays: [{
      type: Number,
      min: 0,
      max: 6
    }],
    preferredTimeSlots: [{
      start: {
        type: String,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      },
      end: {
        type: String,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      }
    }],
    notificationAdvanceTime: {
      type: Number,
      default: 60 // 1 hour in minutes
    }
  },
  privacySettings: {
    shareDataWithDoctor: {
      type: Boolean,
      default: true
    },
    allowMarketingEmails: {
      type: Boolean,
      default: false
    },
    allowSmsNotifications: {
      type: Boolean,
      default: true
    }
  },
  healthGoals: [String],
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes
CustomerSchema.index({ 'address.city': 1, 'address.state': 1 });
CustomerSchema.index({ dateOfBirth: 1 });
CustomerSchema.index({ 'searchHistory.timestamp': -1 });

// Virtual for age
CustomerSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Method to add search to history
CustomerSchema.methods.addSearchToHistory = async function(query: string, specialty?: string, location?: string) {
  // Keep only last 50 searches
  if (this.searchHistory.length >= 50) {
    this.searchHistory = this.searchHistory.slice(-49);
  }
  
  this.searchHistory.push({
    query,
    specialty,
    location,
    timestamp: new Date()
  });
  
  await this.save();
};

// Method to toggle favorite doctor
CustomerSchema.methods.toggleFavoriteDoctor = async function(doctorId: Types.ObjectId) {
  const index = this.favoritesDoctors.findIndex(
    (id: Types.ObjectId) => id.toString() === doctorId.toString()
  );
  
  if (index > -1) {
    this.favoritesDoctors.splice(index, 1);
  } else {
    this.favoritesDoctors.push(doctorId);
  }
  
  await this.save();
};

export const Customer = model<ICustomer>('Customer', CustomerSchema);