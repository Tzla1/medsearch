/**
 * ===============================================================
 * CONTROLADOR DE DOCTORES - MEDICONSULTA
 * ===============================================================
 *
 * Controlador completo para gestión de médicos especialistas
 * Implementa patrón Repository y validaciones robustas
 *
 * @author MediConsulta Team
 * @version 1.0.0
 */

import { Request, Response } from 'express';
import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { getDatabase } from '../config/database';
import { query, param, validationResult } from 'express-validator';
import Joi from 'joi';

// ===============================================================
// INTERFACES Y TIPOS
// ===============================================================

interface Doctor extends RowDataPacket {
    id: number;
    user_id: number;
    license_number: string;
    specialty_id: number;
    specialty_name?: string;
    years_of_experience: number;
    education: string;
    hospital_affiliations?: string;
    consultation_fee: number;
    currency: string;
    available_hours?: any;
    accepts_insurance: boolean;
    insurance_types?: any;
    office_address: string;
    office_city: string;
    office_state: string;
    office_zip_code: string;
    latitude?: number;
    longitude?: number;
    office_phone: string;
    emergency_phone?: string;
    rating: number;
    total_reviews: number;
    is_verified: boolean;
    is_accepting_patients: boolean;
    verification_date?: Date;
    last_active: Date;
    created_at: Date;
    updated_at: Date;
    // Campos calculados
    name?: string;
    email?: string;
    profile_image?: string;
    distance?: number;
}

interface DoctorSearchFilters {
    specialty_id?: number;
    city?: string;
    state?: string;
    min_rating?: number;
    max_fee?: number;
    accepts_insurance?: boolean;
    is_accepting_patients?: boolean;
    latitude?: number;
    longitude?: number;
    radius?: number; // en kilómetros
    search_term?: string;
}

interface AvailabilitySlot {
    date: string;
    time: string;
    available: boolean;
    duration: number;
}

// ===============================================================
// VALIDADORES DE ENTRADA
// ===============================================================

export const doctorValidators = {
    // Validadores para búsqueda de doctores
    searchDoctors: [
        query('specialty_id').optional().isInt({ min: 1 }).withMessage('ID de especialidad inválido'),
        query('city').optional().isLength({ min: 2, max: 100 }).withMessage('Ciudad inválida'),
        query('state').optional().isLength({ min: 2, max: 100 }).withMessage('Estado inválido'),
        query('min_rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating mínimo inválido'),
        query('max_fee').optional().isFloat({ min: 0 }).withMessage('Tarifa máxima inválida'),
        query('accepts_insurance').optional().isBoolean().withMessage('Valor de seguro inválido'),
        query('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
        query('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
        query('radius').optional().isFloat({ min: 0.1, max: 100 }).withMessage('Radio inválido'),
        query('search_term').optional().isLength({ min: 2, max: 255 }).withMessage('Término de búsqueda inválido'),
        query('page').optional().isInt({ min: 1 }).withMessage('Página inválida'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite inválido')
    ],

    // Validadores para obtener doctor por ID
    getDoctorById: [
        param('id').isInt({ min: 1 }).withMessage('ID de doctor inválido')
    ],

    // Validadores para disponibilidad
    getAvailability: [
        param('id').isInt({ min: 1 }).withMessage('ID de doctor inválido'),
        query('date').isISO8601().withMessage('Fecha inválida'),
        query('days').optional().isInt({ min: 1, max: 30 }).withMessage('Número de días inválido')
    ],

    // Validadores para doctores por especialidad
    getDoctorsBySpecialty: [
        param('specialtyId').isInt({ min: 1 }).withMessage('ID de especialidad inválido'),
        query('page').optional().isInt({ min: 1 }).withMessage('Página inválida'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite inválido')
    ]
};

// ===============================================================
// CLASE CONTROLADOR PRINCIPAL
// ===============================================================

export class DoctorController {
    private db: Pool;

    constructor() {
        this.db = getDatabase();
    }

    /**
     * Busca doctores con filtros avanzados y paginación
     * GET /api/doctors/search
     */
    public searchDoctors = async (req: Request, res: Response): Promise<void> => {
        try {
            // Validar entrada
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Parámetros de búsqueda inválidos',
                    errors: errors.array()
                });
                return;
            }

            const filters: DoctorSearchFilters = {
                specialty_id: req.query.specialty_id ? parseInt(req.query.specialty_id as string) : undefined,
                city: req.query.city as string,
                state: req.query.state as string,
                min_rating: req.query.min_rating ? parseFloat(req.query.min_rating as string) : undefined,
                max_fee: req.query.max_fee ? parseFloat(req.query.max_fee as string) : undefined,
                accepts_insurance: req.query.accepts_insurance === 'true',
                is_accepting_patients: req.query.is_accepting_patients !== 'false', // Por defecto true
                latitude: req.query.latitude ? parseFloat(req.query.latitude as string) : undefined,
                longitude: req.query.longitude ? parseFloat(req.query.longitude as string) : undefined,
                radius: req.query.radius ? parseFloat(req.query.radius as string) : 25, // 25km por defecto
                search_term: req.query.search_term as string
            };

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = (page - 1) * limit;

            // Construir consulta dinámica
            const { query: searchQuery, params } = this.buildSearchQuery(filters, limit, offset);

            // Ejecutar búsqueda
            const [doctors] = await this.db.execute<Doctor[]>(searchQuery, params);

            // Obtener total de resultados para paginación
            const { query: countQuery, params: countParams } = this.buildSearchQuery(filters, 0, 0, true);
            const [countResult] = await this.db.execute<RowDataPacket[]>(countQuery, countParams);
            const totalResults = countResult[0]?.total || 0;

            // Calcular distancia si se proporcionaron coordenadas
            if (filters.latitude && filters.longitude) {
                doctors.forEach(doctor => {
                    if (doctor.latitude && doctor.longitude) {
                        doctor.distance = this.calculateDistance(
                            filters.latitude!,
                            filters.longitude!,
                            doctor.latitude,
                            doctor.longitude
                        );
                    }
                });

                // Ordenar por distancia si se calculó
                doctors.sort((a, b) => (a.distance || 999) - (b.distance || 999));
            }

            res.json({
                success: true,
                data: {
                    doctors,
                    pagination: {
                        page,
                        limit,
                        total: totalResults,
                        totalPages: Math.ceil(totalResults / limit),
                        hasNext: page * limit < totalResults,
                        hasPrev: page > 1
                    },
                    filters: filters
                },
                message: `Se encontraron ${doctors.length} doctores`
            });

        } catch (error) {
            console.error('Error en búsqueda de doctores:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al buscar doctores',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    };

    /**
     * Obtiene un doctor específico por ID con información completa
     * GET /api/doctors/:id
     */
    public getDoctorById = async (req: Request, res: Response): Promise<void> => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'ID de doctor inválido',
                    errors: errors.array()
                });
                return;
            }

            const doctorId = parseInt(req.params.id);

            const query = `
                SELECT 
                    d.*,
                    u.name,
                    u.email,
                    u.profile_image,
                    s.name as specialty_name,
                    s.category as specialty_category,
                    -- Estadísticas adicionales
                    (SELECT COUNT(*) FROM appointments a WHERE a.doctor_id = d.id AND a.status = 'completed') as completed_appointments,
                    (SELECT AVG(r.rating) FROM reviews r WHERE r.doctor_id = d.id) as avg_rating_detailed
                FROM doctors d
                INNER JOIN users u ON d.user_id = u.id
                INNER JOIN specialties s ON d.specialty_id = s.id
                WHERE d.id = ? AND d.is_verified = TRUE
            `;

            const [doctors] = await this.db.execute<Doctor[]>(query, [doctorId]);

            if (doctors.length === 0) {
                res.status(404).json({
                    success: false,
                    message: 'Doctor no encontrado o no verificado'
                });
                return;
            }

            const doctor = doctors[0];

            // Obtener reseñas recientes
            const reviewsQuery = `
                SELECT 
                    r.*,
                    u.name as patient_name
                FROM reviews r
                INNER JOIN users u ON r.patient_id = u.id
                WHERE r.doctor_id = ?
                ORDER BY r.created_at DESC
                LIMIT 5
            `;

            const [reviews] = await this.db.execute<RowDataPacket[]>(reviewsQuery, [doctorId]);

            res.json({
                success: true,
                data: {
                    doctor,
                    recent_reviews: reviews
                },
                message: 'Doctor encontrado exitosamente'
            });

        } catch (error) {
            console.error('Error al obtener doctor:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    };

    /**
     * Obtiene doctores por especialidad con paginación
     * GET /api/doctors/specialty/:specialtyId
     */
    public getDoctorsBySpecialty = async (req: Request, res: Response): Promise<void> => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Parámetros inválidos',
                    errors: errors.array()
                });
                return;
            }

            const specialtyId = parseInt(req.params.specialtyId);
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = (page - 1) * limit;

            // Verificar que la especialidad existe
            const [specialtyCheck] = await this.db.execute<RowDataPacket[]>(
                'SELECT id, name FROM specialties WHERE id = ? AND is_active = TRUE',
                [specialtyId]
            );

            if (specialtyCheck.length === 0) {
                res.status(404).json({
                    success: false,
                    message: 'Especialidad no encontrada'
                });
                return;
            }

            const query = `
                SELECT 
                    d.*,
                    u.name,
                    u.email,
                    u.profile_image,
                    s.name as specialty_name
                FROM doctors d
                INNER JOIN users u ON d.user_id = u.id
                INNER JOIN specialties s ON d.specialty_id = s.id
                WHERE d.specialty_id = ? 
                    AND d.is_verified = TRUE 
                    AND d.is_accepting_patients = TRUE
                ORDER BY d.rating DESC, d.total_reviews DESC
                LIMIT ? OFFSET ?
            `;

            const [doctors] = await this.db.execute<Doctor[]>(query, [specialtyId, limit, offset]);

            // Contar total para paginación
            const [countResult] = await this.db.execute<RowDataPacket[]>(
                `SELECT COUNT(*) as total 
                 FROM doctors d 
                 WHERE d.specialty_id = ? AND d.is_verified = TRUE AND d.is_accepting_patients = TRUE`,
                [specialtyId]
            );

            const totalResults = countResult[0]?.total || 0;

            res.json({
                success: true,
                data: {
                    specialty: specialtyCheck[0],
                    doctors,
                    pagination: {
                        page,
                        limit,
                        total: totalResults,
                        totalPages: Math.ceil(totalResults / limit),
                        hasNext: page * limit < totalResults,
                        hasPrev: page > 1
                    }
                },
                message: `Se encontraron ${doctors.length} doctores en ${specialtyCheck[0].name}`
            });

        } catch (error) {
            console.error('Error al obtener doctores por especialidad:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    };

    /**
     * Obtiene la disponibilidad de un doctor para fechas específicas
     * GET /api/doctors/:id/availability
     */
    public getAvailability = async (req: Request, res: Response): Promise<void> => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Parámetros inválidos',
                    errors: errors.array()
                });
                return;
            }

            const doctorId = parseInt(req.params.id);
            const startDate = req.query.date as string;
            const days = parseInt(req.query.days as string) || 7;

            // Verificar que el doctor existe
            const [doctorCheck] = await this.db.execute<RowDataPacket[]>(
                'SELECT id, available_hours FROM doctors WHERE id = ? AND is_verified = TRUE',
                [doctorId]
            );

            if (doctorCheck.length === 0) {
                res.status(404).json({
                    success: false,
                    message: 'Doctor no encontrado'
                });
                return;
            }

            const doctor = doctorCheck[0];
            const availableHours = doctor.available_hours || this.getDefaultAvailableHours();

            // Obtener citas existentes para el período
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + days);

            const appointmentsQuery = `
                SELECT appointment_date, appointment_time, estimated_duration
                FROM appointments
                WHERE doctor_id = ? 
                    AND appointment_date BETWEEN ? AND ?
                    AND status IN ('pending', 'confirmed')
                ORDER BY appointment_date, appointment_time
            `;

            const [existingAppointments] = await this.db.execute<RowDataPacket[]>(
                appointmentsQuery,
                [doctorId, startDate, endDate.toISOString().split('T')[0]]
            );

            // Generar slots de disponibilidad
            const availability = this.generateAvailabilitySlots(
                startDate,
                days,
                availableHours,
                existingAppointments
            );

            res.json({
                success: true,
                data: {
                    doctor_id: doctorId,
                    start_date: startDate,
                    days: days,
                    availability: availability,
                    available_hours: availableHours
                },
                message: 'Disponibilidad obtenida exitosamente'
            });

        } catch (error) {
            console.error('Error al obtener disponibilidad:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    };

    /**
     * Obtiene estadísticas de doctores para dashboard
     * GET /api/doctors/stats
     */
    public getDoctorStats = async (req: Request, res: Response): Promise<void> => {
        try {
            const statsQuery = `
                SELECT 
                    COUNT(*) as total_doctors,
                    COUNT(CASE WHEN is_verified = TRUE THEN 1 END) as verified_doctors,
                    COUNT(CASE WHEN is_accepting_patients = TRUE THEN 1 END) as accepting_patients,
                    AVG(rating) as avg_rating,
                    AVG(consultation_fee) as avg_consultation_fee,
                    COUNT(DISTINCT specialty_id) as total_specialties,
                    COUNT(DISTINCT office_city) as cities_covered
                FROM doctors
            `;

            const [stats] = await this.db.execute<RowDataPacket[]>(statsQuery);

            // Estadísticas por especialidad
            const specialtyStatsQuery = `
                SELECT 
                    s.name as specialty_name,
                    COUNT(d.id) as doctor_count,
                    AVG(d.rating) as avg_rating,
                    AVG(d.consultation_fee) as avg_fee
                FROM specialties s
                LEFT JOIN doctors d ON s.id = d.specialty_id AND d.is_verified = TRUE
                WHERE s.is_active = TRUE
                GROUP BY s.id, s.name
                ORDER BY doctor_count DESC
                LIMIT 10
            `;

            const [specialtyStats] = await this.db.execute<RowDataPacket[]>(specialtyStatsQuery);

            res.json({
                success: true,
                data: {
                    general_stats: stats[0],
                    specialty_stats: specialtyStats
                },
                message: 'Estadísticas obtenidas exitosamente'
            });

        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    };

    // ===============================================================
    // MÉTODOS PRIVADOS DE UTILIDAD
    // ===============================================================

    /**
     * Construye consulta SQL dinámica para búsqueda de doctores
     */
    private buildSearchQuery(filters: DoctorSearchFilters, limit: number, offset: number, isCount: boolean = false): { query: string, params: any[] } {
        const params: any[] = [];
        let whereConditions: string[] = ['d.is_verified = TRUE'];

        // Selección de campos
        const selectFields = isCount 
            ? 'COUNT(*) as total'
            : `d.*, u.name, u.email, u.profile_image, s.name as specialty_name, s.category as specialty_category`;

        let query = `
            SELECT ${selectFields}
            FROM doctors d
            INNER JOIN users u ON d.user_id = u.id
            INNER JOIN specialties s ON d.specialty_id = s.id
        `;

        // Filtros dinámicos
        if (filters.specialty_id) {
            whereConditions.push('d.specialty_id = ?');
            params.push(filters.specialty_id);
        }

        if (filters.city) {
            whereConditions.push('LOWER(d.office_city) LIKE LOWER(?)');
            params.push(`%${filters.city}%`);
        }

        if (filters.state) {
            whereConditions.push('LOWER(d.office_state) LIKE LOWER(?)');
            params.push(`%${filters.state}%`);
        }

        if (filters.min_rating) {
            whereConditions.push('d.rating >= ?');
            params.push(filters.min_rating);
        }

        if (filters.max_fee) {
            whereConditions.push('d.consultation_fee <= ?');
            params.push(filters.max_fee);
        }

        if (filters.accepts_insurance) {
            whereConditions.push('d.accepts_insurance = TRUE');
        }

        if (filters.is_accepting_patients) {
            whereConditions.push('d.is_accepting_patients = TRUE');
        }

        if (filters.search_term) {
            whereConditions.push(`(
                LOWER(u.name) LIKE LOWER(?) OR 
                LOWER(s.name) LIKE LOWER(?) OR 
                LOWER(d.education) LIKE LOWER(?) OR
                LOWER(d.hospital_affiliations) LIKE LOWER(?)
            )`);
            const searchPattern = `%${filters.search_term}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }

        // Filtro geográfico
        if (filters.latitude && filters.longitude && filters.radius) {
            whereConditions.push(`(
                6371 * acos(
                    cos(radians(?)) * cos(radians(d.latitude)) * 
                    cos(radians(d.longitude) - radians(?)) + 
                    sin(radians(?)) * sin(radians(d.latitude))
                ) <= ?
            )`);
            params.push(filters.latitude, filters.longitude, filters.latitude, filters.radius);
        }

        // Agregar WHERE clause
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }

        // Ordenamiento y paginación (solo para consultas no de conteo)
        if (!isCount) {
            query += ' ORDER BY d.rating DESC, d.total_reviews DESC, d.last_active DESC';
            
            if (limit > 0) {
                query += ' LIMIT ? OFFSET ?';
                params.push(limit, offset);
            }
        }

        return { query, params };
    }

    /**
     * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
     */
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radio de la Tierra en kilómetros
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    /**
     * Obtiene horarios disponibles por defecto
     */
    private getDefaultAvailableHours(): any {
        return {
            monday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
            tuesday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
            wednesday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
            thursday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
            friday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
            saturday: { start: '09:00', end: '14:00', breaks: [] },
            sunday: null // No disponible
        };
    }

    /**
     * Genera slots de disponibilidad para un período específico
     */
    private generateAvailabilitySlots(
        startDate: string,
        days: number,
        availableHours: any,
        existingAppointments: any[]
    ): AvailabilitySlot[] {
        const slots: AvailabilitySlot[] = [];
        const start = new Date(startDate);

        for (let i = 0; i < days; i++) {
            const currentDate = new Date(start);
            currentDate.setDate(start.getDate() + i);
            
            const dayName = this.getDayName(currentDate.getDay());
            const daySchedule = availableHours[dayName];

            if (!daySchedule) continue; // Día no disponible

            const dateStr = currentDate.toISOString().split('T')[0];
            const dayAppointments = existingAppointments.filter(
                apt => apt.appointment_date === dateStr
            );

            // Generar slots de 30 minutos
            const daySlots = this.generateDaySlots(dateStr, daySchedule, dayAppointments);
            slots.push(...daySlots);
        }

        return slots;
    }

    private getDayName(dayIndex: number): string {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[dayIndex];
    }

    private generateDaySlots(date: string, schedule: any, appointments: any[]): AvailabilitySlot[] {
        const slots: AvailabilitySlot[] = [];
        const slotDuration = 30; // minutos

        // Convertir horarios a minutos
        const startMinutes = this.timeToMinutes(schedule.start);
        const endMinutes = this.timeToMinutes(schedule.end);

        for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
            const timeStr = this.minutesToTime(minutes);
            
            // Verificar si está en horario de descanso
            const isBreakTime = schedule.breaks?.some((breakPeriod: any) => {
                const breakStart = this.timeToMinutes(breakPeriod.start);
                const breakEnd = this.timeToMinutes(breakPeriod.end);
                return minutes >= breakStart && minutes < breakEnd;
            });

            if (isBreakTime) continue;

            // Verificar si ya hay una cita
            const isBooked = appointments.some(apt => apt.appointment_time === timeStr);

            slots.push({
                date,
                time: timeStr,
                available: !isBooked,
                duration: slotDuration
            });
        }

        return slots;
    }

    private timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    private minutesToTime(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
}

// ===============================================================
// INSTANCIA Y EXPORTACIÓN
// ===============================================================

const doctorController = new DoctorController();

export const {
    searchDoctors,
    getDoctorById,
    getDoctorsBySpecialty,
    getAvailability,
    getDoctorStats
} = doctorController;

export default doctorController;