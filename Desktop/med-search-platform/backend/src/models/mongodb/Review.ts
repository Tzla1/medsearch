import { Schema, model, Document, Types } from 'mongoose';

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  FLAGGED = 'flagged',
  REJECTED = 'rejected'
}

export interface IReviewFlag {
  flaggedBy: Types.ObjectId; // Reference to CompanyAdmin
  reason: string;
  flaggedAt: Date;
  resolved: boolean;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
  resolution?: string;
}

export interface IReview extends Document {
  customerId: Types.ObjectId; // Reference to Customer model
  doctorId: Types.ObjectId; // Reference to Doctor model
  appointmentId: Types.ObjectId; // Reference to Appointment model
  rating: number;
  title: string;
  comment: string;
  aspects: {
    punctuality: number;
    communication: number;
    treatment: number;
    facilities: number;
    overallExperience: number;
  };
  wouldRecommend: boolean;
  visitDate: Date;
  isVerifiedAppointment: boolean;
  status: ReviewStatus;
  helpful: {
    count: number;
    users: Types.ObjectId[]; // Users who found it helpful
  };
  notHelpful: {
    count: number;
    users: Types.ObjectId[]; // Users who found it not helpful
  };
  doctorResponse?: {
    comment: string;
    respondedAt: Date;
  };
  flags: IReviewFlag[];
  moderationNotes?: string;
  isEdited: boolean;
  editHistory?: {
    previousComment: string;
    editedAt: Date;
  }[];
  images?: {
    url: string;
    caption?: string;
    uploadedAt: Date;
  }[];
  tags: string[]; // Auto-generated tags based on content
  sentiment?: {
    score: number; // -1 to 1
    magnitude: number;
    keywords: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
    index: true
  },
  appointmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true // One review per appointment
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },
  comment: {
    type: String,
    required: true,
    maxlength: 2000,
    trim: true
  },
  aspects: {
    punctuality: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    treatment: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    facilities: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    overallExperience: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  },
  wouldRecommend: {
    type: Boolean,
    required: true
  },
  visitDate: {
    type: Date,
    required: true
  },
  isVerifiedAppointment: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: Object.values(ReviewStatus),
    default: ReviewStatus.PENDING,
    index: true
  },
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  notHelpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  doctorResponse: {
    comment: {
      type: String,
      maxlength: 1000
    },
    respondedAt: Date
  },
  flags: [{
    flaggedBy: {
      type: Schema.Types.ObjectId,
      ref: 'CompanyAdmin',
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    flaggedAt: {
      type: Date,
      default: Date.now
    },
    resolved: {
      type: Boolean,
      default: false
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'CompanyAdmin'
    },
    resolvedAt: Date,
    resolution: String
  }],
  moderationNotes: {
    type: String,
    maxlength: 500
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    previousComment: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  sentiment: {
    score: {
      type: Number,
      min: -1,
      max: 1
    },
    magnitude: Number,
    keywords: [String]
  }
}, {
  timestamps: true
});

// Indexes
ReviewSchema.index({ doctorId: 1, rating: -1, status: 1 });
ReviewSchema.index({ customerId: 1, createdAt: -1 });
ReviewSchema.index({ status: 1, createdAt: -1 });
ReviewSchema.index({ 'flags.resolved': 1, status: 1 });
ReviewSchema.index({ visitDate: -1 });

// Virtual for average aspect rating
ReviewSchema.virtual('averageAspectRating').get(function() {
  const aspects = this.aspects;
  const sum = aspects.punctuality + aspects.communication + 
              aspects.treatment + aspects.facilities + aspects.overallExperience;
  return sum / 5;
});

// Method to mark as helpful/not helpful
ReviewSchema.methods.markHelpfulness = async function(userId: Types.ObjectId, isHelpful: boolean) {
  const helpfulArray = isHelpful ? this.helpful : this.notHelpful;
  const oppositeArray = isHelpful ? this.notHelpful : this.helpful;
  
  // Remove from opposite array if exists
  const oppositeIndex = oppositeArray.users.indexOf(userId);
  if (oppositeIndex > -1) {
    oppositeArray.users.splice(oppositeIndex, 1);
    oppositeArray.count = Math.max(0, oppositeArray.count - 1);
  }
  
  // Add to appropriate array if not already there
  if (!helpfulArray.users.includes(userId)) {
    helpfulArray.users.push(userId);
    helpfulArray.count += 1;
  }
  
  await this.save();
};

// Method to add doctor response
ReviewSchema.methods.addDoctorResponse = async function(comment: string) {
  this.doctorResponse = {
    comment,
    respondedAt: new Date()
  };
  await this.save();
};

// Method to flag review
ReviewSchema.methods.flagReview = async function(adminId: Types.ObjectId, reason: string) {
  this.flags.push({
    flaggedBy: adminId,
    reason,
    flaggedAt: new Date(),
    resolved: false
  });
  
  this.status = ReviewStatus.FLAGGED;
  await this.save();
};

// Static method to get review statistics for a doctor
ReviewSchema.statics.getDoctorStatistics = async function(doctorId: Types.ObjectId) {
  const stats = await this.aggregate([
    { $match: { doctorId, status: ReviewStatus.APPROVED } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        wouldRecommendCount: {
          $sum: { $cond: ['$wouldRecommend', 1, 0] }
        },
        avgPunctuality: { $avg: '$aspects.punctuality' },
        avgCommunication: { $avg: '$aspects.communication' },
        avgTreatment: { $avg: '$aspects.treatment' },
        avgFacilities: { $avg: '$aspects.facilities' },
        avgOverallExperience: { $avg: '$aspects.overallExperience' },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      recommendationRate: 0,
      aspects: {
        punctuality: 0,
        communication: 0,
        treatment: 0,
        facilities: 0,
        overallExperience: 0
      }
    };
  }

  const result = stats[0];
  const ratingCounts = [0, 0, 0, 0, 0];
  result.ratingDistribution.forEach((rating: number) => {
    ratingCounts[rating - 1]++;
  });

  return {
    averageRating: Math.round(result.averageRating * 10) / 10,
    totalReviews: result.totalReviews,
    recommendationRate: Math.round((result.wouldRecommendCount / result.totalReviews) * 100),
    aspects: {
      punctuality: Math.round(result.avgPunctuality * 10) / 10,
      communication: Math.round(result.avgCommunication * 10) / 10,
      treatment: Math.round(result.avgTreatment * 10) / 10,
      facilities: Math.round(result.avgFacilities * 10) / 10,
      overallExperience: Math.round(result.avgOverallExperience * 10) / 10
    },
    ratingDistribution: ratingCounts
  };
};

export const Review = model<IReview>('Review', ReviewSchema);