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
    let connection;
    try {
        console.log('Received vehicle data:', req.body);
        const { patente, marca, modelo, cliente_rut, cliente_nombre, cliente_telefono, estado, observaciones } = req.body;
        const imagen = req.file ? `/uploads/vehicles/${req.file.filename}` : null;

        if (!patente || !marca || !modelo || !cliente_rut || !cliente_nombre || !cliente_telefono || !estado) {
            console.log('Missing required fields:', { patente, marca, modelo, cliente_rut, cliente_nombre, cliente_telefono, estado });
            return res.status(400).json({ 
                message: 'Faltan campos requeridos',
                received: { patente, marca, modelo, cliente_rut, cliente_nombre, cliente_telefono, estado }
            });
        }

        // Obtener una conexión del pool
        connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Primero verificar si el cliente existe
            console.log('Buscando cliente con RUT:', cliente_rut);
            const [clientes] = await connection.execute(
                'SELECT id FROM clientes WHERE rut = ?',
                [cliente_rut]
            );

            let cliente_id;

            if (!clientes || (Array.isArray(clientes) && clientes.length === 0)) {
                // Si el cliente no existe, crearlo
                console.log('Creando nuevo cliente:', { rut: cliente_rut, nombre: cliente_nombre, telefono: cliente_telefono });
                const [result] = await connection.execute(
                    'INSERT INTO clientes (rut, nombre, telefono, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
                    [cliente_rut, cliente_nombre, cliente_telefono]
                );
                cliente_id = (result as any).insertId;
                console.log('Nuevo cliente creado con ID:', cliente_id);
            } else {
                cliente_id = (clientes as any[])[0].id;
                console.log('Cliente existente encontrado con ID:', cliente_id);
            }

            // Crear el vehículo
            console.log('Creando vehículo con datos:', { patente, marca, modelo, cliente_id, estado, observaciones });
            const [result] = await connection.execute(
                `INSERT INTO vehiculos (patente, marca, modelo, cliente_id, estado, observaciones, imagen, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [patente, marca, modelo, cliente_id, estado, observaciones, imagen]
            );

            // Confirmar transacción
            await connection.commit();
            console.log('Transacción completada exitosamente');

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
            // Si hay error, revertir transacción
            console.error('Error en la transacción:', error);
            if (connection) {
                await connection.rollback();
            }
            throw error;
        }
    } catch (error) {
        console.error('Error detallado al crear vehículo:', error);
        return res.status(500).json({ 
            message: 'Error al crear vehículo',
            error: error instanceof Error ? error.message : 'Error desconocido',
            details: error instanceof Error ? error.stack : undefined
        });
    } finally {
        // Liberar la conexión
        if (connection) {
            connection.release();
        }
    }
});

// Actualizar un vehículo
router.put('/:id', upload.single('imagen'), async (req, res) => {
    try {
        const { estado, observaciones } = req.body;
        const imagen = req.file ? `/uploads/vehicles/${req.file.filename}` : undefined;

        // Construir la consulta SQL dinámicamente
        let updateFields = ['estado = ?', 'observaciones = ?', 'updated_at = NOW()'];
        let params = [estado, observaciones];

        if (imagen) {
            updateFields.push('imagen = ?');
            params.push(imagen);
        }

        const [result] = await db.execute(
            `UPDATE vehiculos 
             SET ${updateFields.join(', ')}
             WHERE id = ?`,
            [...params, req.params.id]
        );

        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ message: 'Vehículo no encontrado' });
        }

        // Obtener el vehículo actualizado
        const [vehiculos] = await db.execute(
            `SELECT v.*, c.nombre as cliente_nombre 
             FROM vehiculos v 
             LEFT JOIN clientes c ON v.cliente_id = c.id 
             WHERE v.id = ?`,
            [req.params.id]
        );

        return res.json(Array.isArray(vehiculos) ? vehiculos[0] : vehiculos);
    } catch (error) {
        console.error('Error al actualizar vehículo:', error);
        return res.status(500).json({ 
            message: 'Error al actualizar vehículo',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
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

// Buscar vehículo por RUT y patente
router.get('/status', async (req, res) => {
    try {
        const { rut, patente } = req.query;

        if (!rut || !patente) {
            return res.status(400).json({ message: 'Se requiere RUT y patente' });
        }

        const [vehiculos] = await db.execute(
            `SELECT v.*, c.nombre as cliente_nombre 
             FROM vehiculos v 
             INNER JOIN clientes c ON v.cliente_id = c.id 
             WHERE c.rut = ? AND v.patente = ?`,
            [rut, patente]
        );

        if (!vehiculos || (Array.isArray(vehiculos) && vehiculos.length === 0)) {
            return res.status(404).json({ message: 'Vehículo no encontrado' });
        }

        return res.json(Array.isArray(vehiculos) ? vehiculos[0] : vehiculos);
    } catch (error) {
        console.error('Error al buscar vehículo:', error);
        return res.status(500).json({ 
            message: 'Error al buscar vehículo',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

export default router; 