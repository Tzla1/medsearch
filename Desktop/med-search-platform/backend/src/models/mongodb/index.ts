// Export all MongoDB models for easy importing
export { User, UserRole, IUser } from './User';
export { Doctor, DoctorStatus, IDoctor, IAvailabilitySlot } from './Doctor';
export { Customer, Gender, ICustomer, IMedicalHistory, IEmergencyContact } from './Customer';
export { CompanyAdmin, AdminPermission, AdminLevel, ICompanyAdmin, IActivityLog } from './CompanyAdmin';
export { Appointment, AppointmentStatus, AppointmentType, PaymentStatus, IAppointment } from './Appointment';
export { Review, ReviewStatus, IReview, IReviewFlag } from './Review';
export { Specialty, ISpecialty } from './Specialty';

// Re-export mongoose for convenience
export { Types } from 'mongoose';