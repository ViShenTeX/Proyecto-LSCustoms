import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Mechanic } from '../models/Mechanic';
import jwt from 'jsonwebtoken';

const mechanicRepository = AppDataSource.getRepository(Mechanic);

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const mechanic = await mechanicRepository.findOneBy({ email });

        if (!mechanic) {
            res.status(401).json({ message: 'Credenciales inválidas' });
            return;
        }

        const isValidPassword = await mechanic.validatePassword(password);
        if (!isValidPassword) {
            res.status(401).json({ message: 'Credenciales inválidas' });
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
};

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { nombre, apellido, email, password, especialidad } = req.body;
        
        const existingMechanic = await mechanicRepository.findOneBy({ email });
        if (existingMechanic) {
            res.status(400).json({ message: 'El email ya existe' });
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
        res.status(201).json({ message: 'Mecánico registrado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar mecánico' });
        return;
    }
}; 