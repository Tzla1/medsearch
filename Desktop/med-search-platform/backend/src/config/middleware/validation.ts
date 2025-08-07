// backend/src/config/middleware/validation.ts
/**
 * ===================================================================
 * MIDDLEWARE DE VALIDACIÓN EMPRESARIAL - JOI SCHEMAS
 * ===================================================================
 * Implementa validación robusta de datos con sanitización automática
 * Esquemas especializados para dominio médico y casos de uso complejos
 * Estrategias de validación condicional y transformación de datos
 */

import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorFactory } from './errorHandler';

// Extender la interfaz Request para incluir la propiedad file
declare module 'express' {
  interface Request {
    file?: {
      size: number;
      mimetype: string;
      [key: string]: any;
    };
  }
}

/**
 * Configuración global de Joi
 * Establece comportamiento consistente para toda la aplicación
 */
const JOI_OPTIONS: Joi.AsyncValidationOptions = {
  abortEarly: false,        // Recopilar todos los errores
  stripUnknown: true,       // Remover campos desconocidos
  convert: true,            // Conversión automática de tipos
  allowUnknown: false,      // Rechazar campos no definidos
  presence: 'optional'      // Campos opcionales por defecto
};

// Interfaces para los detalles de error
interface ErrorDetail {
  field: string;
  message: string;
  value?: any;
  type: string;
}

/**
 * Utilidades de Validación Personalizadas
 * Funciones especializadas para el dominio médico
 */
class ValidationUtils {
  /**
   * Validador personalizado para números de licencia médica
   * Formato específico del sistema médico mexicano
   */
  static medicalLicenseValidator = (value: string, helpers: Joi.CustomHelpers) => {
    // Formato: XXX-AAA-###-#### (ejemplo: MED-GDL-001-2010)
    const licensePattern = /^[A-Z]{3}-[A-Z]{3}-\d{3}-\d{4}$/;
    
    if (!licensePattern.test(value.toUpperCase())) {
      return helpers.error('custom.invalidMedicalLicense');
    }
    
    return value.toUpperCase();
  };

  /**
   * Validador para códigos postales mexicanos
   * Formato de 5 dígitos estándar de SEPOMEX
   */
  static mexicanZipCodeValidator = (value: string, helpers: Joi.CustomHelpers) => {
    const zipPattern = /^\d{5}$/;
    
    if (!zipPattern.test(value)) {
      return helpers.error('custom.invalidZipCode');
    }
    
    return value;
  };

  /**
   * Validador para números telefónicos mexicanos
   * Soporta formatos locales e internacionales
   */
  static mexicanPhoneValidator = (value: string, helpers: Joi.CustomHelpers) => {
    // Remover espacios, guiones y paréntesis
    const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
    
    // Patrones válidos:
    // - 10 dígitos: 3312345678
    // - 12 dígitos con código país: 523312345678
    // - 13 dígitos con +52: +523312345678
    const phonePatterns = [
      /^\d{10}$/,              // Formato local
      /^52\d{10}$/,            // Con código país
      /^\+52\d{10}$/           // Con + y código país
    ];
    
    const isValid = phonePatterns.some(pattern => pattern.test(cleanPhone));
    
    if (!isValid) {
      return helpers.error('custom.invalidPhoneNumber');
    }
    
    // Normalizar a formato estándar +52XXXXXXXXXX
    let normalized = cleanPhone;
    if (normalized.startsWith('+52')) {
      // Ya está normalizado
    } else if (normalized.startsWith('52') && normalized.length === 12) {
      normalized = '+' + normalized;
    } else if (normalized.length === 10) {
      normalized = '+52' + normalized;
    }
    
    return normalized;
  };

  /**
   * Validador para horarios médicos
   * Verifica formato y lógica de horarios de consulta
   */
  static medicalScheduleValidator = (value: any[], helpers: Joi.CustomHelpers) => {
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    for (const schedule of value) {
      // Validar día
      if (!validDays.includes(schedule.day)) {
        return helpers.error('custom.invalidScheduleDay');
      }
      
      // Validar formato de horas
      if (!timePattern.test(schedule.startTime) || !timePattern.test(schedule.endTime)) {
        return helpers.error('custom.invalidTimeFormat');
      }
      
      // Validar lógica de horarios
      const start = new Date(`2000-01-01T${schedule.startTime}:00`);
      const end = new Date(`2000-01-01T${schedule.endTime}:00`);
      
      if (start >= end) {
        return helpers.error('custom.invalidTimeRange');
      }
      
      // Validar horario de almuerzo si existe
      if (schedule.lunchBreakStart && schedule.lunchBreakEnd) {
        if (!timePattern.test(schedule.lunchBreakStart) || !timePattern.test(schedule.lunchBreakEnd)) {
          return helpers.error('custom.invalidLunchTimeFormat');
        }
        
        const lunchStart = new Date(`2000-01-01T${schedule.lunchBreakStart}:00`);
        const lunchEnd = new Date(`2000-01-01T${schedule.lunchBreakEnd}:00`);
        
        if (lunchStart >= lunchEnd || lunchStart < start || lunchEnd > end) {
          return helpers.error('custom.invalidLunchTimeRange');
        }
      }
    }
    
    return value;
  };
}

/**
 * Esquemas de Validación Base
 * Definiciones reutilizables para campos comunes
 */
const BaseSchemas = {
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(255)
    .lowercase()
    .trim(),
    
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .messages({
      'string.pattern.base': 'La contraseña debe incluir: mayúscula, minúscula, número y símbolo especial'
    }),
    
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .messages({
      'string.pattern.base': 'Solo se permiten letras y espacios'
    }),
    
  phone: Joi.string()
    .custom(ValidationUtils.mexicanPhoneValidator)
    .messages({
      'custom.invalidPhoneNumber': 'Formato de teléfono inválido (ejemplo: 33-1234-5678)'
    }),
    
  zipCode: Joi.string()
    .custom(ValidationUtils.mexicanZipCodeValidator)
    .messages({
      'custom.invalidZipCode': 'Código postal debe tener 5 dígitos'
    }),
    
  currency: Joi.string()
    .length(3)
    .uppercase()
    .valid('MXN', 'USD', 'EUR')
    .default('MXN'),
    
  coordinates: {
    latitude: Joi.number()
      .min(-90)
      .max(90)
      .precision(8),
    longitude: Joi.number()
      .min(-180)
      .max(180)
      .precision(8)
  }
};

/**
 * Esquemas de Validación para Autenticación
 * Validaciones específicas para endpoints de auth
 */
const AuthSchemas = {
  register: Joi.object({
    email: BaseSchemas.email.required(),
    password: BaseSchemas.password.required(),
    firstName: BaseSchemas.name.required(),
    lastName: BaseSchemas.name.required(),
    phone: BaseSchemas.phone.optional(),
    dateOfBirth: Joi.date()
      .max('now')
      .min('1900-01-01')
      .optional(),
    gender: Joi.string()
      .valid('M', 'F', 'Other')
      .optional(),
    address: Joi.string().max(300).optional(),
    city: Joi.string().max(100).optional(),
    state: Joi.string().max(100).optional(),
    zipCode: BaseSchemas.zipCode.optional()
  }),
  
  login: Joi.object({
    email: BaseSchemas.email.required(),
    password: Joi.string().required()
  }),
  
  resetPassword: Joi.object({
    email: BaseSchemas.email.required()
  }),
  
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: BaseSchemas.password.required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Las contraseñas no coinciden'
      })
  })
};

/**
 * Esquemas de Validación para Médicos
 * Validaciones especializadas para profesionales médicos
 */
const DoctorSchemas = {
  registration: Joi.object({
    licenseNumber: Joi.string()
      .custom(ValidationUtils.medicalLicenseValidator)
      .required()
      .messages({
        'custom.invalidMedicalLicense': 'Formato de licencia inválido (ejemplo: MED-GDL-001-2010)'
      }),
      
    specialtyId: Joi.number()
      .integer()
      .positive()
      .required(),
      
    yearsOfExperience: Joi.number()
      .integer()
      .min(0)
      .max(60)
      .required(),
      
    education: Joi.string()
      .min(10)
      .max(2000)
      .required(),
      
    hospitalAffiliations: Joi.string()
      .max(1000)
      .optional(),
      
    consultationFee: Joi.number()
      .precision(2)
      .positive()
      .max(50000)
      .required(),
      
    currency: BaseSchemas.currency,
    
    availableHours: Joi.array()
      .items(Joi.object({
        day: Joi.string()
          .valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
          .required(),
        startTime: Joi.string()
          .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
          .required(),
        endTime: Joi.string()
          .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
          .required(),
        lunchBreakStart: Joi.string()
          .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
          .optional(),
        lunchBreakEnd: Joi.string()
          .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
          .optional()
      }))
      .min(1)
      .custom(ValidationUtils.medicalScheduleValidator)
      .required()
      .messages({
        'custom.invalidScheduleDay': 'Día de la semana inválido',
        'custom.invalidTimeFormat': 'Formato de hora inválido (HH:mm)',
        'custom.invalidTimeRange': 'Hora de fin debe ser mayor a hora de inicio',
        'custom.invalidLunchTimeFormat': 'Formato de hora de almuerzo inválido',
        'custom.invalidLunchTimeRange': 'Horario de almuerzo debe estar dentro del horario laboral'
      }),
      
    acceptsInsurance: Joi.boolean().default(true),
    
    insuranceTypes: Joi.array()
      .items(Joi.string().max(100))
      .optional(),
      
    officeAddress: Joi.string()
      .min(5)
      .max(300)
      .required(),
      
    officeCity: Joi.string()
      .min(2)
      .max(100)
      .required(),
      
    officeState: Joi.string()
      .min(2)
      .max(100)
      .required(),
      
    officeZipCode: BaseSchemas.zipCode.required(),
    
    latitude: BaseSchemas.coordinates.latitude.optional(),
    longitude: BaseSchemas.coordinates.longitude.optional(),
    
    officePhone: BaseSchemas.phone.required(),
    emergencyPhone: BaseSchemas.phone.optional()
  }).custom((value, helpers) => {
    // Validación condicional: si se proporciona latitud, también longitud
    if ((value.latitude && !value.longitude) || (!value.latitude && value.longitude)) {
      return helpers.error('custom.incompleteCoordinates');
    }
    return value;
  }).messages({
    'custom.incompleteCoordinates': 'Debe proporcionar tanto latitud como longitud'
  }),
  
  updateProfile: Joi.object({
    education: Joi.string().min(10).max(2000).optional(),
    hospitalAffiliations: Joi.string().max(1000).optional(),
    consultationFee: Joi.number().precision(2).positive().max(50000).optional(),
    acceptsInsurance: Joi.boolean().optional(),
    insuranceTypes: Joi.array().items(Joi.string().max(100)).optional(),
    officeAddress: Joi.string().min(5).max(300).optional(),
    officePhone: BaseSchemas.phone.optional(),
    emergencyPhone: BaseSchemas.phone.optional()
  }).min(1),
  
  updateAvailability: Joi.object({
    availableHours: Joi.array()
      .items(Joi.object({
        day: Joi.string()
          .valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
          .required(),
        startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        lunchBreakStart: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
        lunchBreakEnd: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
      }))
      .min(1)
      .custom(ValidationUtils.medicalScheduleValidator)
      .required(),
    isAcceptingPatients: Joi.boolean().required()
  })
};

/**
 * Esquemas de Validación para Citas Médicas
 * Validaciones específicas para sistema de citas
 */
const AppointmentSchemas = {
  create: Joi.object({
    doctorId: Joi.number().integer().positive().required(),
    appointmentDate: Joi.date()
      .min('now')
      .max(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)) // Máximo 90 días
      .required(),
    appointmentTime: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required(),
    reasonForVisit: Joi.string()
      .min(5)
      .max(500)
      .required(),
    patientNotes: Joi.string()
      .max(1000)
      .optional(),
    contactPhone: BaseSchemas.phone.required(),
    contactEmail: BaseSchemas.email.required(),
    emergencyContact: Joi.string()
      .max(100)
      .optional()
  }),
  
  update: Joi.object({
    appointmentDate: Joi.date().min('now').optional(),
    appointmentTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    reasonForVisit: Joi.string().min(5).max(500).optional(),
    patientNotes: Joi.string().max(1000).optional(),
    doctorNotes: Joi.string().max(1000).optional()
  }).min(1),
  
  cancel: Joi.object({
    cancellationReason: Joi.string()
      .min(5)
      .max(300)
      .required()
  })
};

/**
 * Esquemas de Validación para Búsqueda
 * Validaciones optimizadas para queries de búsqueda
 */
const SearchSchemas = {
  doctors: Joi.object({
    specialtyId: Joi.number().integer().positive().optional(),
    city: Joi.string().trim().min(2).max(100).optional(),
    state: Joi.string().trim().min(2).max(100).optional(),
    latitude: BaseSchemas.coordinates.latitude.optional(),
    longitude: BaseSchemas.coordinates.longitude.optional(),
    maxDistance: Joi.number().integer().min(1).max(500).default(50).optional(),
    acceptsInsurance: Joi.boolean().optional(),
    maxFee: Joi.number().positive().max(100000).optional(),
    minRating: Joi.number().min(0).max(5).optional(),
    yearsExperience: Joi.number().integer().min(0).max(60).optional(),
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(50).default(20).optional(),
    sortBy: Joi.string()
      .valid('rating', 'distance', 'price', 'experience', 'alphabetical')
      .default('rating')
      .optional(),
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .optional()
  }).custom((value, helpers) => {
    // Validación condicional para coordenadas
    if ((value.latitude && !value.longitude) || (!value.latitude && value.longitude)) {
      return helpers.error('custom.incompleteCoordinates');
    }
    return value;
  })
};

/**
 * Factory de Middleware de Validación
 * Genera middleware especializado para diferentes esquemas
 */
class ValidationMiddlewareFactory {
  /**
   * Crear middleware de validación para esquema específico
   */
  static create(schema: Joi.ObjectSchema, target: 'body' | 'query' | 'params' = 'body') {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const dataToValidate = req[target];
        
        const { error, value } = await schema.validateAsync(dataToValidate, JOI_OPTIONS);
        
        if (error) {
          const errorDetails = error.details.map((detail: Joi.ValidationErrorItem) => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value,
            type: detail.type
          }));

          throw ErrorFactory.validationError('Datos de entrada inválidos', {
            target,
            errors: errorDetails,
            invalidFields: errorDetails.map((e: ErrorDetail) => e.field)
          });
        }

        // Reemplazar datos originales con datos validados y sanitizados
        req[target] = value;
        
        next();
      } catch (error) {
        next(error);
      }
    };
  }
  
  /**
   * Crear middleware de validación condicional
   * Aplica validación solo si se cumplen ciertas condiciones
   */
  static conditional(
    condition: (req: Request) => boolean,
    schema: Joi.ObjectSchema,
    target: 'body' | 'query' | 'params' = 'body'
  ): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (condition(req)) {
        return ValidationMiddlewareFactory.create(schema, target)(req, res, next);
      }
      next();
    };
  }
}

/**
 * Middleware de Validación Predefinidos
 * Instancias listas para usar en rutas
 */
export const validateRegistration = ValidationMiddlewareFactory.create(AuthSchemas.register);
export const validateLogin = ValidationMiddlewareFactory.create(AuthSchemas.login);
export const validateResetPassword = ValidationMiddlewareFactory.create(AuthSchemas.resetPassword);
export const validateChangePassword = ValidationMiddlewareFactory.create(AuthSchemas.changePassword);

export const validateDoctorRegistration = ValidationMiddlewareFactory.create(DoctorSchemas.registration);
export const validateDoctorProfileUpdate = ValidationMiddlewareFactory.create(DoctorSchemas.updateProfile);
export const validateAvailabilityUpdate = ValidationMiddlewareFactory.create(DoctorSchemas.updateAvailability);

export const validateAppointmentCreation = ValidationMiddlewareFactory.create(AppointmentSchemas.create);
export const validateAppointmentUpdate = ValidationMiddlewareFactory.create(AppointmentSchemas.update);
export const validateAppointmentCancellation = ValidationMiddlewareFactory.create(AppointmentSchemas.cancel);

export const validateDoctorSearch = ValidationMiddlewareFactory.create(SearchSchemas.doctors, 'query');

/**
 * Middleware de Sanitización Adicional
 * Limpieza de datos más allá de la validación Joi
 */
export const sanitizeHtmlMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      // Remover tags HTML básicos y scripts
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();
    }
    
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = Array.isArray(value) ? [] : {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    
    return value;
  };

  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query);
  
  next();
};

/**
 * Middleware de Validación de Archivos
 * Validación especializada para uploads de archivos
 */
export const validateFileUpload = (options: {
  maxSize?: number;
  allowedTypes?: string[];
  required?: boolean;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'], required = false } = options;
    
    if (!req.file && required) {
      throw ErrorFactory.validationError('Archivo requerido');
    }
    
    if (req.file) {
      // Validar tamaño
      if (req.file.size > maxSize) {
        throw ErrorFactory.validationError(`Archivo demasiado grande. Máximo: ${maxSize / 1024 / 1024}MB`);
      }
      
      // Validar tipo
      if (!allowedTypes.includes(req.file.mimetype)) {
        throw ErrorFactory.validationError(`Tipo de archivo no permitido. Permitidos: ${allowedTypes.join(', ')}`);
      }
    }
    
    next();
  };
};

// Exportar esquemas para uso directo si es necesario
export { 
  AuthSchemas, 
  DoctorSchemas, 
  AppointmentSchemas, 
  SearchSchemas,
  ValidationMiddlewareFactory,
  BaseSchemas
};