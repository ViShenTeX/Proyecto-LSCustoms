import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { registerMechanic, deleteMechanic } from '../controllers/mechanicController';
import db from '../config/database';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Obtener todos los mecánicos
router.get('/', async (_req, res) => {
    try {
        const [mechanics] = await db.execute(`
            SELECT id, name, rut, role, active 
            FROM mechanics 
            ORDER BY name ASC
        `);
        console.log('Mecánicos encontrados:', mechanics); // Log para depuración
        return res.json(mechanics);
    } catch (error) {
        console.error('Error al obtener mecánicos:', error);
        return res.status(500).json({ message: 'Error al obtener mecánicos' });
    }
});

// Crear nuevo mecánico
router.post('/', registerMechanic);

// Eliminar mecánico
router.delete('/:id', deleteMechanic);

export default router; 