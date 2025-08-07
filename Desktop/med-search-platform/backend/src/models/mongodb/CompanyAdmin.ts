import { Schema, model, Document, Types } from 'mongoose';

export enum AdminPermission {
  MANAGE_DOCTORS = 'manage_doctors',
  MANAGE_CUSTOMERS = 'manage_customers',
  MANAGE_APPOINTMENTS = 'manage_appointments',
  VIEW_REPORTS = 'view_reports',
  MANAGE_SPECIALTIES = 'manage_specialties',
  MANAGE_REVIEWS = 'manage_reviews',
  MANAGE_BILLING = 'manage_billing',
  MANAGE_ADMINS = 'manage_admins',
  SYSTEM_SETTINGS = 'system_settings',
  ALL = 'all'
}

export enum AdminLevel {
  JUNIOR = 'junior',
  SENIOR = 'senior',
  MANAGER = 'manager',
  DIRECTOR = 'director'
}

export interface IActivityLog {
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
}

export interface ICompanyAdmin extends Document {
  userId: Types.ObjectId; // Reference to User model
  employeeId: string;
  department: string;
  level: AdminLevel;
  permissions: AdminPermission[];
  isActive: boolean;
  activeSince: Date;
  deactivatedAt?: Date;
  supervisor?: Types.ObjectId; // Reference to another CompanyAdmin
  subordinates: Types.ObjectId[]; // References to other CompanyAdmins
  assignedRegions: string[]; // States or regions they manage
  specialtiesManaged: Types.ObjectId[]; // Specific specialties they oversee
  activityLog: IActivityLog[];
  lastActivityAt: Date;
  dashboardSettings: {
    defaultView: string;
    notifications: {
      doctorVerification: boolean;
      customerComplaints: boolean;
      appointmentIssues: boolean;
      reviewFlags: boolean;
    };
    reportFrequency: string; // daily, weekly, monthly
  };
  performanceMetrics: {
    doctorsVerified: number;
    issuesResolved: number;
    averageResponseTime: number; // in hours
    satisfactionScore: number; // 0-5
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanyAdminSchema = new Schema<ICompanyAdmin>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true,
    enum: ['operations', 'quality', 'customer_service', 'compliance', 'technology', 'executive']
  },
  level: {
    type: String,
    enum: Object.values(AdminLevel),
    required: true
  },
  permissions: [{
    type: String,
    enum: Object.values(AdminPermission),
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  activeSince: {
    type: Date,
    default: Date.now
  },
  deactivatedAt: Date,
  supervisor: {
    type: Schema.Types.ObjectId,
    ref: 'CompanyAdmin'
  },
  subordinates: [{
    type: Schema.Types.ObjectId,
    ref: 'CompanyAdmin'
  }],
  assignedRegions: [{
    type: String,
    trim: true
  }],
  specialtiesManaged: [{
    type: Schema.Types.ObjectId,
    ref: 'Specialty'
  }],
  activityLog: [{
    action: {
      type: String,
      required: true
    },
    entityType: {
      type: String,
      required: true,
      enum: ['doctor', 'customer', 'appointment', 'review', 'specialty', 'admin', 'system']
    },
    entityId: String,
    details: Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String
  }],
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  dashboardSettings: {
    defaultView: {
      type: String,
      default: 'overview',
      enum: ['overview', 'doctors', 'customers', 'appointments', 'reports']
    },
    notifications: {
      doctorVerification: {
        type: Boolean,
        default: true
      },
      customerComplaints: {
        type: Boolean,
        default: true
      },
      appointmentIssues: {
        type: Boolean,
        default: true
      },
      reviewFlags: {
        type: Boolean,
        default: true
      }
    },
    reportFrequency: {
      type: String,
      default: 'weekly',
      enum: ['daily', 'weekly', 'monthly']
    }
  },
  performanceMetrics: {
    doctorsVerified: {
      type: Number,
      default: 0
    },
    issuesResolved: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0
    },
    satisfactionScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  notes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Indexes
CompanyAdminSchema.index({ isActive: 1, level: 1 });
CompanyAdminSchema.index({ department: 1, isActive: 1 });
CompanyAdminSchema.index({ 'activityLog.timestamp': -1 });
CompanyAdminSchema.index({ lastActivityAt: -1 });

// Method to check if admin has permission
CompanyAdminSchema.methods.hasPermission = function(permission: AdminPermission): boolean {
  return this.permissions.includes(AdminPermission.ALL) || this.permissions.includes(permission);
};

// Method to log activity
CompanyAdminSchema.methods.logActivity = async function(
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, any>,
  ipAddress?: string
) {
  // Keep only last 100 activities
  if (this.activityLog.length >= 100) {
    this.activityLog = this.activityLog.slice(-99);
  }

  this.activityLog.push({
    action,
    entityType,
    entityId,
    details,
    timestamp: new Date(),
    ipAddress
  });

  this.lastActivityAt = new Date();
  await this.save();
};

// Method to update performance metrics
CompanyAdminSchema.methods.updatePerformanceMetric = async function(
  metric: keyof ICompanyAdmin['performanceMetrics'],
  value: number,
  isIncrement: boolean = true
) {
  if (isIncrement) {
    this.performanceMetrics[metric] += value;
  } else {
    this.performanceMetrics[metric] = value;
  }
  await this.save();
};

// Static method to get admin hierarchy
CompanyAdminSchema.statics.getHierarchy = async function(adminId: Types.ObjectId) {
  const admin = await this.findById(adminId)
    .populate('supervisor')
    .populate('subordinates');
  
  return {
    admin,
    supervisor: admin?.supervisor,
    subordinates: admin?.subordinates || []
  };
};

export const CompanyAdmin = model<ICompanyAdmin>('CompanyAdmin', CompanyAdminSchema);