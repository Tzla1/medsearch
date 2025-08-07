// backend/src/config/middleware/errorHandler.ts
/**
 * ===================================================================
 * MIDDLEWARE DE MANEJO GLOBAL DE ERRORES - ENTERPRISE PATTERN
 * ===================================================================
 * Implementa estrategia centralizada de gestión de excepciones
 * con logging estructurado y respuestas consistentes
 */

import { Request, Response, NextFunction } from 'express';
import { config } from '../environment';

/**
 * Interfaz para errores tipados del sistema
 * Extiende Error nativo con propiedades empresariales
 */
interface ApplicationError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
  isOperational?: boolean;
  timestamp?: string;
  requestId?: string;
}

/**
 * Enumeración de códigos de error empresariales
 * Categorización sistemática para debugging y monitoring
 */
enum ErrorCodes {
  // Errores de Autenticación
  AUTH_TOKEN_MISSING = 'AUTH_001',
  AUTH_TOKEN_INVALID = 'AUTH_002', 
  AUTH_TOKEN_EXPIRED = 'AUTH_003',
  AUTH_INSUFFICIENT_PERMISSIONS = 'AUTH_004',
  
  // Errores de Validación
  VALIDATION_REQUIRED_FIELD = 'VAL_001',
  VALIDATION_INVALID_FORMAT = 'VAL_002',
  VALIDATION_OUT_OF_RANGE = 'VAL_003',
  VALIDATION_DUPLICATE_VALUE = 'VAL_004',
  
  // Errores de Negocio
  BUSINESS_DOCTOR_NOT_AVAILABLE = 'BIZ_001',
  BUSINESS_APPOINTMENT_CONFLICT = 'BIZ_002',
  BUSINESS_INVALID_SPECIALTY = 'BIZ_003',
  
  // Errores de Base de Datos
  DATABASE_CONNECTION_FAILED = 'DB_001',
  DATABASE_CONSTRAINT_VIOLATION = 'DB_002',
  DATABASE_TIMEOUT = 'DB_003',
  
  // Errores de Sistema
  SYSTEM_INTERNAL_ERROR = 'SYS_001',
  SYSTEM_SERVICE_UNAVAILABLE = 'SYS_002',
  SYSTEM_RATE_LIMIT_EXCEEDED = 'SYS_003'
}

/**
 * Clase especializada para errores de aplicación
 * Implementa propiedades empresariales para debugging avanzado
 */
export class AppError extends Error implements ApplicationError {
  public statusCode: number;
  public code: string;
  public details?: any;
  public isOperational: boolean;
  public timestamp: string;
  public requestId?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = ErrorCodes.SYSTEM_INTERNAL_ERROR,
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    // Capturar stack trace (V8 engines)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Factory para errores especializados por dominio
 * Simplifica creación de errores tipados
 */
class ErrorFactory {
  // Errores de Autenticación
  static unauthorized(message: string = 'Acceso no autorizado'): AppError {
    return new AppError(message, 401, ErrorCodes.AUTH_TOKEN_INVALID);
  }
  
  static forbidden(message: string = 'Permisos insuficientes'): AppError {
    return new AppError(message, 403, ErrorCodes.AUTH_INSUFFICIENT_PERMISSIONS);
  }
  
  static tokenExpired(message: string = 'Token expirado'): AppError {
    return new AppError(message, 401, ErrorCodes.AUTH_TOKEN_EXPIRED);
  }
  
  // Errores de Validación
  static validationError(field: string, details?: any): AppError {
    return new AppError(
      `Error de validación en campo: ${field}`,
      400,
      ErrorCodes.VALIDATION_INVALID_FORMAT,
      details
    );
  }
  
  static duplicateResource(resource: string, value: string): AppError {
    return new AppError(
      `${resource} ya existe: ${value}`,
      409,
      ErrorCodes.VALIDATION_DUPLICATE_VALUE,
      { resource, value }
    );
  }
  
  // Errores de Negocio
  static doctorNotAvailable(doctorId: number, date: string): AppError {
    return new AppError(
      'Médico no disponible en la fecha solicitada',
      400,
      ErrorCodes.BUSINESS_DOCTOR_NOT_AVAILABLE,
      { doctorId, date }
    );
  }
  
  static appointmentConflict(doctorId: number, datetime: string): AppError {
    return new AppError(
      'Conflicto de horario en cita médica',
      409,
      ErrorCodes.BUSINESS_APPOINTMENT_CONFLICT,
      { doctorId, datetime }
    );
  }
  
  // Errores de Base de Datos
  static databaseError(operation: string, details?: any): AppError {
    return new AppError(
      `Error en operación de base de datos: ${operation}`,
      500,
      ErrorCodes.DATABASE_CONNECTION_FAILED,
      details
    );
  }
}

/**
 * Servicio de Logging Estructurado
 * Implementa estrategias diferenciadas por entorno
 */
class ErrorLogger {
  /**
   * Log estructurado para errores de aplicación
   * Incluye contexto completo para debugging
   */
  static logError(error: ApplicationError, req: Request): void {
    const logData = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message: error.message,
      errorCode: error.code || 'UNKNOWN',
      statusCode: error.statusCode || 500,
      stack: error.stack,
      request: {
        method: req.method,
        url: req.originalUrl,
        headers: this.sanitizeHeaders(req.headers),
        body: this.sanitizeBody(req.body),
        query: req.query,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      },
      user: (req as any).user ? {
        id: (req as any).user.id,
        email: (req as any).user.email,
        role: (req as any).user.role || (req as any).user.userType
      } : null,
      details: error.details,
      requestId: error.requestId || req.headers['x-request-id'],
      environment: config.NODE_ENV
    };

    // Estrategias de logging por entorno
    if (config.NODE_ENV === 'development') {
      console.error('🚨 ERROR DETAILS:', JSON.stringify(logData, null, 2));
    } else {
      // En producción: enviar a servicio de logging (Elasticsearch, Splunk, etc.)
      console.error(JSON.stringify(logData));
    }
  }

  /**
   * Sanitizar headers sensibles para logging seguro
   */
  private static sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  /**
   * Sanitizar body removiendo información sensible
   */
  private static sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;
    
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'ssn', 'creditCard'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
}

/**
 * Analizador de Errores MySQL
 * Convierte errores de base de datos en respuestas user-friendly
 */
class MySQLErrorAnalyzer {
  /**
   * Mapeo de códigos de error MySQL a errores de aplicación
   */
  static analyzeError(error: any): AppError {
    const mysqlErrorMap: { [key: string]: (error: any) => AppError } = {
      // Violación de constraint único
      'ER_DUP_ENTRY': (err) => {
        const match = err.message.match(/Duplicate entry '(.+)' for key '(.+)'/);
        const value = match ? match[1] : 'unknown';
        const field = match ? match[2] : 'unknown';
        
        return ErrorFactory.duplicateResource(field, value);
      },
      
      // Violación de foreign key
      'ER_NO_REFERENCED_ROW_2': (err) => {
        return new AppError(
          'Referencia inválida a registro inexistente',
          400,
          ErrorCodes.DATABASE_CONSTRAINT_VIOLATION,
          { mysqlError: err.message }
        );
      },
      
      // Conexión perdida
      'PROTOCOL_CONNECTION_LOST': () => {
        return new AppError(
          'Conexión a base de datos perdida',
          503,
          ErrorCodes.DATABASE_CONNECTION_FAILED
        );
      },
      
      // Timeout de consulta
      'PROTOCOL_SEQUENCE_TIMEOUT': () => {
        return new AppError(
          'Timeout en consulta de base de datos',
          504,
          ErrorCodes.DATABASE_TIMEOUT
        );
      }
    };

    const errorHandler = mysqlErrorMap[error.code];
    if (errorHandler) {
      return errorHandler(error);
    }

    // Error genérico de base de datos
    return ErrorFactory.databaseError('operación desconocida', {
      mysqlCode: error.code,
      mysqlMessage: error.message
    });
  }
}

/**
 * Middleware Principal de Manejo Global de Errores
 * Implementa patrón Chain of Responsibility para procesamiento
 */
export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let appError: ApplicationError;

  // Convertir diferentes tipos de error a AppError
  if (error instanceof AppError) {
    appError = error;
  } else if (error.name === 'ValidationError') {
    // Error de validación Joi
    appError = ErrorFactory.validationError('datos inválidos', error);
  } else if (error.name === 'JsonWebTokenError') {
    // Error de JWT
    appError = ErrorFactory.unauthorized('Token JWT inválido');
  } else if (error.name === 'TokenExpiredError') {
    // Token expirado
    appError = ErrorFactory.tokenExpired();
  } else if (error.name === 'SyntaxError' && 'body' in error) {
    // Error de parsing JSON
    appError = new AppError(
      'JSON malformado en el cuerpo de la solicitud',
      400,
      ErrorCodes.VALIDATION_INVALID_FORMAT
    );
  } else if (error && 'code' in error && typeof error.code === 'string' && error.code.startsWith('ER_')) {
    // Error de MySQL
    appError = MySQLErrorAnalyzer.analyzeError(error);
  } else {
    // Error genérico no manejado
    appError = new AppError(
      config.NODE_ENV === 'development' ? error.message : 'Error interno del servidor',
      500,
      ErrorCodes.SYSTEM_INTERNAL_ERROR,
      config.NODE_ENV === 'development' ? { originalError: error.message } : undefined,
      false // No operacional - requiere investigación
    );
  }

  // Agregar request ID si está disponible
  appError.requestId = req.headers['x-request-id'] as string;

  // Logging estructurado del error
  ErrorLogger.logError(appError, req);

  // Estructura de respuesta consistente
  const errorResponse = {
    success: false,
    error: {
      message: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
      timestamp: appError.timestamp,
      requestId: appError.requestId,
      path: req.originalUrl,
      method: req.method
    },
    // Incluir detalles solo en desarrollo
    ...(config.NODE_ENV === 'development' && appError.details && {
      details: appError.details
    }),
    // Stack trace solo en desarrollo para errores no operacionales
    ...(config.NODE_ENV === 'development' && !appError.isOperational && {
      stack: appError.stack?.split('\n').slice(0, 10)
    })
  };

  // Enviar respuesta de error
  res.status(appError.statusCode || 500).json(errorResponse);
};

/**
 * Middleware para captura de rutas no encontradas
 * Debe colocarse después de todas las rutas válidas
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(
    `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    404,
    'ROUTE_NOT_FOUND'
  );
  
  next(error);
};

/**
 * Wrapper para funciones async
 * Elimina necesidad de try/catch en controladores
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware de Request ID
 * Genera identificador único para rastreo de requests
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.headers['x-request-id'] || 
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  next();
};

// Exportar factory y clases para uso en servicios
export { ErrorCodes, ErrorFactory };