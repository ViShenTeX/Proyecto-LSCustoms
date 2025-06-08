import express from 'express';
import { pool } from '../db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/vehicles');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  }
});

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Login endpoint
router.post('/login', async (req: any, res: any) => {
  const { rut, pin } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM mechanics WHERE rut = $1',
      [rut]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const mechanic = result.rows[0];
    const validPin = await bcrypt.compare(pin, mechanic.pin);

    if (!validPin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: mechanic.id, rut: mechanic.rut },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '8h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all vehicles
router.get('/vehicles', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*, c.nombre as cliente_nombre, c.rut as cliente_rut
      FROM vehicles v
      JOIN clients c ON v.client_id = c.id
      ORDER BY v.fecha_ingreso DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new vehicle
router.post('/vehicles', authenticateToken, async (req, res) => {
  const { cliente, vehiculo } = req.body;

  try {
    // Start transaction
    await pool.query('BEGIN');

    // Insert or update client
    const clientResult = await pool.query(
      `INSERT INTO clients (rut, nombre, telefono)
       VALUES ($1, $2, $3)
       ON CONFLICT (rut) DO UPDATE
       SET nombre = $2, telefono = $3
       RETURNING id`,
      [cliente.rut, cliente.nombre, cliente.telefono]
    );

    const clientId = clientResult.rows[0].id;

    // Insert vehicle
    const vehicleResult = await pool.query(
      `INSERT INTO vehicles (
        client_id, patente, marca, modelo, estado, observaciones, fecha_ingreso
      )
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING id`,
      [
        clientId,
        vehiculo.patente,
        vehiculo.marca,
        vehiculo.modelo,
        vehiculo.estado,
        vehiculo.observaciones
      ]
    );

    await pool.query('COMMIT');

    res.status(201).json({ id: vehicleResult.rows[0].id });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error adding vehicle:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update vehicle
router.put('/vehicles/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { cliente, vehiculo } = req.body;

  try {
    await pool.query('BEGIN');

    // Update client
    await pool.query(
      `UPDATE clients
       SET nombre = $1, telefono = $2
       WHERE id = (SELECT client_id FROM vehicles WHERE id = $3)`,
      [cliente.nombre, cliente.telefono, id]
    );

    // Update vehicle
    await pool.query(
      `UPDATE vehicles
       SET patente = $1, marca = $2, modelo = $3, estado = $4, observaciones = $5
       WHERE id = $6`,
      [
        vehiculo.patente,
        vehiculo.marca,
        vehiculo.modelo,
        vehiculo.estado,
        vehiculo.observaciones,
        id
      ]
    );

    await pool.query('COMMIT');
    res.json({ message: 'Vehicle updated successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error updating vehicle:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete vehicle
router.delete('/vehicles/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM vehicles WHERE id = $1', [id]);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload vehicle images
router.post('/vehicles/:id/images', authenticateToken, upload.array('images', 5), async (req, res) => {
  const { id } = req.params;
  const files = req.files as Express.Multer.File[];

  try {
    await pool.query('BEGIN');

    for (const file of files) {
      await pool.query(
        `INSERT INTO vehicle_images (vehicle_id, image_path)
         VALUES ($1, $2)`,
        [id, file.path]
      );
    }

    await pool.query('COMMIT');
    res.json({ message: 'Images uploaded successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error uploading images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get vehicle status
router.post('/vehicles/status', async (req: any, res: any) => {
  const { rut, patente } = req.body;

  try {
    const result = await pool.query(
      `SELECT v.*, c.nombre as cliente_nombre
       FROM vehicles v
       JOIN clients c ON v.client_id = c.id
       WHERE c.rut = $1 AND v.patente = $2`,
      [rut, patente]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Get vehicle images
    const imagesResult = await pool.query(
      'SELECT image_path FROM vehicle_images WHERE vehicle_id = $1',
      [result.rows[0].id]
    );

    const vehicleData = {
      ...result.rows[0],
      images: imagesResult.rows.map(row => row.image_path)
    };

    res.json(vehicleData);
  } catch (error) {
    console.error('Error fetching vehicle status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 