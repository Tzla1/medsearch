// backend/src/config/database.ts
/**
 * ===================================================================
 * CONFIGURACIÓN EMPRESARIAL DE BASE DE DATOS MYSQL
 * ===================================================================
 * Implementación de connection pooling con patrones de resiliencia
 * Optimizado para alta concurrencia y operaciones críticas de producción
 * Incluye health checking, metrics y graceful shutdown
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargar variables de entorno al inicio
dotenv.config();

/**
 * Interfaz de Configuración de Base de Datos
 * Define estructura tipada para parámetros de conexión empresarial
 */
interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
  acquireTimeout: number;
  timeout: number;
  queueLimit: number;
  reconnect: boolean;
  charset: string;
  timezone: string;
  ssl?: mysql.SslOptions;
  multipleStatements: boolean;
}

/**
 * Interfaz para Estadísticas de Pool de Conexiones
 * Métricas operacionales para monitoreo de performance
 */
interface PoolStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  queuedRequests: number;
  lastError?: string;
  uptime: number;
}

/**
 * Interfaz extendida para opciones de pool de MySQL
 * Incluye propiedades adicionales no presentes en la definición estándar
 */
interface ExtendedPoolOptions extends mysql.PoolOptions {
  acquireTimeout?: number;
  timeout?: number;
  reconnect?: boolean;
  idleTimeout?: number;
  maxIdle?: number;
  enableKeepAlive?: boolean;
  keepAliveInitialDelay?: number;
}

/**
 * Interfaz para acceder a propiedades internas del pool
 * Utilizado para obtener métricas y estadísticas
 */
interface InternalPoolState {
  _allConnections: any[];
  _freeConnections: any[];
  _connectionQueue: any[];
  config: {
    connectionLimit?: number;
  };
}

/**
 * Interfaz para Error de MySQL con código
 * Extiende Error para incluir códigos de error específicos de MySQL
 */
interface MySQLError extends Error {
  code?: string;
}

/**
 * Configuración Optimizada de Base de Datos
 * Parámetros balanceados para performance y estabilidad
 */
const createDatabaseConfig = (): DatabaseConfig => {
  // Validación de variables de entorno críticas
  const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Variables de entorno faltantes: ${missingVars.join(', ')}`);
  }

  return {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME!,
    
    // Configuración optimizada de pool
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
    acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000'), // 60 segundos
    timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '60000'), // 60 segundos
    queueLimit: parseInt(process.env.DB_QUEUE_LIMIT || '0'), // Sin límite de cola
    
    // Configuración de resiliencia
    reconnect: true,
    charset: 'utf8mb4',
    timezone: 'Z', // UTC para consistencia global
    multipleStatements: false, // Seguridad: prevenir SQL injection
    
    // Configuración SSL para producción
    ...(process.env.DB_SSL_ENABLED === 'true' && {
      ssl: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
        ca: process.env.DB_SSL_CA,
        cert: process.env.DB_SSL_CERT,
        key: process.env.DB_SSL_KEY
      }
    })
  };
};

/**
 * Clase Gestora de Base de Datos Empresarial
 * Implementa patrones Singleton y Factory para gestión centralizada
 */
class DatabaseManager {
  private static instance: DatabaseManager;
  private pool: mysql.Pool | null = null;
  private config: DatabaseConfig;
  private connectionAttempts: number = 0;
  private lastConnectionError: Error | null = null;
  private isShuttingDown: boolean = false;

  private constructor() {
    this.config = createDatabaseConfig();
    this.setupGracefulShutdown();
  }

  /**
   * Patrón Singleton para instancia única
   * Garantiza una sola instancia del manager en toda la aplicación
   */
  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Inicialización del Pool de Conexiones
   * Configuración empresarial con logging estructurado
   */
  public initializePool(): mysql.Pool {
    if (this.pool) {
      console.log('📊 Pool de conexiones ya inicializado');
      return this.pool;
    }

    try {
      console.log('🔄 Inicializando pool de conexiones MySQL...');
      console.log(`📍 Conectando a: ${this.config.host}:${this.config.port}/${this.config.database}`);
      
      // Use type assertion to avoid TypeScript errors with additional properties
      this.pool = mysql.createPool({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        connectionLimit: this.config.connectionLimit,
        acquireTimeout: this.config.acquireTimeout,
        timeout: this.config.timeout,
        queueLimit: this.config.queueLimit,
        waitForConnections: true,
        reconnect: this.config.reconnect,
        charset: this.config.charset,
        timezone: this.config.timezone,
        multipleStatements: this.config.multipleStatements,
        ssl: this.config.ssl,
        
        // Configuración avanzada de pool
        idleTimeout: 300000, // 5 minutos
        maxIdle: 5, // Máximo conexiones idle
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        
        // Configuración de retry y backoff
        typeCast: function (field, next) {
          // Conversión automática de tipos MySQL a JavaScript
          if (field.type === 'TINY' && field.length === 1) {
            return field.string() === '1'; // TINYINT(1) -> Boolean
          }
          return next();
        }
      } as ExtendedPoolOptions);

      // Event listeners para monitoreo del pool
      this.setupPoolEventListeners();
      
      console.log('✅ Pool de conexiones MySQL inicializado exitosamente');
      console.log(`🔧 Configuración: ${this.config.connectionLimit} conexiones máximas`);
      
      this.connectionAttempts = 0;
      this.lastConnectionError = null;
      
      return this.pool;
    } catch (error) {
      this.connectionAttempts++;
      this.lastConnectionError = error as Error;
      
      console.error('❌ Error al inicializar pool de conexiones:', error);
      throw new Error(`Fallo en inicialización de base de datos: ${error}`);
    }
  }

  /**
   * Configuración de Event Listeners para Pool
   * Monitoreo de eventos del ciclo de vida de conexiones
   */
  private setupPoolEventListeners(): void {
    if (!this.pool) return;

    this.pool.on('connection', (connection) => {
      console.log(`🔗 Nueva conexión establecida: ID ${connection.threadId}`);
    });

    // Type assertion para manejar 'error' event que no está en los tipos de mysql2
    (this.pool as any).on('error', (error: MySQLError) => {
      console.error('🚨 Error en pool de conexiones:', error);
      this.lastConnectionError = error;
      
      // Intentar reconexión automática
      if (error.code === 'PROTOCOL_CONNECTION_LOST' || error.code === 'ECONNRESET') {
        console.log('🔄 Intentando reconexión automática...');
        setTimeout(() => this.testConnection(), 5000);
      }
    });

    this.pool.on('acquire', (connection) => {
      console.log(`📥 Conexión adquirida del pool: ID ${connection.threadId}`);
    });

    this.pool.on('release', (connection) => {
      console.log(`📤 Conexión liberada al pool: ID ${connection.threadId}`);
    });
  }

  /**
   * Verificación de Conectividad Robusta
   * Health check con retry logic y timeout configurables
   */
  public async testConnection(retries: number = 3): Promise<boolean> {
    if (!this.pool) {
      console.warn('⚠️ Pool no inicializado para test de conexión');
      return false;
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔍 Verificando conectividad (intento ${attempt}/${retries})...`);
        
        const connection = await this.pool.getConnection();
        
        // Test básico de conectividad
        await connection.ping();
        
        // Test funcional con query simple
        const [rows] = await connection.execute('SELECT 1 as test, NOW() as timestamp');
        
        connection.release();
        
        console.log('✅ Conectividad verificada exitosamente');
        console.log(`📊 Test query result:`, rows);
        
        this.lastConnectionError = null;
        return true;
        
      } catch (error) {
        console.error(`❌ Error en test de conectividad (intento ${attempt}):`, error);
        this.lastConnectionError = error as Error;
        
        if (attempt < retries) {
          const backoffTime = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`⏳ Reintentando en ${backoffTime/1000} segundos...`);
          await this.sleep(backoffTime);
        }
      }
    }
    
    console.error('❌ Todos los intentos de conectividad fallaron');
    return false;
  }

  /**
   * Obtención Segura del Pool de Conexiones
   * Getter con validación y lazy initialization
   */
  public getPool(): mysql.Pool {
    if (!this.pool) {
      console.log('🔄 Pool no inicializado, inicializando automáticamente...');
      return this.initializePool();
    }
    
    if (this.isShuttingDown) {
      throw new Error('Base de datos en proceso de cierre, no se pueden crear nuevas conexiones');
    }
    
    return this.pool;
  }

  /**
   * Estadísticas del Pool de Conexiones
   * Métricas operacionales para monitoreo y debugging
   */
  public async getPoolStats(): Promise<PoolStats> {
    if (!this.pool) {
      throw new Error('Pool no inicializado');
    }

    try {
      // Acceso a estadísticas internas del pool (mysql2 específico)
      // Type assertion para acceder a propiedades internas del pool
      const poolState = this.pool.pool as unknown as InternalPoolState;
      const poolConfig = poolState.config;
      
      return {
        totalConnections: poolConfig.connectionLimit || 0,
        activeConnections: poolState._allConnections.length - poolState._freeConnections.length,
        idleConnections: poolState._freeConnections.length,
        queuedRequests: poolState._connectionQueue.length,
        lastError: this.lastConnectionError?.message,
        uptime: Math.floor(process.uptime())
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del pool:', error);
      throw error;
    }
  }

  /**
   * Ejecución de Consulta con Retry Logic
   * Wrapper empresarial para queries con manejo de errores robusto
   */
  public async executeQuery<T = any>(
    query: string, 
    params: any[] = [],
    options: { retries?: number; timeout?: number } = {}
  ): Promise<T> {
    const { retries = 2, timeout = 30000 } = options;
    const pool = this.getPool();

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        const connection = await pool.getConnection();
        
        try {
          // Configurar timeout para la consulta
          if (timeout > 0) {
            await connection.execute('SET SESSION max_execution_time = ?', [timeout]);
          }
          
          console.log(`📝 Ejecutando query (intento ${attempt}):`, query.substring(0, 100) + '...');
          
          const startTime = Date.now();
          const result = await connection.execute(query, params);
          const executionTime = Date.now() - startTime;
          
          console.log(`⏱️ Query ejecutada en ${executionTime}ms`);
          
          return result as T;
          
        } finally {
          connection.release();
        }
        
      } catch (error) {
        console.error(`❌ Error en query (intento ${attempt}):`, error);
        
        // Determinar si el error es recuperable
        const isRecoverable = this.isRecoverableError(error as MySQLError);
        
        if (attempt <= retries && isRecoverable) {
          const backoffTime = Math.pow(2, attempt) * 1000;
          console.log(`🔄 Reintentando query en ${backoffTime/1000} segundos...`);
          await this.sleep(backoffTime);
          continue;
        }
        
        throw error;
      }
    }
    
    // This is needed to avoid TypeScript error about missing return statement
    // This code will never be reached due to the for loop structure, but TypeScript doesn't recognize that
    throw new Error('Este código nunca debería ser alcanzado debido a la estructura del bucle');
  }

  /**
   * Determinación de Errores Recuperables
   * Lógica para identificar errores temporales vs. permanentes
   */
  private isRecoverableError(error: MySQLError): boolean {
    const recoverableErrorCodes = [
      'PROTOCOL_CONNECTION_LOST',
      'ECONNRESET',
      'ENOTFOUND',
      'ETIMEDOUT',
      'ECONNREFUSED'
    ];
    
    return recoverableErrorCodes.some(code => error.message.includes(code));
  }

  /**
   * Cierre Graceful de Conexiones
   * Proceso ordenado de cierre con timeout de seguridad
   */
  public async closeConnections(): Promise<void> {
    if (!this.pool || this.isShuttingDown) {
      console.log('ℹ️ Pool ya cerrado o en proceso de cierre');
      return;
    }

    this.isShuttingDown = true;
    
    try {
      console.log('🔄 Iniciando cierre graceful de conexiones...');
      
      // Timeout de seguridad para cierre forzado
      const closeTimeout = setTimeout(() => {
        console.warn('⚠️ Timeout de cierre graceful, forzando cierre de pool');
        this.pool?.end();
      }, 10000); // 10 segundos máximo
      
      await this.pool.end();
      clearTimeout(closeTimeout);
      
      console.log('✅ Pool de conexiones cerrado exitosamente');
      this.pool = null;
      
    } catch (error) {
      console.error('❌ Error durante cierre de pool:', error);
      throw error;
    } finally {
      this.isShuttingDown = false;
    }
  }

  /**
   * Configuración de Graceful Shutdown
   * Manejo de señales del sistema para cierre ordenado
   */
  private setupGracefulShutdown(): void {
    const shutdownHandler = async (signal: string) => {
      console.log(`\n🔔 Señal ${signal} recibida, iniciando cierre graceful...`);
      
      try {
        await this.closeConnections();
        console.log('✅ Cierre graceful completado');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error durante cierre graceful:', error);
        process.exit(1);
      }
    };

    // Capturar señales del sistema
    process.on('SIGINT', () => shutdownHandler('SIGINT'));
    process.on('SIGTERM', () => shutdownHandler('SIGTERM'));
    
    // Manejo de errores no capturados
    process.on('uncaughtException', (error) => {
      console.error('💥 Excepción no capturada:', error);
      shutdownHandler('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Promise rechazada no manejada:', reason);
      console.error('Promise:', promise);
      shutdownHandler('UNHANDLED_REJECTION');
    });
  }

  /**
   * Utilidad para Sleep con Promises
   * Helper para implementar delays con async/await
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Health Check Completo del Sistema
   * Verificación integral del estado de la base de datos
   */
  public async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
  }> {
    try {
      const isConnected = await this.testConnection(1);
      const stats = await this.getPoolStats();
      
      const status = isConnected ? 'healthy' : 'unhealthy';
      
      return {
        status,
        details: {
          connected: isConnected,
          pool: stats,
          config: {
            host: this.config.host,
            port: this.config.port,
            database: this.config.database,
            connectionLimit: this.config.connectionLimit
          },
          lastError: this.lastConnectionError?.message,
          uptime: Math.floor(process.uptime()),
          environment: process.env.NODE_ENV || 'development'
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          connected: false,
          error: (error as Error).message,
          uptime: Math.floor(process.uptime())
        }
      };
    }
  }
}

// ===================================================================
// EXPORTACIONES PÚBLICAS - API SIMPLIFICADA
// ===================================================================

/**
 * Instancia Singleton del Database Manager
 * Punto de acceso único para toda la aplicación
 * Note: Commented out to prevent immediate initialization when MongoDB is being used
 */
// const dbManager = DatabaseManager.getInstance();

/**
 * Inicialización del Pool de Conexiones
 * Función de configuración inicial (llamar al inicio de la app)
 */
export const initializeDatabase = (): mysql.Pool => {
  return DatabaseManager.getInstance().initializePool();
};

/**
 * Obtención del Pool de Conexiones
 * Getter principal para uso en servicios y controladores
 */
export const getDatabase = (): mysql.Pool => {
  return DatabaseManager.getInstance().getPool();
};

/**
 * Verificación de Conectividad
 * Health check simple para middleware y monitoreo
 */
export const testConnection = async (): Promise<boolean> => {
  return await DatabaseManager.getInstance().testConnection();
};

/**
 * Cierre de Conexiones
 * Función de cleanup para shutdown graceful
 */
export const closeDatabase = async (): Promise<void> => {
  return await DatabaseManager.getInstance().closeConnections();
};

/**
 * Estadísticas del Pool
 * Métricas para monitoreo y debugging
 */
export const getDatabaseStats = async (): Promise<PoolStats> => {
  return await DatabaseManager.getInstance().getPoolStats();
};

/**
 * Ejecución de Query con Retry
 * Wrapper empresarial para consultas críticas
 */
export const executeQuery = async <T = any>(
  query: string, 
  params: any[] = [],
  options?: { retries?: number; timeout?: number }
): Promise<T> => {
  return await DatabaseManager.getInstance().executeQuery<T>(query, params, options);
};

/**
 * Health Status Completo
 * Estado integral del sistema de base de datos
 */
export const getDatabaseHealth = async () => {
  return await DatabaseManager.getInstance().getHealthStatus();
};

// ===================================================================
// CONFIGURACIÓN DE DESARROLLO Y TESTING
// ===================================================================

/**
 * Configuración Específica para Testing
 * Pool con parámetros optimizados para tests
 */
export const createTestDatabasePool = (): mysql.Pool => {
  const testConfig = {
    ...createDatabaseConfig(),
    database: process.env.DB_TEST_NAME || 'med_search_test',
    connectionLimit: 3, // Menor para tests
    acquireTimeout: 10000,
    timeout: 10000
  };

  return mysql.createPool(testConfig as ExtendedPoolOptions);
};

/**
 * Logging de Configuración al Inicio
 * Información útil para debugging de configuración
 */
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Configuración de Base de Datos:');
  console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   Puerto: ${process.env.DB_PORT || '3306'}`);
  console.log(`   Base de datos: ${process.env.DB_NAME || 'med_search_db'}`);
  console.log(`   Usuario: ${process.env.DB_USER || 'root'}`);
  console.log(`   Pool limit: ${process.env.DB_CONNECTION_LIMIT || '10'}`);
  console.log(`   SSL habilitado: ${process.env.DB_SSL_ENABLED || 'false'}`);
}

// Exportar tipos para uso en otros módulos
export type { DatabaseConfig, PoolStats };