/**
 * Appointment Service
 * Handles appointment-related business logic
 */

import mysql from 'mysql2/promise';
import { database } from '../config/database';

export interface AppointmentData {
  userId: number;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  reason?: string;
  notes?: string;
}

export interface AppointmentFilters {
  userId?: number;
  doctorId?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface Appointment {
  id: number;
  userId: number;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  reason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  doctorName?: string;
  doctorSpecialty?: string;
  patientName?: string;
}

class AppointmentService {
  /**
   * Create a new appointment
   */
  async createAppointment(appointmentData: AppointmentData): Promise<Appointment> {
    try {
      const connection = await database.getConnection();
      
      // Check if the time slot is available
      const isAvailable = await this.isTimeSlotAvailable(
        appointmentData.doctorId,
        appointmentData.appointmentDate,
        appointmentData.appointmentTime
      );

      if (!isAvailable) {
        throw new Error('Time slot is not available');
      }

      // Create the appointment
      const appointmentDateTime = `${appointmentData.appointmentDate} ${appointmentData.appointmentTime}`;
      
      const insertQuery = `
        INSERT INTO appointments (
          user_id, doctor_id, appointment_date, status, reason, notes, created_at, updated_at
        ) VALUES (?, ?, ?, 'scheduled', ?, ?, NOW(), NOW())
      `;

      const [result] = await connection.execute(insertQuery, [
        appointmentData.userId,
        appointmentData.doctorId,
        appointmentDateTime,
        appointmentData.reason || '',
        appointmentData.notes || ''
      ]);

      const appointmentId = (result as any).insertId;

      // Get the created appointment with doctor details
      const appointment = await this.getAppointmentById(appointmentId);
      
      connection.release();
      return appointment;

    } catch (error) {
      console.error('Create appointment error:', error);
      throw error;
    }
  }

  /**
   * Get appointment by ID
   */
  async getAppointmentById(appointmentId: number): Promise<Appointment> {
    try {
      const connection = await database.getConnection();
      
      const query = `
        SELECT 
          a.id,
          a.user_id,
          a.doctor_id,
          a.appointment_date,
          a.status,
          a.reason,
          a.notes,
          a.created_at,
          a.updated_at,
          CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
          s.name as doctor_specialty,
          CONCAT(u.first_name, ' ', u.last_name) as patient_name
        FROM appointments a
        LEFT JOIN doctors d ON a.doctor_id = d.id
        LEFT JOIN specialties s ON d.specialty_id = s.id
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.id = ?
      `;

      const [rows] = await connection.execute(query, [appointmentId]);
      connection.release();

      const appointments = rows as any[];
      if (appointments.length === 0) {
        throw new Error('Appointment not found');
      }

      const appointment = appointments[0];
      const appointmentDateTime = new Date(appointment.appointment_date);

      return {
        id: appointment.id,
        userId: appointment.user_id,
        doctorId: appointment.doctor_id,
        appointmentDate: appointmentDateTime.toISOString().split('T')[0],
        appointmentTime: appointmentDateTime.toTimeString().slice(0, 5),
        status: appointment.status,
        reason: appointment.reason,
        notes: appointment.notes,
        createdAt: appointment.created_at,
        updatedAt: appointment.updated_at,
        doctorName: appointment.doctor_name,
        doctorSpecialty: appointment.doctor_specialty,
        patientName: appointment.patient_name
      };

    } catch (error) {
      console.error('Get appointment error:', error);
      throw error;
    }
  }

  /**
   * Get appointments with filters
   */
  async getAppointments(filters: AppointmentFilters, page: number = 1, limit: number = 10): Promise<{
    appointments: Appointment[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const connection = await database.getConnection();
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE 1=1';
      const queryParams: any[] = [];

      // Build WHERE clause based on filters
      if (filters.userId) {
        whereClause += ' AND a.user_id = ?';
        queryParams.push(filters.userId);
      }

      if (filters.doctorId) {
        whereClause += ' AND a.doctor_id = ?';
        queryParams.push(filters.doctorId);
      }

      if (filters.status) {
        whereClause += ' AND a.status = ?';
        queryParams.push(filters.status);
      }

      if (filters.dateFrom) {
        whereClause += ' AND DATE(a.appointment_date) >= ?';
        queryParams.push(filters.dateFrom);
      }

      if (filters.dateTo) {
        whereClause += ' AND DATE(a.appointment_date) <= ?';
        queryParams.push(filters.dateTo);
      }

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM appointments a
        ${whereClause}
      `;

      const [countResult] = await connection.execute(countQuery, queryParams);
      const total = (countResult as any[])[0].total;

      // Get appointments
      const query = `
        SELECT 
          a.id,
          a.user_id,
          a.doctor_id,
          a.appointment_date,
          a.status,
          a.reason,
          a.notes,
          a.created_at,
          a.updated_at,
          CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
          s.name as doctor_specialty,
          CONCAT(u.first_name, ' ', u.last_name) as patient_name
        FROM appointments a
        LEFT JOIN doctors d ON a.doctor_id = d.id
        LEFT JOIN specialties s ON d.specialty_id = s.id
        LEFT JOIN users u ON a.user_id = u.id
        ${whereClause}
        ORDER BY a.appointment_date ASC
        LIMIT ? OFFSET ?
      `;

      const [rows] = await connection.execute(query, [...queryParams, limit, offset]);
      connection.release();

      const appointments = (rows as any[]).map(appointment => {
        const appointmentDateTime = new Date(appointment.appointment_date);
        return {
          id: appointment.id,
          userId: appointment.user_id,
          doctorId: appointment.doctor_id,
          appointmentDate: appointmentDateTime.toISOString().split('T')[0],
          appointmentTime: appointmentDateTime.toTimeString().slice(0, 5),
          status: appointment.status,
          reason: appointment.reason,
          notes: appointment.notes,
          createdAt: appointment.created_at,
          updatedAt: appointment.updated_at,
          doctorName: appointment.doctor_name,
          doctorSpecialty: appointment.doctor_specialty,
          patientName: appointment.patient_name
        };
      });

      const totalPages = Math.ceil(total / limit);

      return {
        appointments,
        total,
        page,
        totalPages
      };

    } catch (error) {
      console.error('Get appointments error:', error);
      throw error;
    }
  }

  /**
   * Update appointment status
   */
  async updateAppointmentStatus(appointmentId: number, status: string, notes?: string): Promise<void> {
    try {
      const connection = await database.getConnection();
      
      const query = `
        UPDATE appointments 
        SET status = ?, notes = COALESCE(?, notes), updated_at = NOW()
        WHERE id = ?
      `;

      await connection.execute(query, [status, notes, appointmentId]);
      connection.release();

    } catch (error) {
      console.error('Update appointment status error:', error);
      throw error;
    }
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(appointmentId: number, reason?: string): Promise<void> {
    try {
      const connection = await database.getConnection();
      
      const query = `
        UPDATE appointments 
        SET status = 'cancelled', notes = CONCAT(COALESCE(notes, ''), ' - Cancelled: ', COALESCE(?, 'No reason provided')), updated_at = NOW()
        WHERE id = ? AND status != 'completed'
      `;

      const [result] = await connection.execute(query, [reason, appointmentId]);
      connection.release();

      if ((result as any).affectedRows === 0) {
        throw new Error('Appointment not found or cannot be cancelled');
      }

    } catch (error) {
      console.error('Cancel appointment error:', error);
      throw error;
    }
  }

  /**
   * Get doctor availability for a specific date
   */
  async getDoctorAvailability(doctorId: number, date: string): Promise<string[]> {
    try {
      const connection = await database.getConnection();
      
      // Get existing appointments for the date
      const query = `
        SELECT TIME(appointment_date) as appointment_time
        FROM appointments
        WHERE doctor_id = ? AND DATE(appointment_date) = ? AND status != 'cancelled'
      `;

      const [rows] = await connection.execute(query, [doctorId, date]);
      connection.release();

      const bookedTimes = (rows as any[]).map(row => row.appointment_time);

      // Generate available time slots (9 AM to 5 PM, 30-minute intervals)
      const allSlots = [];
      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
          allSlots.push(timeSlot);
        }
      }

      // Filter out booked slots
      const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

      // Convert to user-friendly format
      return availableSlots.map(slot => {
        const [hour, minute] = slot.split(':');
        const hourNum = parseInt(hour);
        const period = hourNum >= 12 ? 'PM' : 'AM';
        const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
        return `${displayHour}:${minute} ${period}`;
      });

    } catch (error) {
      console.error('Get doctor availability error:', error);
      throw error;
    }
  }

  /**
   * Check if a time slot is available
   */
  async isTimeSlotAvailable(doctorId: number, date: string, time: string): Promise<boolean> {
    try {
      const connection = await database.getConnection();
      
      const appointmentDateTime = `${date} ${time}`;
      
      const query = `
        SELECT COUNT(*) as count
        FROM appointments
        WHERE doctor_id = ? AND appointment_date = ? AND status != 'cancelled'
      `;

      const [rows] = await connection.execute(query, [doctorId, appointmentDateTime]);
      connection.release();

      const count = (rows as any[])[0].count;
      return count === 0;

    } catch (error) {
      console.error('Check time slot availability error:', error);
      return false;
    }
  }

  /**
   * Get upcoming appointments for a user
   */
  async getUpcomingAppointments(userId: number, limit: number = 5): Promise<Appointment[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const result = await this.getAppointments({
        userId,
        dateFrom: today,
        status: 'scheduled'
      }, 1, limit);

      return result.appointments;

    } catch (error) {
      console.error('Get upcoming appointments error:', error);
      throw error;
    }
  }
}

export const appointmentService = new AppointmentService();