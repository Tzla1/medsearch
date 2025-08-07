// backend/src/controllers/userController.ts
/**
 * ===================================================================
 * CONTROLADOR DE USUARIOS
 * ===================================================================
 * Lógica de negocio para gestión de perfiles y preferencias
 */

import { Response } from 'express';
import { getDatabase } from '../config/database';
import { ErrorFactory } from '../config/middleware/errorHandler';
import { AuthenticatedRequest } from '../config/middleware/auth';

// Interfaces for database results
interface UserRow {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  user_type: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface NotificationRow {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: number; // MySQL boolean as number
  created_at: string;
  read_at: string;
  link_url: string;
}

interface ReviewRow {
  id: number;
  doctor_id: number;
  user_id: number;
  rating: number;
  comment: string;
}

interface ResultWithInsertId {
  insertId: number;
}

/**
 * @route   GET /api/v1/users/profile
 * @desc    Obtener perfil completo del usuario
 * @access  Private
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw ErrorFactory.unauthorized('Usuario no autenticado');
  }
  
  const db = getDatabase();
  
  try {
    // Obtener datos completos del usuario
    const [rows] = await db.execute(
      `SELECT 
        id, email, first_name, last_name, phone, 
        date_of_birth, gender, address, city, state, zip_code,
        user_type, is_active, email_verified, created_at, updated_at
       FROM users 
       WHERE id = ?`,
      [req.user.id]
    );
    
    if (!Array.isArray(rows) || rows.length === 0) {
      throw ErrorFactory.unauthorized('Usuario no encontrado');
    }
    
    const user = (rows as any[])[0] as UserRow;
    
    // Responder con datos de usuario (sin contraseña)
    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        dateOfBirth: user.date_of_birth,
        gender: user.gender,
        address: user.address,
        city: user.city,
        state: user.state,
        zipCode: user.zip_code,
        userType: user.user_type,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });
    
  } catch (error) {
    throw error;
  }
};

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Actualizar perfil de usuario
 * @access  Private
 */
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw ErrorFactory.unauthorized('Usuario no autenticado');
  }
  
  const { firstName, lastName, phone, dateOfBirth, gender, address, city, state, zipCode } = req.body;
  const db = getDatabase();
  
  try {
    // Construir consulta dinámica solo con campos proporcionados
    const updates: string[] = [];
    const values: any[] = [];
    
    if (firstName !== undefined) {
      updates.push('first_name = ?');
      values.push(firstName);
    }
    
    if (lastName !== undefined) {
      updates.push('last_name = ?');
      values.push(lastName);
    }
    
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    
    if (dateOfBirth !== undefined) {
      updates.push('date_of_birth = ?');
      values.push(dateOfBirth);
    }
    
    if (gender !== undefined) {
      updates.push('gender = ?');
      values.push(gender);
    }
    
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address);
    }
    
    if (city !== undefined) {
      updates.push('city = ?');
      values.push(city);
    }
    
    if (state !== undefined) {
      updates.push('state = ?');
      values.push(state);
    }
    
    if (zipCode !== undefined) {
      updates.push('zip_code = ?');
      values.push(zipCode);
    }
    
    // Agregar timestamp de actualización
    updates.push('updated_at = NOW()');
    
    // Si no hay campos para actualizar
    if (updates.length === 1) {
      throw ErrorFactory.validationError('No se proporcionaron datos para actualizar');
    }
    
    // Agregar el ID de usuario al final de los valores
    values.push(req.user.id);
    
    // Ejecutar consulta de actualización
    await db.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    // Obtener datos actualizados
    const [rows] = await db.execute(
      `SELECT 
        id, email, first_name, last_name, phone, 
        date_of_birth, gender, address, city, state, zip_code,
        user_type, is_active, email_verified, updated_at
       FROM users 
       WHERE id = ?`,
      [req.user.id]
    );
    
    const user = (rows as any[])[0] as UserRow;
    
    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        dateOfBirth: user.date_of_birth,
        gender: user.gender,
        address: user.address,
        city: user.city,
        state: user.state,
        zipCode: user.zip_code,
        userType: user.user_type,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        updatedAt: user.updated_at
      }
    });
    
  } catch (error) {
    throw error;
  }
};

/**
 * @route   GET /api/v1/users/appointments
 * @desc    Obtener citas del usuario
 * @access  Private
 */
export const getAppointments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw ErrorFactory.unauthorized('Usuario no autenticado');
  }
  
  const db = getDatabase();
  
  try {
    // Obtener citas del usuario
    const [rows] = await db.execute(
      `SELECT 
        a.id, a.doctor_id, a.appointment_date, a.appointment_time,
        a.reason_for_visit, a.status, a.created_at,
        d.first_name as doctor_first_name, d.last_name as doctor_last_name,
        s.name as specialty_name
       FROM appointments a
       INNER JOIN doctors d ON a.doctor_id = d.id
       INNER JOIN specialties s ON d.specialty_id = s.id
       WHERE a.patient_id = ?
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [req.user.id]
    );
    
    res.status(200).json({
      success: true,
      data: (rows as any[]).map((row: any) => ({
        id: row.id,
        doctorId: row.doctor_id,
        doctorName: `${row.doctor_first_name} ${row.doctor_last_name}`,
        specialty: row.specialty_name,
        date: row.appointment_date,
        time: row.appointment_time,
        reasonForVisit: row.reason_for_visit,
        status: row.status,
        createdAt: row.created_at
      }))
    });
    
  } catch (error) {
    throw error;
  }
};

/**
 * @route   POST /api/v1/users/favorites/:doctorId
 * @desc    Añadir médico a favoritos
 * @access  Private
 */
export const addFavorite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw ErrorFactory.unauthorized('Usuario no autenticado');
  }
  
  const { doctorId } = req.params;
  const db = getDatabase();
  
  try {
    // Verificar si el médico existe
    const [doctors] = await db.execute(
      'SELECT id FROM doctors WHERE id = ?',
      [doctorId]
    );
    
    if (!Array.isArray(doctors) || doctors.length === 0) {
      throw ErrorFactory.validationError('Médico no encontrado');
    }
    
    // Verificar si ya está en favoritos
    const [favorites] = await db.execute(
      'SELECT id FROM user_favorites WHERE user_id = ? AND doctor_id = ?',
      [req.user.id, doctorId]
    );
    
    if (Array.isArray(favorites) && favorites.length > 0) {
      // Ya está en favoritos, no hacer nada
      res.status(200).json({
        success: true,
        message: 'Médico ya está en favoritos'
      });
      return;
    }
    
    // Añadir a favoritos
    await db.execute(
      'INSERT INTO user_favorites (user_id, doctor_id, created_at) VALUES (?, ?, NOW())',
      [req.user.id, doctorId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Médico añadido a favoritos'
    });
    
  } catch (error) {
    throw error;
  }
};

/**
 * @route   DELETE /api/v1/users/favorites/:doctorId
 * @desc    Eliminar médico de favoritos
 * @access  Private
 */
export const removeFavorite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw ErrorFactory.unauthorized('Usuario no autenticado');
  }
  
  const { doctorId } = req.params;
  const db = getDatabase();
  
  try {
    // Eliminar de favoritos
    await db.execute(
      'DELETE FROM user_favorites WHERE user_id = ? AND doctor_id = ?',
      [req.user.id, doctorId]
    );
    
    res.status(200).json({
      success: true,
      message: 'Médico eliminado de favoritos'
    });
    
  } catch (error) {
    throw error;
  }
};

/**
 * @route   GET /api/v1/users/favorites
 * @desc    Listar médicos favoritos
 * @access  Private
 */
export const getFavorites = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw ErrorFactory.unauthorized('Usuario no autenticado');
  }
  
  const db = getDatabase();
  
  try {
    // Obtener favoritos
    const [rows] = await db.execute(
      `SELECT 
        f.doctor_id, f.created_at,
        d.first_name, d.last_name, 
        s.name as specialty_name
       FROM user_favorites f
       INNER JOIN doctors d ON f.doctor_id = d.id
       INNER JOIN specialties s ON d.specialty_id = s.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    
    res.status(200).json({
      success: true,
      data: (rows as any[]).map((row: any) => ({
        doctorId: row.doctor_id,
        doctorName: `${row.first_name} ${row.last_name}`,
        specialty: row.specialty_name,
        addedAt: row.created_at
      }))
    });
    
  } catch (error) {
    throw error;
  }
};

/**
 * @route   GET /api/v1/users/notifications
 * @desc    Obtener notificaciones del usuario
 * @access  Private
 */
export const getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw ErrorFactory.unauthorized('Usuario no autenticado');
  }
  
  const db = getDatabase();
  
  try {
    // Obtener notificaciones
    const [rows] = await db.execute(
      `SELECT 
        id, type, title, message, is_read, 
        created_at, read_at, link_url
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );
    
    res.status(200).json({
      success: true,
      data: (rows as NotificationRow[]).map((row: NotificationRow) => ({
        id: row.id,
        type: row.type,
        title: row.title,
        message: row.message,
        isRead: Boolean(row.is_read),
        createdAt: row.created_at,
        readAt: row.read_at,
        linkUrl: row.link_url
      }))
    });
    
  } catch (error) {
    throw error;
  }
};

/**
 * @route   PUT /api/v1/users/notifications/:id
 * @desc    Marcar notificación como leída
 * @access  Private
 */
export const markNotificationRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw ErrorFactory.unauthorized('Usuario no autenticado');
  }
  
  const { id } = req.params;
  const db = getDatabase();
  
  try {
    // Verificar si la notificación existe y pertenece al usuario
    const [notifications] = await db.execute(
      'SELECT id, is_read FROM notifications WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    
    if (!Array.isArray(notifications) || notifications.length === 0) {
      throw ErrorFactory.validationError('Notificación no encontrada');
    }
    
    const notification = notifications[0] as NotificationRow;
    
    // Si ya está marcada como leída, no hacer nada
    if (notification.is_read) {
      res.status(200).json({
        success: true,
        message: 'Notificación ya marcada como leída'
      });
      return;
    }
    
    // Marcar como leída
    await db.execute(
      'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ?',
      [id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Notificación marcada como leída'
    });
    
  } catch (error) {
    throw error;
  }
};

/**
 * @route   POST /api/v1/users/reviews/:doctorId
 * @desc    Crear reseña para un médico
 * @access  Private
 */
export const createReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw ErrorFactory.unauthorized('Usuario no autenticado');
  }
  
  const { doctorId } = req.params;
  const { rating, comment } = req.body;
  const db = getDatabase();
  
  try {
    // Verificar si el médico existe
    const [doctors] = await db.execute(
      'SELECT id FROM doctors WHERE id = ?',
      [doctorId]
    );
    
    if (!Array.isArray(doctors) || doctors.length === 0) {
      throw ErrorFactory.validationError('Médico no encontrado');
    }
    
    // Verificar si el usuario ya ha dejado una reseña para este médico
    const [reviews] = await db.execute(
      'SELECT id FROM reviews WHERE user_id = ? AND doctor_id = ?',
      [req.user.id, doctorId]
    );
    
    if (Array.isArray(reviews) && reviews.length > 0) {
      throw ErrorFactory.validationError('Ya has dejado una reseña para este médico');
    }
    
    // Verificar si el usuario ha tenido una cita con este médico
    // (opcional, descomenta si es requerido)
    /*
    const [appointments] = await db.execute(
      'SELECT id FROM appointments WHERE patient_id = ? AND doctor_id = ? AND status = "completed"',
      [req.user.id, doctorId]
    );
    
    if (!Array.isArray(appointments) || appointments.length === 0) {
      throw ErrorFactory.validationError('Debes haber tenido una cita con este médico para dejar una reseña');
    }
    */
    
    // Crear reseña
    const [result] = await db.execute(
      `INSERT INTO reviews (
        user_id, doctor_id, rating, comment, created_at
      ) VALUES (?, ?, ?, ?, NOW())`,
      [req.user.id, doctorId, rating, comment]
    );
    
    const insertId = (result as any).insertId;
    
    // Actualizar calificación promedio del médico
    await db.execute(
      `UPDATE doctors 
       SET rating_avg = (
         SELECT AVG(rating) FROM reviews WHERE doctor_id = ?
       ),
       rating_count = (
         SELECT COUNT(*) FROM reviews WHERE doctor_id = ?
       )
       WHERE id = ?`,
      [doctorId, doctorId, doctorId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Reseña creada exitosamente',
      data: {
        id: insertId,
        doctorId,
        rating,
        comment
      }
    });
    
  } catch (error) {
    throw error;
  }
};

/**
 * @route   PUT /api/v1/users/reviews/:reviewId
 * @desc    Actualizar reseña
 * @access  Private (con verificación de propiedad)
 */
export const updateReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw ErrorFactory.unauthorized('Usuario no autenticado');
  }
  
  const { reviewId } = req.params;
  const { rating, comment } = req.body;
  const db = getDatabase();
  
  try {
    // Obtener información de la reseña
    const [reviews] = await db.execute(
      'SELECT id, doctor_id FROM reviews WHERE id = ? AND user_id = ?',
      [reviewId, req.user.id]
    );
    
    if (!Array.isArray(reviews) || reviews.length === 0) {
      throw ErrorFactory.validationError('Reseña no encontrada');
    }
    
    const review = reviews[0] as ReviewRow;
    
    // Actualizar reseña
    await db.execute(
      `UPDATE reviews 
       SET rating = ?, comment = ?, updated_at = NOW()
       WHERE id = ?`,
      [rating, comment, reviewId]
    );
    
    // Actualizar calificación promedio del médico
    await db.execute(
      `UPDATE doctors 
       SET rating_avg = (
         SELECT AVG(rating) FROM reviews WHERE doctor_id = ?
       )
       WHERE id = ?`,
      [review.doctor_id, review.doctor_id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Reseña actualizada exitosamente',
      data: {
        id: reviewId,
        doctorId: review.doctor_id,
        rating,
        comment
      }
    });
    
  } catch (error) {
    throw error;
  }
};

/**
 * @route   DELETE /api/v1/users/reviews/:reviewId
 * @desc    Eliminar reseña
 * @access  Private (con verificación de propiedad)
 */
export const deleteReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw ErrorFactory.unauthorized('Usuario no autenticado');
  }
  
  const { reviewId } = req.params;
  const db = getDatabase();
  
  try {
    // Obtener información de la reseña
    const [reviews] = await db.execute(
      'SELECT id, doctor_id FROM reviews WHERE id = ? AND user_id = ?',
      [reviewId, req.user.id]
    );
    
    if (!Array.isArray(reviews) || reviews.length === 0) {
      throw ErrorFactory.validationError('Reseña no encontrada');
    }
    
    const review = reviews[0] as ReviewRow;
    
    // Eliminar reseña
    await db.execute(
      'DELETE FROM reviews WHERE id = ?',
      [reviewId]
    );
    
    // Actualizar calificación promedio del médico
    await db.execute(
      `UPDATE doctors 
       SET rating_avg = (
         SELECT AVG(rating) FROM reviews WHERE doctor_id = ?
       ),
       rating_count = (
         SELECT COUNT(*) FROM reviews WHERE doctor_id = ?
       )
       WHERE id = ?`,
      [review.doctor_id, review.doctor_id, review.doctor_id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Reseña eliminada exitosamente'
    });
    
  } catch (error) {
    throw error;
  }
};

/**
 * @route   GET /api/v1/users/:id
 * @desc    Obtener datos de usuario por ID (solo admin)
 * @access  Private (Admin)
 */
export const getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw ErrorFactory.unauthorized('Usuario no autenticado');
  }
  
  if (req.user.userType !== 'admin') {
    throw ErrorFactory.forbidden('Acceso restringido a administradores');
  }
  
  const { id } = req.params;
  const db = getDatabase();
  
  try {
    // Obtener datos del usuario
    const [rows] = await db.execute(
      `SELECT 
        id, email, first_name, last_name, phone, 
        date_of_birth, gender, address, city, state, zip_code,
        user_type, is_active, email_verified, created_at, updated_at
       FROM users 
       WHERE id = ?`,
      [id]
    );
    
    if (!Array.isArray(rows) || rows.length === 0) {
      throw ErrorFactory.validationError('Usuario no encontrado');
    }
    
    const user = (rows as any[])[0] as UserRow;
    
    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        dateOfBirth: user.date_of_birth,
        gender: user.gender,
        address: user.address,
        city: user.city,
        state: user.state,
        zipCode: user.zip_code,
        userType: user.user_type,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });
    
  } catch (error) {
    throw error;
  }
};

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Actualizar datos de usuario por ID (solo admin)
 * @access  Private (Admin)
 */
export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw ErrorFactory.unauthorized('Usuario no autenticado');
  }
  
  if (req.user.userType !== 'admin') {
    throw ErrorFactory.forbidden('Acceso restringido a administradores');
  }
  
  const { id } = req.params;
  const { firstName, lastName, email, isActive, userType } = req.body;
  const db = getDatabase();
  
  try {
    // Verificar si el usuario existe
    const [users] = await db.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );
    
    if (!Array.isArray(users) || users.length === 0) {
      throw ErrorFactory.validationError('Usuario no encontrado');
    }
    
    // Construir consulta dinámica solo con campos proporcionados
    const updates: string[] = [];
    const values: any[] = [];
    
    if (firstName !== undefined) {
      updates.push('first_name = ?');
      values.push(firstName);
    }
    
    if (lastName !== undefined) {
      updates.push('last_name = ?');
      values.push(lastName);
    }
    
    if (email !== undefined) {
      // Verificar si el email ya existe en otro usuario
      const [existingUsers] = await db.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );
      
      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        throw ErrorFactory.duplicateResource('Email', email);
      }
      
      updates.push('email = ?');
      values.push(email);
    }
    
    if (isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(isActive);
    }
    
    if (userType !== undefined) {
      // Validar tipo de usuario
      if (!['patient', 'doctor', 'admin'].includes(userType)) {
        throw ErrorFactory.validationError('Tipo de usuario inválido');
      }
      
      updates.push('user_type = ?');
      values.push(userType);
    }
    
    // Agregar timestamp de actualización
    updates.push('updated_at = NOW()');
    
    // Si no hay campos para actualizar
    if (updates.length === 1) {
      throw ErrorFactory.validationError('No se proporcionaron datos para actualizar');
    }
    
    // Agregar el ID de usuario al final de los valores
    values.push(id);
    
    // Ejecutar consulta de actualización
    await db.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    // Obtener datos actualizados
    const [rows] = await db.execute(
      `SELECT 
        id, email, first_name, last_name, 
        user_type, is_active, updated_at
       FROM users 
       WHERE id = ?`,
      [id]
    );
    
    const user = (rows as any[])[0] as UserRow;
    
    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type,
        isActive: user.is_active,
        updatedAt: user.updated_at
      }
    });
    
  } catch (error) {
    throw error;
  }
};

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Eliminar usuario (solo admin)
 * @access  Private (Admin)
 */
export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw ErrorFactory.unauthorized('Usuario no autenticado');
  }
  
  if (req.user.userType !== 'admin') {
    throw ErrorFactory.forbidden('Acceso restringido a administradores');
  }
  
  const { id } = req.params;
  
  // No permitir eliminar al propio usuario administrador
  if (req.user.id.toString() === id) {
    throw ErrorFactory.validationError('No puedes eliminar tu propia cuenta');
  }
  
  const db = getDatabase();
  
  try {
    // Verificar si el usuario existe
    const [users] = await db.execute(
      'SELECT id, user_type FROM users WHERE id = ?',
      [id]
    );
    
    if (!Array.isArray(users) || users.length === 0) {
      throw ErrorFactory.validationError('Usuario no encontrado');
    }
    
    // No permitir eliminar otros administradores
    const user = users[0] as UserRow;
    if (user.user_type === 'admin') {
      throw ErrorFactory.validationError('No se pueden eliminar cuentas de administrador');
    }
    
    // Opción 1: Eliminar físicamente el usuario (con precaución)
    // await db.execute('DELETE FROM users WHERE id = ?', [id]);
    
    // Opción 2 (recomendada): Marcar como inactivo y anonimizar datos
    await db.execute(
      `UPDATE users 
       SET 
        is_active = FALSE, 
        email = CONCAT('deleted_', id, '@example.com'),
        first_name = 'Usuario',
        last_name = 'Eliminado',
        phone = NULL,
        date_of_birth = NULL,
        address = NULL,
        city = NULL,
        state = NULL,
        zip_code = NULL,
        updated_at = NOW()
       WHERE id = ?`,
      [id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
    
  } catch (error) {
    throw error;
  }
};