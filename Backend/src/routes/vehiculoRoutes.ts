import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authMiddleware } from '../middleware/auth';
import db from '../config/database';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/vehicles'));
    },
    filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Obtener todos los vehículos
router.get('/', async (_req, res) => {
    try {
        const [vehiculos] = await db.execute(`
            SELECT v.*, c.nombre as cliente_nombre 
            FROM vehiculos v 
            LEFT JOIN clientes c ON v.cliente_id = c.id
        `);
        return res.json(vehiculos);
    } catch (error) {
        console.error('Error al obtener vehículos:', error);
        return res.status(500).json({ message: 'Error al obtener vehículos' });
    }
});

// Obtener un vehículo por ID
router.get('/:id', async (req, res) => {
    try {
        const [vehiculos] = await db.execute(
            `SELECT v.*, c.nombre as cliente_nombre 
             FROM vehiculos v 
             LEFT JOIN clientes c ON v.cliente_id = c.id 
             WHERE v.id = ?`,
            [req.params.id]
        );

        if (!vehiculos || (Array.isArray(vehiculos) && vehiculos.length === 0)) {
            return res.status(404).json({ message: 'Vehículo no encontrado' });
        }

        return res.json(Array.isArray(vehiculos) ? vehiculos[0] : vehiculos);
    } catch (error) {
        console.error('Error al obtener vehículo:', error);
        return res.status(500).json({ message: 'Error al obtener vehículo' });
    }
});

// Crear un nuevo vehículo
router.post('/', upload.single('imagen'), async (req, res) => {
    try {
        const { patente, marca, modelo, cliente_rut, estado, observaciones } = req.body;
        const imagen = req.file ? `/uploads/vehicles/${req.file.filename}` : null;

        // Primero obtener el ID del cliente usando el RUT
        const [clientes] = await db.execute(
            'SELECT id FROM clients WHERE rut = ?',
            [cliente_rut]
        );

        if (!clientes || (Array.isArray(clientes) && clientes.length === 0)) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        const cliente_id = (clientes as any[])[0].id;

        const [result] = await db.execute(
            `INSERT INTO vehiculos (patente, marca, modelo, cliente_id, estado, observaciones, imagen, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [patente, marca, modelo, cliente_id, estado, observaciones, imagen]
        );

        return res.status(201).json({
            id: (result as any).insertId,
            patente,
            marca,
            modelo,
            cliente_id,
            estado,
            observaciones,
            imagen
        });
    } catch (error) {
        console.error('Error al crear vehículo:', error);
        return res.status(500).json({ message: 'Error al crear vehículo' });
    }
});

// Actualizar un vehículo
router.put('/:id', upload.single('imagen'), async (req, res) => {
    try {
        const { patente, marca, modelo, cliente_id, estado, observaciones } = req.body;
        const imagen = req.file ? `/uploads/vehicles/${req.file.filename}` : req.body.imagen;

        const [result] = await db.execute(
            `UPDATE vehiculos 
             SET patente = ?, marca = ?, modelo = ?, cliente_id = ?, estado = ?, observaciones = ?, imagen = ?, updated_at = NOW()
             WHERE id = ?`,
            [patente, marca, modelo, cliente_id, estado, observaciones, imagen, req.params.id]
        );

        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ message: 'Vehículo no encontrado' });
        }

        return res.json({
            id: parseInt(req.params.id),
            patente,
            marca,
            modelo,
            cliente_id,
            estado,
            observaciones,
            imagen
        });
    } catch (error) {
        console.error('Error al actualizar vehículo:', error);
        return res.status(500).json({ message: 'Error al actualizar vehículo' });
    }
});

// Eliminar un vehículo
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.execute(
            'DELETE FROM vehiculos WHERE id = ?',
            [req.params.id]
        );

        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ message: 'Vehículo no encontrado' });
        }

        return res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar vehículo:', error);
        return res.status(500).json({ message: 'Error al eliminar vehículo' });
    }
});

export default router; 