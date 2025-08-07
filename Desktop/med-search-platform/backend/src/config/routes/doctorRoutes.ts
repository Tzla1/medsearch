// backend/src/config/routes/doctorRoutes.ts
import express from 'express';
import { 
    searchDoctors, 
    getDoctorById, 
    getDoctorsBySpecialty, 
    getAvailability,
    getDoctorStats
} from '../../controllers/doctorController';
import { authMiddleware } from '../middleware/auth';
import { doctorValidators } from '../../controllers/doctorController';

const router = express.Router();

// Rutas públicas
router.get('/search', doctorValidators.searchDoctors, searchDoctors);
router.get('/:id', doctorValidators.getDoctorById, getDoctorById);
router.get('/:id/availability', doctorValidators.getAvailability, getAvailability);
router.get('/specialty/:specialtyId', doctorValidators.getDoctorsBySpecialty, getDoctorsBySpecialty);
router.get('/stats', authMiddleware, getDoctorStats);

// Exportar el router
export default router;