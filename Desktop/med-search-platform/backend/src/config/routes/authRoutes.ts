// backend/src/config/routes/authRoutes.ts
/**
 * ===================================================================
 * RUTAS DE AUTENTICACIÓN Y REGISTRO
 * ===================================================================
 * Endpoints para gestión de usuarios, autenticación y sesiones
 */

import { Router } from 'express';
import * as authController from '../../controllers/authController';
import { validateRegistration, validateLogin, validateResetPassword, validateChangePassword } from '../middleware/validation';
import { authMiddleware, requireEmailVerified } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Registro de nuevo usuario
 * @access  Public
 */
router.post('/register', 
  validateRegistration,
  asyncHandler(authController.register)
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Iniciar sesión y obtener token
 * @access  Public
 */
router.post('/login', 
  validateLogin,
  asyncHandler(authController.login)
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Cerrar sesión (invalidar token)
 * @access  Private
 */
router.post('/logout', 
  authMiddleware,
  asyncHandler(authController.logout)
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
router.get('/me', 
  authMiddleware,
  asyncHandler(authController.getProfile)
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Solicitar restablecimiento de contraseña
 * @access  Public
 */
router.post('/reset-password', 
  validateResetPassword,
  asyncHandler(authController.requestPasswordReset)
);

/**
 * @route   POST /api/v1/auth/reset-password/:token
 * @desc    Confirmar restablecimiento con token
 * @access  Public
 */
router.post('/reset-password/:token', 
  validateChangePassword,
  asyncHandler(authController.resetPassword)
);

/**
 * @route   POST /api/v1/auth/verify-email/:token
 * @desc    Verificar correo electrónico
 * @access  Public
 */
router.get('/verify-email/:token', 
  asyncHandler(authController.verifyEmail)
);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Cambiar contraseña de usuario autenticado
 * @access  Private
 */
router.post('/change-password', 
  authMiddleware,
  validateChangePassword,
  asyncHandler(authController.changePassword)
);

/**
 * @route   GET /api/v1/auth/refresh-token
 * @desc    Refrescar token de autenticación
 * @access  Private
 */
router.get('/refresh-token', 
  authMiddleware,
  asyncHandler(authController.refreshToken)
);

export default router;