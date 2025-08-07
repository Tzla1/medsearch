// backend/src/config/cors.ts
/**
 * Configuración CORS Empresarial
 * Implementa políticas de seguridad específicas por entorno
 */
import { CorsOptions } from 'cors';
import { config, isDevelopment, isProduction } from './environment';

/**
 * Configuración CORS optimizada por entorno
 * Implementa whitelist de dominios y políticas de seguridad
 */
export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // Definir orígenes permitidos por entorno
    const allowedOrigins = isDevelopment 
      ? [
          'http://localhost:3000',    // React dev server
          'http://localhost:3001',    // Alternate port
          'http://127.0.0.1:3000',    // Local IP
        ]
      : [
          'https://medsearch.com',           // Producción
          'https://www.medsearch.com',       // WWW
          'https://api.medsearch.com',       // API subdomain
        ];

    // Permitir requests sin origin (móviles, Postman, etc.)
    if (!origin && isDevelopment) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin!)) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked origin: ${origin}`);
      callback(new Error(`Origen no permitido por CORS: ${origin}`));
    }
  },
  
  credentials: true,                    // Permitir cookies y auth headers
  optionsSuccessStatus: 200,           // Para compatibilidad con browsers legacy
  
  // Headers permitidos
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-ID',
    'X-API-Key'
  ],
  
  // Métodos HTTP permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  // Headers expuestos al cliente
  exposedHeaders: [
    'X-Request-ID',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  
  // Cache de preflight requests (24 horas)
  maxAge: isProduction ? 86400 : 3600
};

/**
 * Configuración CORS específica para endpoints de salud
 * Menos restrictiva para monitoreo
 */
export const healthCorsConfig: CorsOptions = {
  origin: true,
  methods: ['GET'],
  credentials: false
};