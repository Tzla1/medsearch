// backend/src/config/routes/appointmentRoutes.ts
import express from 'express';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

/**
 * @route POST /api/v1/appointments
 * @description Crear una nueva cita médica
 * @access Private (requiere autenticación)
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { doctor_id, appointment_date, appointment_time, reason_for_visit } = req.body;
        
        // Validar datos requeridos
        if (!doctor_id || !appointment_date || !appointment_time) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos para la cita'
            });
        }
        
        // En una implementación real, esto guardaría la cita en la base de datos
        // y verificaría disponibilidad, conflictos, etc.
        
        // Simular respuesta exitosa
        const appointment = {
            id: Math.floor(Math.random() * 10000),
            doctor_id,
            patient_id: (req as any).user?.id || 1, // En un sistema real vendría del token JWT
            appointment_date,
            appointment_time,
            reason_for_visit,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        res.status(201).json({
            success: true,
            data: appointment,
            message: 'Cita creada exitosamente'
        });
    } catch (error) {
        console.error('Error al crear cita:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});

/**
 * @route GET /api/v1/appointments
 * @description Obtener citas del usuario actual
 * @access Private (requiere autenticación)
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        // En una implementación real, esto consultaría la base de datos
        // filtrando por el ID del usuario autenticado
        
        // Simular citas para demostración
        const appointments = [
            {
                id: 1001,
                doctor_id: 3,
                doctor_name: "Dr. Carlos Mendoza",
                specialty: "Dermatología",
                appointment_date: "2025-07-10",
                appointment_time: "10:00",
                status: "confirmed",
                created_at: "2025-07-01T14:30:00Z"
            },
            {
                id: 1002,
                doctor_id: 1,
                doctor_name: "Dra. María Elena González",
                specialty: "Ginecología",
                appointment_date: "2025-07-15",
                appointment_time: "16:30",
                status: "pending",
                created_at: "2025-07-02T09:15:00Z"
            }
        ];
        
        res.json({
            success: true,
            data: appointments,
            message: 'Citas obtenidas exitosamente'
        });
    } catch (error) {
        console.error('Error al obtener citas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});

/**
 * @route GET /api/v1/appointments/:id
 * @description Obtener detalle de una cita específica
 * @access Private (requiere autenticación)
 */
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const appointmentId = parseInt(req.params.id);
        
        // En una implementación real, se consultaría la base de datos
        // y se verificaría que la cita pertenezca al usuario autenticado
        
        // Simular cita para demostración
        const appointment = {
            id: appointmentId,
            doctor_id: 3,
            doctor_name: "Dr. Carlos Mendoza",
            specialty: "Dermatología",
            appointment_date: "2025-07-10",
            appointment_time: "10:00",
            status: "confirmed",
            reason_for_visit: "Revisión de acné",
            notes: "Traer estudios previos",
            location: "Consultorio 304, Torre Médica, Zona Minerva",
            created_at: "2025-07-01T14:30:00Z",
            updated_at: "2025-07-01T14:30:00Z"
        };
        
        res.json({
            success: true,
            data: appointment,
            message: 'Detalle de cita obtenido exitosamente'
        });
    } catch (error) {
        console.error('Error al obtener detalle de cita:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});

/**
 * @route PUT /api/v1/appointments/:id/cancel
 * @description Cancelar una cita
 * @access Private (requiere autenticación)
 */
router.put('/:id/cancel', authMiddleware, async (req, res) => {
    try {
        const appointmentId = parseInt(req.params.id);
        const { cancellation_reason } = req.body;
        
        // En una implementación real, se consultaría la base de datos,
        // se verificaría que la cita pertenezca al usuario y esté en estado cancelable
        
        res.json({
            success: true,
            data: {
                id: appointmentId,
                status: "cancelled",
                cancellation_reason: cancellation_reason || "Cancelada por el usuario",
                cancelled_at: new Date().toISOString()
            },
            message: 'Cita cancelada exitosamente'
        });
    } catch (error) {
        console.error('Error al cancelar cita:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});

export default router;