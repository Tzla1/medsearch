import { Schema, model, Document, Types } from 'mongoose';

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled'
}

export enum AppointmentType {
  CONSULTATION = 'consultation',
  FOLLOW_UP = 'follow_up',
  EMERGENCY = 'emergency',
  PREVENTIVE = 'preventive',
  PROCEDURE = 'procedure',
  TELEMEDICINE = 'telemedicine'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  REFUNDED = 'refunded',
  FAILED = 'failed'
}

export interface IAppointment extends Document {
  customerId: Types.ObjectId; // Reference to Customer model
  doctorId: Types.ObjectId; // Reference to Doctor model
  appointmentType: AppointmentType;
  scheduledDate: Date;
  scheduledEndTime: Date;
  status: AppointmentStatus;
  reasonForVisit: string;
  symptoms?: string[];
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
  diagnosis?: string;
  prescriptions?: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes?: string;
  }[];
  labTests?: {
    testName: string;
    status: 'ordered' | 'completed' | 'pending';
    results?: string;
    orderedDate: Date;
  }[];
  doctorNotes?: string;
  patientNotes?: string;
  followUpRequired: boolean;
  followUpDate?: Date;
  payment: {
    amount: number;
    status: PaymentStatus;
    method?: string;
    transactionId?: string;
    paidAt?: Date;
    insuranceClaim?: {
      claimNumber: string;
      amountCovered: number;
      status: string;
    };
  };
  cancellation?: {
    cancelledBy: 'customer' | 'doctor' | 'system';
    cancelledAt: Date;
    reason: string;
    refundAmount?: number;
  };
  rescheduling?: {
    previousDate: Date;
    rescheduledBy: 'customer' | 'doctor';
    rescheduledAt: Date;
    reason: string;
  }[];
  remindersSent: {
    type: 'email' | 'sms' | 'push';
    sentAt: Date;
  }[];
  checkIn?: {
    time: Date;
    method: 'online' | 'in_person';
  };
  checkOut?: {
    time: Date;
    satisfactionRating?: number;
  };
  attachments?: {
    type: string;
    url: string;
    uploadedBy: 'customer' | 'doctor';
    uploadedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
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
  appointmentType: {
    type: String,
    enum: Object.values(AppointmentType),
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true,
    index: true
  },
  scheduledEndTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(AppointmentStatus),
    default: AppointmentStatus.PENDING,
    index: true
  },
  reasonForVisit: {
    type: String,
    required: true,
    maxlength: 500
  },
  symptoms: [String],
  vitalSigns: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number
  },
  diagnosis: {
    type: String,
    maxlength: 1000
  },
  prescriptions: [{
    medication: {
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
    duration: {
      type: String,
      required: true
    },
    notes: String
  }],
  labTests: [{
    testName: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['ordered', 'completed', 'pending'],
      default: 'ordered'
    },
    results: String,
    orderedDate: {
      type: Date,
      default: Date.now
    }
  }],
  doctorNotes: {
    type: String,
    maxlength: 2000
  },
  patientNotes: {
    type: String,
    maxlength: 1000
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  payment: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING
    },
    method: String,
    transactionId: String,
    paidAt: Date,
    insuranceClaim: {
      claimNumber: String,
      amountCovered: Number,
      status: String
    }
  },
  cancellation: {
    cancelledBy: {
      type: String,
      enum: ['customer', 'doctor', 'system']
    },
    cancelledAt: Date,
    reason: String,
    refundAmount: Number
  },
  rescheduling: [{
    previousDate: {
      type: Date,
      required: true
    },
    rescheduledBy: {
      type: String,
      enum: ['customer', 'doctor'],
      required: true
    },
    rescheduledAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }],
  remindersSent: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push']
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  }],
  checkIn: {
    time: Date,
    method: {
      type: String,
      enum: ['online', 'in_person']
    }
  },
  checkOut: {
    time: Date,
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  attachments: [{
    type: String,
    url: String,
    uploadedBy: {
      type: String,
      enum: ['customer', 'doctor']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for performance
AppointmentSchema.index({ customerId: 1, scheduledDate: -1 });
AppointmentSchema.index({ doctorId: 1, scheduledDate: 1, status: 1 });
AppointmentSchema.index({ status: 1, scheduledDate: 1 });
AppointmentSchema.index({ 'payment.status': 1, createdAt: -1 });

// Virtual for duration in minutes
AppointmentSchema.virtual('durationMinutes').get(function() {
  if (!this.scheduledDate || !this.scheduledEndTime) return 0;
  return Math.round((this.scheduledEndTime.getTime() - this.scheduledDate.getTime()) / 60000);
});

// Method to check if appointment can be cancelled
AppointmentSchema.methods.canBeCancelled = function(): boolean {
  const now = new Date();
  const hoursBefore = (this.scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return this.status === AppointmentStatus.CONFIRMED && hoursBefore >= 24;
};

// Method to calculate refund amount
AppointmentSchema.methods.calculateRefund = function(): number {
  if (!this.canBeCancelled()) return 0;
  
  const now = new Date();
  const hoursBefore = (this.scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursBefore >= 48) return this.payment.amount; // Full refund
  if (hoursBefore >= 24) return this.payment.amount * 0.5; // 50% refund
  return 0;
};

// Method to send reminder
AppointmentSchema.methods.sendReminder = async function(type: 'email' | 'sms' | 'push') {
  this.remindersSent.push({
    type,
    sentAt: new Date()
  });
  await this.save();
};

export const Appointment = model<IAppointment>('Appointment', AppointmentSchema);