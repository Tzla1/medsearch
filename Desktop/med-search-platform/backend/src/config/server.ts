// backend/src/server.ts
import { testConnection, getDatabaseHealth } from './config/database';

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbHealth = await getDatabaseHealth();
  
  res.status(dbHealth.status === 'healthy' ? 200 : 503).json({
    status: dbHealth.status,
    database: dbHealth.details,
    timestamp: new Date().toISOString()
  });
});