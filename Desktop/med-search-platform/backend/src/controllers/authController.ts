/**
 * Authentication Controller
 * Handles user authentication operations
 */

import { Request, Response } from 'express';
import { authService } from '../services/authService';

export class AuthController {
  /**
   * Register new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { firstName, lastName, email, phone, password } = req.body;

      // Basic validation
      const errors: string[] = [];
      
      if (!firstName || firstName.trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
      }
      
      if (!lastName || lastName.trim().length < 2) {
        errors.push('El apellido debe tener al menos 2 caracteres');
      }
      
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Email inválido');
      }
      
      if (!phone || !/^[\d\s\-\(\)]{10,}$/.test(phone)) {
        errors.push('Teléfono inválido');
      }
      
      if (!password || password.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres');
      }

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors
        });
        return;
      }

      // Check if user already exists
      const existingUser = await authService.findUserByEmail(email);
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'Ya existe un usuario con este email'
        });
        return;
      }

      // Create user
      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password
      };

      const result = await authService.createUser(userData);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        user: result.user,
        token: result.token
      });

    } catch (error) {
      console.error('Error in register:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Basic validation
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Email inválido'
        });
        return;
      }

      if (!password) {
        res.status(400).json({
          success: false,
          message: 'Contraseña requerida'
        });
        return;
      }

      const result = await authService.loginUser(email.toLowerCase().trim(), password);

      if (!result) {
        res.status(401).json({
          success: false,
          message: 'Credenciales incorrectas'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        user: result.user,
        token: result.token
      });

    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;

      const user = await authService.findUserById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: 'patient'
        }
      });

    } catch (error) {
      console.error('Error in getProfile:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

export const authController = new AuthController();