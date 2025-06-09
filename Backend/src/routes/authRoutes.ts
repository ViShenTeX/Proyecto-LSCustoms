import { Router } from 'express';
import { AppDataSource } from '../config/data-source';
import { Mechanic } from '../models/Mechanic';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

const router = Router();
const mechanicRepository = AppDataSource.getRepository(Mechanic);

// Middleware de autenticación
export const authMiddleware = async (req: Request, res: Response, next: Function): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as any;
        const mechanic = await mechanicRepository.findOneBy({ id: decoded.id });
        
        if (!mechanic) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }

        req.user = mechanic;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
        return;
    }
};

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const mechanic = await mechanicRepository.findOneBy({ email });

        if (!mechanic) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const isValidPassword = await mechanic.validatePassword(password);
        if (!isValidPassword) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign(
            { id: mechanic.id, email: mechanic.email },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            mechanic: {
                id: mechanic.id,
                nombre: mechanic.nombre,
                apellido: mechanic.apellido,
                email: mechanic.email,
                especialidad: mechanic.especialidad
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en el login' });
        return;
    }
});

// Registro de mecánico (solo para administradores)
router.post('/register', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { nombre, apellido, email, password, especialidad } = req.body;
        
        const existingMechanic = await mechanicRepository.findOneBy({ email });
        if (existingMechanic) {
            res.status(400).json({ message: 'Email already exists' });
            return;
        }

        const mechanic = mechanicRepository.create({
            nombre,
            apellido,
            email,
            password,
            especialidad
        });

        await mechanicRepository.save(mechanic);
        res.status(201).json({ message: 'Mechanic registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering mechanic' });
        return;
    }
});

export default router; 