import { Schema, model, Document, Types } from 'mongoose';

export enum DoctorStatus {
  PENDING_VERIFICATION = 'pending_verification',
  VERIFIED = 'verified',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected'
}

export interface IAvailabilitySlot {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isActive: boolean;
}

export interface IDoctor extends Document {
  userId: Types.ObjectId; // Reference to User model
  licenseNumber: string;
  specialtyIds: Types.ObjectId[]; // References to Specialty model
  education: {
    degree: string;
    institution: string;
    year: number;
  }[];
  experience: {
    position: string;
    institution: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
  }[];
  consultationFee: number;
  consultationDuration: number; // in minutes
  languages: string[];
  about: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  availability: IAvailabilitySlot[];
  status: DoctorStatus;
  verificationDocuments: {
    type: string;
    url: string;
    uploadedAt: Date;
    verifiedAt?: Date;
  }[];
  ratings: {
    average: number;
    count: number;
  };
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  nextAvailableSlot?: Date;
  insuranceAccepted: string[];
  tags: string[]; // Additional searchable tags
  isAvailableForEmergency: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  specialtyIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Specialty',
    required: true
  }],
  education: [{
    degree: {
      type: String,
      required: true
    },
    institution: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  }],
  experience: [{
    position: {
      type: String,
      required: true
    },
    institution: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    current: {
      type: Boolean,
      default: false
    }
  }],
  consultationFee: {
    type: Number,
    required: true,
    min: 0
  },
  consultationDuration: {
    type: Number,
    required: true,
    default: 30,
    min: 15
  },
  languages: [{
    type: String,
    required: true
  }],
  about: {
    type: String,
    required: true,
    maxlength: 1000
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true,
      index: true
    },
    state: {
      type: String,
      required: true,
      index: true
    },
    country: {
      type: String,
      required: true,
      default: 'Mexico'
    },
    zipCode: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  availability: [{
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  status: {
    type: String,
    enum: Object.values(DoctorStatus),
    default: DoctorStatus.PENDING_VERIFICATION,
    index: true
  },
  verificationDocuments: [{
    type: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verifiedAt: Date
  }],
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  totalAppointments: {
    type: Number,
    default: 0
  },
  completedAppointments: {
    type: Number,
    default: 0
  },
  cancelledAppointments: {
    type: Number,
    default: 0
  },
  nextAvailableSlot: Date,
  insuranceAccepted: [String],
  tags: [String],
  isAvailableForEmergency: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for search and performance
DoctorSchema.index({ 'address.city': 1, 'address.state': 1, status: 1 });
DoctorSchema.index({ specialtyIds: 1, status: 1 });
DoctorSchema.index({ 'ratings.average': -1, status: 1 });
DoctorSchema.index({ consultationFee: 1, status: 1 });
DoctorSchema.index({ tags: 1 });
DoctorSchema.index({ 'address.coordinates': '2dsphere' }); // For geospatial queries

// Virtual for years of experience
DoctorSchema.virtual('yearsOfExperience').get(function() {
  if (!this.experience || this.experience.length === 0) return 0;
  
  const firstJob = this.experience.reduce((oldest, job) => {
    return job.startDate < oldest.startDate ? job : oldest;
  });
  
  return new Date().getFullYear() - new Date(firstJob.startDate).getFullYear();
});

// Method to calculate next available slot
DoctorSchema.methods.calculateNextAvailableSlot = async function() {
  // Implementation would check against appointments collection
  // This is a placeholder
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  
  this.nextAvailableSlot = tomorrow;
  await this.save();
};

// Method to update rating
DoctorSchema.methods.updateRating = async function(newRating: number) {
  const currentTotal = this.ratings.average * this.ratings.count;
  this.ratings.count += 1;
  this.ratings.average = (currentTotal + newRating) / this.ratings.count;
  await this.save();
};

export const Doctor = model<IDoctor>('Doctor', DoctorSchema);