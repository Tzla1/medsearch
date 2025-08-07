// backend/src/config/routes/specialtyRoutes.ts
import express from 'express';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

/**
 * @route GET /api/v1/specialties
 * @description Obtener todas las especialidades médicas
 * @access Public
 */
router.get('/', async (req, res) => {
    try {
        // En una implementación real, esto vendría de una base de datos
        const specialties = [
            { id: 1, name: 'Ginecólogo', description: 'Especialista en salud femenina', category: 'Medicina General' },
            { id: 2, name: 'Psicólogo', description: 'Especialista en salud mental', category: 'Salud Mental' },
            { id: 3, name: 'Dermatólogo', description: 'Especialista en piel', category: 'Medicina Especializada' },
            { id: 4, name: 'Oftalmólogo', description: 'Especialista en ojos', category: 'Medicina Especializada' },
            { id: 5, name: 'Urólogo', description: 'Especialista en sistema urinario', category: 'Medicina Especializada' },
            { id: 6, name: 'Ortopedista', description: 'Especialista en huesos y articulaciones', category: 'Medicina Especializada' },
            { id: 7, name: 'Otorrinolaringólogo', description: 'Especialista en oído, nariz y garganta', category: 'Medicina Especializada' },
            { id: 8, name: 'Pediatra', description: 'Especialista en niños', category: 'Medicina General' },
            { id: 9, name: 'Psiquiatra', description: 'Especialista en trastornos mentales', category: 'Salud Mental' },
            { id: 10, name: 'Cirujano general', description: 'Especialista en cirugía', category: 'Cirugía' },
            { id: 11, name: 'Internista', description: 'Especialista en medicina interna', category: 'Medicina General' },
            { id: 12, name: 'Traumatólogo', description: 'Especialista en traumatismos', category: 'Medicina Especializada' }
        ];

        res.json({
            success: true,
            data: specialties,
            message: 'Especialidades obtenidas exitosamente'
        });
    } catch (error) {
        console.error('Error al obtener especialidades:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});

/**
 * @route GET /api/v1/specialties/popular
 * @description Obtener especialidades populares
 * @access Public
 */
router.get('/popular', async (req, res) => {
    try {
        // En una implementación real, esto vendría de una base de datos con conteo de citas
        const popularSpecialties = [
            { id: 1, name: 'Ginecólogo', count: 1250, icon: '👩‍⚕️' },
            { id: 2, name: 'Psicólogo', count: 980, icon: '🧠' },
            { id: 3, name: 'Dermatólogo', count: 890, icon: '🧴' },
            { id: 8, name: 'Pediatra', count: 845, icon: '👶' },
            { id: 4, name: 'Oftalmólogo', count: 780, icon: '👁️' },
            { id: 9, name: 'Psiquiatra', count: 720, icon: '🧠' }
        ];

        res.json({
            success: true,
            data: popularSpecialties,
            message: 'Especialidades populares obtenidas exitosamente'
        });
    } catch (error) {
        console.error('Error al obtener especialidades populares:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});

/**
 * @route GET /api/v1/specialties/:id
 * @description Obtener una especialidad por ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
    try {
        const specialtyId = parseInt(req.params.id);
        
        // En una implementación real, esto vendría de una base de datos
        const specialties = [
            { id: 1, name: 'Ginecólogo', description: 'Especialista en salud femenina', category: 'Medicina General' },
            { id: 2, name: 'Psicólogo', description: 'Especialista en salud mental', category: 'Salud Mental' },
            { id: 3, name: 'Dermatólogo', description: 'Especialista en piel', category: 'Medicina Especializada' }
        ];
        
        const specialty = specialties.find(s => s.id === specialtyId);
        
        if (!specialty) {
            return res.status(404).json({
                success: false,
                message: 'Especialidad no encontrada'
            });
        }
        
        res.json({
            success: true,
            data: specialty,
            message: 'Especialidad obtenida exitosamente'
        });
    } catch (error) {
        console.error('Error al obtener especialidad:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});

export default router;