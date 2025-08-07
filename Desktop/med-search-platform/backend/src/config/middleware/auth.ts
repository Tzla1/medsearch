// backend/src/config/middleware/auth.ts
/**
 * ===================================================================
 * MIDDLEWARE DE AUTENTICACIÓN EMPRESARIAL - JWT + RBAC
 * ===================================================================
 * Implementa autenticación JWT con control de acceso basado en roles
 * Diseño modular con middleware especializados por dominio
 * Estrategias de seguridad OAuth 2.0 y mejores prácticas JWT
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../environment';
import { getDatabase } from '../database';
import { RowDataPacket } from 'mysql2';
import { AppError, ErrorFactory } from './errorHandler';

/**
 * Interfaz para request autenticado
 * Extiende Request de Express con información de usuario verificado
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    userType: 'patient' | 'doctor' | 'admin';
    isActive: boolean;
    emailVerified: boolean;
  };
  doctor?: {
    id: number;
    licenseNumber: string;
    specialtyId: number;
    isVerified: boolean;
    isAcceptingPatients: boolean;
  };
}

/**
 * Interfaz para payload de token JWT
 * Define estructura estándar de claims JWT empresariales
 */
interface JWTPayload {
  sub: string;        // Subject (user ID)
  email: string;      // Email del usuario
  role: string;       // Rol del usuario
  iat: number;        // Issued at
  exp: number;        // Expiration time
  iss: string;        // Issuer
  aud: string;        // Audience
}

/**
 * Servicio de Validación de Tokens JWT
 * Implementa verificación robusta con manejo de excepciones específicas
 */
class TokenValidator {
  /**
   * Verificar y decodificar token JWT
   * Implementa validación completa de claims RFC 7519
   */
  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET, {
        algorithms: ['HS256'],
        issuer: 'med-search-platform',
        audience: 'med-search-users',
        clockTolerance: 30 // 30 segundos de tolerancia de reloj
      }) as JWTPayload;

      // Validaciones adicionales de seguridad
      if (!decoded.sub || !decoded.email || !decoded.role) {
        console.warn('Token JWT con claims incompletos');
        return null;
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.warn(`Token JWT expirado: ${error.expiredAt}`);
      } else if (error instanceof jwt.JsonWebTokenError) {
        console.warn(`Token JWT inválido: ${error.message}`);
      } else if (error instanceof jwt.NotBeforeError) {
        console.warn(`Token JWT usado antes de tiempo: ${error.date}`);
      } else {
        console.error('Error desconocido verificando JWT:', error);
      }
      return null;
    }
  }

  /**
   * Extraer token del header Authorization
   * Soporta formato Bearer estándar OAuth 2.0
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    
    // Formato esperado: "Bearer <token>"
    const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!bearerMatch) {
      console.warn('Header Authorization con formato inválido');
      return null;
    }
    
    const token = bearerMatch[1];
    
    // Validaciones básicas de formato de token
    if (token.length < 20 || !token.includes('.')) {
      console.warn('Token JWT con formato sospechoso');
      return null;
    }
    
    return token;
  }
}

/**
 * Servicio de Enriquecimiento de Usuario
 * Obtiene información adicional del usuario desde base de datos
 */
class UserEnrichmentService {
  private static db = getDatabase();

  /**
   * Obtener información completa del usuario
   * Query optimizada con manejo de cache potencial
   */
  static async getUserInfo(userId: number): Promise<AuthenticatedRequest['user'] | null> {
    try {
      const [rows] = await this.db.execute<RowDataPacket[]>(
        `SELECT 
           id, email, first_name, last_name, user_type,
           is_active, email_verified
         FROM users 
         WHERE id = ? AND is_active = TRUE`,
        [userId]
      );

      if (rows.length === 0) return null;

      const user = rows[0];
      return {
        id: user.id,
        email: user.email,
        userType: user.user_type,
        isActive: user.is_active,
        emailVerified: user.email_verified
      };
    } catch (error) {
      console.error('Error obteniendo información de usuario:', error);
      return null;
    }
  }

  /**
   * Obtener información del médico asociado
   * Query especializada para profesionales médicos
   */
  static async getDoctorInfo(userId: number): Promise<AuthenticatedRequest['doctor'] | null> {
    try {
      const [rows] = await this.db.execute<RowDataPacket[]>(
        `SELECT 
           d.id, d.license_number, d.specialty_id,
           d.is_verified, d.is_accepting_patients
         FROM doctors d
         INNER JOIN users u ON d.user_id = u.id
         WHERE u.id = ? AND u.is_active = TRUE`,
        [userId]
      );

      if (rows.length === 0) return null;

      const doctor = rows[0];
      return {
        id: doctor.id,
        licenseNumber: doctor.license_number,
        specialtyId: doctor.specialty_id,
        isVerified: doctor.is_verified,
        isAcceptingPatients: doctor.is_accepting_patients
      };
    } catch (error) {
      console.error('Error obteniendo información de médico:', error);
      return null;
    }
  }
}

/**
 * Middleware Principal de Autenticación
 * Implementa verificación completa de JWT con enriquecimiento de usuario
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Extraer token del header
    const token = TokenValidator.extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      throw ErrorFactory.unauthorized('Token de autenticación requerido');
    }

    // 2. Verificar y decodificar token
    const payload = TokenValidator.verifyToken(token);
    
    if (!payload) {
      throw ErrorFactory.unauthorized('Token inválido o expirado');
    }

    // 3. Obtener información actualizada del usuario
    const userInfo = await UserEnrichmentService.getUserInfo(parseInt(payload.sub));
    
    if (!userInfo) {
      throw ErrorFactory.unauthorized('Usuario no encontrado o inactivo');
    }

    // 4. Verificar coherencia entre token y base de datos
    if (userInfo.email !== payload.email) {
      console.warn(`Inconsistencia email: token=${payload.email}, db=${userInfo.email}`);
      throw ErrorFactory.unauthorized('Token inconsistente con base de datos');
    }

    // 5. Verificar estado del usuario
    if (!userInfo.isActive) {
      throw ErrorFactory.forbidden('Cuenta de usuario desactivada');
    }

    // 6. Enriquecer request con información de usuario
    req.user = userInfo;

    // 7. Si es médico, obtener información adicional
    if (userInfo.userType === 'doctor') {
      const doctorInfo = await UserEnrichmentService.getDoctorInfo(userInfo.id);
      if (doctorInfo) {
        req.doctor = doctorInfo;
      }
    }

    // 8. Logging de autenticación para auditoría
    console.log(`🔐 Usuario autenticado: ${userInfo.email} (${userInfo.userType})`);

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware de Autorización Basada en Roles (RBAC)
 * Implementa control granular de acceso por tipo de usuario
 */
export const requireRole = (allowedRoles: Array<'patient' | 'doctor' | 'admin'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw ErrorFactory.unauthorized('Usuario no autenticado');
      }

      if (!allowedRoles.includes(req.user.userType)) {
        throw ErrorFactory.forbidden(
          `Acceso restringido. Roles permitidos: ${allowedRoles.join(', ')}`
        );
      }

      // Logging de autorización para auditoría
      console.log(`✅ Autorización concedida: ${req.user.email} accede como ${req.user.userType}`);

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware Especializado para Médicos Verificados
 * Control de acceso específico para profesionales médicos validados
 */
export const requireVerifiedDoctor = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Verificar autenticación básica
    if (!req.user) {
      throw ErrorFactory.unauthorized('Usuario no autenticado');
    }

    // 2. Verificar que sea médico
    if (req.user.userType !== 'doctor') {
      throw ErrorFactory.forbidden('Acceso restringido a médicos');
    }

    // 3. Verificar información de médico
    if (!req.doctor) {
      throw ErrorFactory.forbidden('Información de médico no disponible');
    }

    // 4. Verificar estado de verificación
    if (!req.doctor.isVerified) {
      throw ErrorFactory.forbidden(
        'Médico no verificado. Complete el proceso de verificación profesional'
      );
    }

    // 5. Logging específico para médicos
    console.log(`👨‍⚕️ Médico verificado: ${req.user.email} (Licencia: ${req.doctor.licenseNumber})`);

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para Verificación de Email
 * Controla acceso basado en verificación de correo electrónico
 */
export const requireEmailVerified = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized('Usuario no autenticado');
    }

    if (!req.user.emailVerified) {
      throw ErrorFactory.forbidden(
        'Email no verificado. Verifique su correo electrónico para continuar'
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware Condicional para Autenticación Opcional
 * Permite endpoints que funcionan con o sin autenticación
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = TokenValidator.extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const payload = TokenValidator.verifyToken(token);
      
      if (payload) {
        const userInfo = await UserEnrichmentService.getUserInfo(parseInt(payload.sub));
        
        if (userInfo && userInfo.isActive) {
          req.user = userInfo;
          
          if (userInfo.userType === 'doctor') {
            const doctorInfo = await UserEnrichmentService.getDoctorInfo(userInfo.id);
            if (doctorInfo) {
              req.doctor = doctorInfo;
            }
          }
        }
      }
    }

    // Continuar sin error incluso sin autenticación
    next();
  } catch (error) {
    // En caso de error, continuar sin autenticación
    console.warn('Error en autenticación opcional:', error);
    next();
  }
};

/**
 * Middleware de Verificación de Ownership
 * Verifica que el usuario tenga permisos sobre el recurso específico
 */
export const requireOwnership = (resourceIdParam: string = 'id') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw ErrorFactory.unauthorized('Usuario no autenticado');
      }

      const resourceId = parseInt(req.params[resourceIdParam]);
      
      if (isNaN(resourceId)) {
        throw ErrorFactory.validationError('ID de recurso inválido');
      }

      // Permitir acceso si es admin
      if (req.user.userType === 'admin') {
        next();
        return;
      }

      // Verificar ownership para usuarios normales
      if (req.user.id !== resourceId) {
        throw ErrorFactory.forbidden('No tiene permisos para acceder a este recurso');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware de Rate Limiting por Usuario
 * Implementa límites específicos por usuario autenticado
 */
export const userRateLimit = (maxRequests: number = 100, windowMs: number = 900000) => {
  const userLimits = new Map<number, { count: number; resetTime: number }>();

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        next();
        return;
      }

      const now = Date.now();
      const userId = req.user.id;
      const userLimit = userLimits.get(userId);

      // Resetear contador si la ventana ha expirado
      if (!userLimit || now > userLimit.resetTime) {
        userLimits.set(userId, { count: 1, resetTime: now + windowMs });
        next();
        return;
      }

      // Verificar límite
      if (userLimit.count >= maxRequests) {
        const resetIn = Math.ceil((userLimit.resetTime - now) / 1000);
        
        res.set({
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(userLimit.resetTime).toISOString()
        });

        throw new AppError(
          `Límite de ${maxRequests} requests excedido. Intente en ${resetIn} segundos`,
          429,
          'RATE_LIMIT_EXCEEDED'
        );
      }

      // Incrementar contador
      userLimit.count++;
      userLimits.set(userId, userLimit);

      // Headers informativos
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': (maxRequests - userLimit.count).toString(),
        'X-RateLimit-Reset': new Date(userLimit.resetTime).toISOString()
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Exportar tipos para uso en controladores
export { AuthenticatedRequest };