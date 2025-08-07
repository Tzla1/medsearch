// backend/src/server.ts - Punto de entrada de la aplicación
import app from './app';
import { config } from './config/environment';
import { mongoose } from './config/mongodb';

// Usar config.PORT para asegurar consistencia con environment.ts
const PORT = config.PORT;

// MongoDB health check function
const getMongoDBHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states: { [key: number]: string } = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    return {
      status: states[state] || 'unknown',
      database: mongoose.connection.db?.databaseName || 'unknown',
      host: mongoose.connection.host || 'unknown',
      port: mongoose.connection.port || 'unknown'
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// Ruta de verificación de salud
app.get('/health', async (req, res) => {
  try {
    const mongoHealth = await getMongoDBHealth();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: mongoHealth
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al verificar la salud del sistema',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Iniciar el servidor
const server = app.listen(PORT, async () => {
  try {
    console.log(`🚀 Servidor iniciado en el puerto ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    
    // MongoDB connection status
    console.log('📡 MongoDB connection status:', mongoose.connection.readyState === 1 ? '✅ Connected' : '⏳ Connecting...');
    
    console.log('\n📋 API Endpoints disponibles:');
    console.log('  • MongoDB API:');
    console.log('    - POST /api/webhooks/clerk');
    console.log('    - GET  /api/doctors');
    console.log('    - GET  /api/appointments');
    console.log('    - GET  /api/reviews');
    console.log('    - GET  /api/specialties');
    console.log('    - GET  /api/auth');
    console.log('  • Health Check:');
    console.log('    - GET  /health');
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
  }
});

// Manejo de señales de apagado
process.on('SIGTERM', () => {
  console.log('👋 Señal SIGTERM recibida, cerrando servidor...');
  server.close(async () => {
    try {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error);
    }
    console.log('✅ Servidor HTTP cerrado correctamente');
    process.exit(0);
  });
});

export default server;