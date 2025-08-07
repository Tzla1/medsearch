// backend/src/config/environment.ts
/**
 * ===================================================================
 * CONFIGURACIÓN DE ENTORNO Y VARIABLES DE AMBIENTE
 * ===================================================================
 * Gestión centralizada de variables de entorno con validación
 * Soporte para múltiples entornos (development, testing, production)
 */

import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Función validadora de variables de entorno
 * Verifica la presencia de variables críticas
 */
const validateEnv = (): void => {
  const requiredVars = [
    'NODE_ENV',
    'PORT',
    'MONGODB_URI',
    'MONGODB_DB_NAME'
  ];
  
  const missingVars = requiredVars.filter(
    varName => !process.env[varName]
  );
  
  if (missingVars.length > 0) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Variables de entorno faltantes: ${missingVars.join(', ')}`);
    } else {
      console.warn(`⚠️ Variables de entorno faltantes: ${missingVars.join(', ')}`);
    }
  }
};

/**
 * Configuración de entorno centralizada
 * Valores por defecto para desarrollo local
 */
export const config = {
  // Entorno de ejecución
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Configuración del servidor
  PORT: parseInt(process.env.PORT || '5000', 10),
  API_PREFIX: '/api',
  
  // MongoDB Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'med_search_platform',
  
  // Clerk Authentication
  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutos
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 solicitudes
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Flags de características
  FEATURE_DOCTOR_VERIFICATION: process.env.FEATURE_DOCTOR_VERIFICATION === 'true',
  FEATURE_EMAIL_VERIFICATION: process.env.FEATURE_EMAIL_VERIFICATION === 'true',
  
  // Timeout para operaciones
  REQUEST_TIMEOUT_MS: parseInt(process.env.REQUEST_TIMEOUT_MS || '30000', 10) // 30 segundos
};

// Ejecutar validación en arranque
validateEnv();

// Logging de configuración en desarrollo
if (config.NODE_ENV === 'development') {
  console.log('🔧 Configuración de entorno cargada:');
  console.log(`   Entorno: ${config.NODE_ENV}`);
  console.log(`   Puerto: ${config.PORT}`);
  console.log(`   Prefijo API: ${config.API_PREFIX}`);
  console.log(`   CORS: ${config.CORS_ORIGIN}`);
  console.log(`   Nivel de log: ${config.LOG_LEVEL}`);
}

// Exportar configuración y utilidades
export default config;