// backend/src/config/routes/userRoutes.ts
/**
 * ===================================================================
 * RUTAS DE GESTIÓN DE USUARIOS
 * ===================================================================
 * Endpoints para perfiles, preferencias y gestión de cuenta
 */

import { Router } from 'express';
import * as userController from '../../controllers/userController';
import { authMiddleware, requireOwnership, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Todas las rutas aquí requieren autenticación
// La protección ya está en app.ts: app.use('/api/v1/users', authMiddleware, userRoutes);

/**
 * @route   GET /api/v1/users/profile
 * @desc    Obtener perfil completo del usuario
 * @access  Private
 */
router.get('/profile', 
  asyncHandler(userController.getProfile)
);

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Actualizar perfil de usuario
 * @access  Private
 */
router.put('/profile', 
  asyncHandler(userController.updateProfile)
);

/**
 * @route   GET /api/v1/users/appointments
 * @desc    Obtener citas del usuario
 * @access  Private
 */
router.get('/appointments', 
  asyncHandler(userController.getAppointments)
);

/**
 * @route   POST /api/v1/users/favorites/:doctorId
 * @desc    Añadir médico a favoritos
 * @access  Private
 */
router.post('/favorites/:doctorId', 
  asyncHandler(userController.addFavorite)
);

/**
 * @route   DELETE /api/v1/users/favorites/:doctorId
 * @desc    Eliminar médico de favoritos
 * @access  Private
 */
router.delete('/favorites/:doctorId', 
  asyncHandler(userController.removeFavorite)
);

/**
 * @route   GET /api/v1/users/favorites
 * @desc    Listar médicos favoritos
 * @access  Private
 */
router.get('/favorites', 
  asyncHandler(userController.getFavorites)
);

/**
 * @route   GET /api/v1/users/notifications
 * @desc    Obtener notificaciones del usuario
 * @access  Private
 */
router.get('/notifications', 
  asyncHandler(userController.getNotifications)
);

/**
 * @route   PUT /api/v1/users/notifications/:id
 * @desc    Marcar notificación como leída
 * @access  Private
 */
router.put('/notifications/:id', 
  asyncHandler(userController.markNotificationRead)
);

/**
 * @route   POST /api/v1/users/reviews/:doctorId
 * @desc    Crear reseña para un médico
 * @access  Private
 */
router.post('/reviews/:doctorId', 
  asyncHandler(userController.createReview)
);

/**
 * @route   PUT /api/v1/users/reviews/:reviewId
 * @desc    Actualizar reseña
 * @access  Private (con verificación de propiedad)
 */
router.put('/reviews/:reviewId', 
  requireOwnership('reviewId'),
  asyncHandler(userController.updateReview)
);

/**
 * @route   DELETE /api/v1/users/reviews/:reviewId
 * @desc    Eliminar reseña
 * @access  Private (con verificación de propiedad)
 */
router.delete('/reviews/:reviewId', 
  requireOwnership('reviewId'),
  asyncHandler(userController.deleteReview)
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Obtener datos de usuario por ID (solo admin)
 * @access  Private (Admin)
 */
router.get('/:id', 
  requireRole(['admin']),
  asyncHandler(userController.getUserById)
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Actualizar datos de usuario por ID (solo admin)
 * @access  Private (Admin)
 */
router.put('/:id', 
  requireRole(['admin']),
  asyncHandler(userController.updateUser)
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Eliminar usuario (solo admin)
 * @access  Private (Admin)
 */
router.delete('/:id', 
  requireRole(['admin']),
  asyncHandler(userController.deleteUser)
);

export default router;