import { Router } from 'express';
import { Mechanic } from '../models/Mechanic';
import jwt from 'jsonwebtoken';
import db from '../config/database';
import bcrypt from 'bcrypt';

const router = Router();

// Verify token
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        const mechanic = await Mechanic.findByRut(decoded.rut);

        if (!mechanic) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        console.log('Mechanic found:', mechanic); // Debug log

        return res.json({ 
            valid: true, 
            mechanic: {
                id: mechanic.id,
                nombre: mechanic.nombre,
                rut: mechanic.rut,
                rol: mechanic.rol || 'mecanico' // Ensure rol is never undefined
            }
        });
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { rut, pin } = req.body;
        const mechanic = await Mechanic.findByRut(rut);

        if (!mechanic) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValidPin = await Mechanic.comparePin(pin, mechanic.pin);
        if (!isValidPin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { 
                id: mechanic.id,
                rut: mechanic.rut,
                rol: mechanic.rol
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        return res.json({
            token,
            mechanic: {
                id: mechanic.id,
                nombre: mechanic.nombre,
                rut: mechanic.rut,
                rol: mechanic.rol
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Register
router.post('/register', async (req, res) => {
    try {
        const { nombre, rut, pin, rol } = req.body;

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
            'INSERT INTO mechanics (nombre, rut, pin, rol, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [nombre, rut, hashedPin, rol || 'mecanico']
        );

        return res.status(201).json({
            message: 'Mecánico registrado exitosamente',
            mechanicId: result.insertId
        });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ message: 'Error en el servidor' });
    }
});

export default router; 