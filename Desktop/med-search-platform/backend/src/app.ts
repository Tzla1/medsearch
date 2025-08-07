// backend/src/app.ts - Integración de middleware
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';

import { 
  globalErrorHandler, 
  notFoundHandler, 
  requestIdMiddleware
} from './config/middleware/errorHandler';

// MongoDB-based routes
import webhookRoutes from './routes/webhooks';
import doctorRoutes from './routes/doctors';
import appointmentRoutes from './routes/appointments';
import reviewRoutes from './routes/reviews';
import specialtyRoutes from './routes/specialties';
import customerRoutes from './routes/customers';
import { authRoutes } from './routes/authRoutes';

// MongoDB connection
import { connectMongoDB } from './config/mongodb';

const app = express();

// Connect to MongoDB
connectMongoDB().catch(error => {
  console.error('Failed to connect to MongoDB:', error);
  process.exit(1);
});

// 1. Middleware de sistema (primero)
app.use(requestIdMiddleware);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
    },
  }
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// 2. Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 3. Servir archivos estáticos del frontend
const frontendPath = path.join(__dirname, '../../frontend/src');
app.use(express.static(frontendPath));

// 4. API Routes - MongoDB based
app.use('/api/webhooks', webhookRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/specialties', specialtyRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/auth', authRoutes);

// 5. Ruta para SPA (React/Frontend) - Maneja las rutas del frontend
app.get('*', (req, res) => {
  // Si la solicitud no es para la API o archivos estáticos, envía el index.html
  if (!req.path.startsWith('/api') && !req.path.includes('.')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    res.status(404).send('Not found');
  }
});

// 6. Middleware de captura (orden crítico)
app.use(notFoundHandler);        // Antes del error handler
app.use(globalErrorHandler);     // Último middleware

// Exportar la app para su uso en otros módulos
export default app;