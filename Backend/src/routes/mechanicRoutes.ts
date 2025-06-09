import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import db from '../config/database';
import bcrypt from 'bcrypt';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Obtener todos los mecánicos
router.get('/', async (_req, res) => {
    try {
        const [mechanics] = await db.execute(`
            SELECT id, nombre, rut, role 
            FROM mechanics
        `);
        return res.json(mechanics);
    } catch (error) {
        console.error('Error al obtener mecánicos:', error);
        return res.status(500).json({ message: 'Error al obtener mecánicos' });
    }
});

// Crear nuevo mecánico
router.post('/', async (req, res) => {
    try {
        const { nombre, rut, pin, role } = req.body;

        // Verificar si ya existe un mecánico con el mismo RUT
        const [existingMechanics]: any = await db.execute(
            'SELECT * FROM mechanics WHERE rut = ?',
            [rut]
        );

        if (existingMechanics.length > 0) {
            return res.status(400).json({ message: 'Ya existe un mecánico con este RUT' });
        }

        // Hash del PIN
        const hashedPin = await bcrypt.hash(pin, 10);

        // Crear nuevo mecánico
        const [result]: any = await db.execute(
            'INSERT INTO mechanics (nombre, rut, pin, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [nombre, rut, hashedPin, role || 'mecanico']
        );

        return res.status(201).json({
            message: 'Mecánico registrado exitosamente',
            mechanicId: result.insertId
        });
    } catch (error) {
        console.error('Error al crear mecánico:', error);
        return res.status(500).json({ message: 'Error al crear mecánico' });
    }
});

// Eliminar mecánico
router.delete('/:id', async (req, res) => {
    try {
        const [result]: any = await db.execute(
            'DELETE FROM mechanics WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Mecánico no encontrado' });
        }

        return res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar mecánico:', error);
        return res.status(500).json({ message: 'Error al eliminar mecánico' });
    }
});

export default router; 