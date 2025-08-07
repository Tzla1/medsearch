// backend/src/config/routes/searchRoutes.ts
import express from 'express';
import { searchDoctors } from '../../controllers/doctorController';
import { doctorValidators } from '../../controllers/doctorController';

const router = express.Router();

// Rutas de búsqueda
router.get('/doctors', doctorValidators.searchDoctors, searchDoctors);

// Búsqueda general (podría integrarse con un controlador de búsqueda)
router.get('/', (req, res) => {
    const query = req.query.q as string;
    const type = req.query.type as string || 'all';
    
    if (!query || query.length < 2) {
        return res.status(400).json({
            success: false,
            message: 'Se requiere un término de búsqueda de al menos 2 caracteres'
        });
    }
    
    // Redireccionar a la búsqueda específica según el tipo
    if (type === 'doctors' || type === 'all') {
        // Redirigir a la búsqueda de doctores
        return searchDoctors(req, res);
    } else {
        return res.status(400).json({
            success: false,
            message: 'Tipo de búsqueda no válido'
        });
    }
});

export default router;