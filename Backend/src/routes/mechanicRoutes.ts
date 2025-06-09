import { Router } from 'express';
import { registerMechanic, getMechanicProfile } from '../controllers/mechanicController';
import { authMiddleware } from '../middleware/auth';
import { AppDataSource } from '../config/data-source';
import { Mechanic } from '../models/Mechanic';

const router = Router();
const mechanicRepository = AppDataSource.getRepository(Mechanic);

// Rutas protegidas
router.post('/register', authMiddleware, registerMechanic);
router.get('/profile', authMiddleware, getMechanicProfile);

// Obtener todos los mecánicos
router.get('/', authMiddleware, async (_req, res) => {
    try {
        const mechanics = await mechanicRepository.find({
            select: ['id', 'nombre', 'apellido', 'rut', 'especialidad', 'activo', 'createdAt']
        });
        res.json(mechanics);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener mecánicos' });
    }
});

// Obtener un mecánico por ID
router.get('/:id', authMiddleware, async (req: any, res: any) => {
    try {
        const mechanic = await mechanicRepository.findOne({
            where: { id: parseInt(req.params.id) },
            select: ['id', 'nombre', 'apellido', 'rut', 'especialidad', 'activo', 'createdAt']
        });
        if (!mechanic) return res.status(404).json({ message: 'Mecánico no encontrado' });
        res.json(mechanic);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener mecánico' });
    }
});

// Actualizar un mecánico
router.put('/:id', authMiddleware, async (req: any, res: any) => {
    try {
        const mechanic = await mechanicRepository.findOneBy({ id: parseInt(req.params.id) });
        if (!mechanic) return res.status(404).json({ message: 'Mecánico no encontrado' });
        
        const { password, ...updateData } = req.body;
        mechanicRepository.merge(mechanic, updateData);
        
        const result = await mechanicRepository.save(mechanic);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar mecánico' });
    }
});

// Cambiar estado de un mecánico
router.patch('/:id/toggle-status', authMiddleware, async (req: any, res: any) => {
    try {
        const mechanic = await mechanicRepository.findOneBy({ id: parseInt(req.params.id) });
        if (!mechanic) return res.status(404).json({ message: 'Mecánico no encontrado' });
        
        mechanic.activo = !mechanic.activo;
        const result = await mechanicRepository.save(mechanic);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al cambiar estado del mecánico' });
    }
});

export default router; 