import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import db from '../config/database';
import bcrypt from 'bcrypt';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Obtener todos los mecánicos
router.get('/', async (_req, res) => {
    try {
        const [mecanicos] = await db.execute(`
            SELECT id, rut, nombre, email, rol, created_at, updated_at 
            FROM mecanicos
            ORDER BY nombre ASC
        `);
        return res.json(mecanicos);
    } catch (error) {
        console.error('Error al obtener mecánicos:', error);
        return res.status(500).json({ message: 'Error al obtener mecánicos' });
    }
});

// Crear un nuevo mecánico (solo admin)
router.post('/', async (req, res) => {
    try {
        // Verificar si el usuario es admin
        if (req.mechanic?.rol !== 'admin') {
            return res.status(403).json({ message: 'No tienes permisos para crear mecánicos' });
        }

        const { rut, nombre, email, password, rol } = req.body;

        // Verificar si ya existe un mecánico con ese RUT
        const [existing] = await db.execute(
            'SELECT id FROM mecanicos WHERE rut = ?',
            [rut]
        );

        if (Array.isArray(existing) && existing.length > 0) {
            return res.status(400).json({ message: 'Ya existe un mecánico con ese RUT' });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar nuevo mecánico
        const [result] = await db.execute(
            `INSERT INTO mecanicos (rut, nombre, email, password, rol, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            [rut, nombre, email, hashedPassword, rol || 'mecanico']
        );

        return res.status(201).json({
            id: (result as any).insertId,
            rut,
            nombre,
            email,
            rol: rol || 'mecanico'
        });
    } catch (error) {
        console.error('Error al crear mecánico:', error);
        return res.status(500).json({ message: 'Error al crear mecánico' });
    }
});

// Eliminar un mecánico (solo admin)
router.delete('/:id', async (req, res) => {
    try {
        // Verificar si el usuario es admin
        if (req.mechanic?.rol !== 'admin') {
            return res.status(403).json({ message: 'No tienes permisos para eliminar mecánicos' });
        }

        // No permitir eliminar el propio usuario
        if (req.mechanic.id === parseInt(req.params.id)) {
            return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta' });
        }

        const [result] = await db.execute(
            'DELETE FROM mecanicos WHERE id = ?',
            [req.params.id]
        );

        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ message: 'Mecánico no encontrado' });
        }

        return res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar mecánico:', error);
        return res.status(500).json({ message: 'Error al eliminar mecánico' });
    }
});

export default router; 