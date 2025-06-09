import { Request, Response } from 'express';
import { Mechanic } from '../models/Mechanic';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const login = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { rut, pin } = req.body;
        const mechanic = await Mechanic.findByRut(rut);

        if (!mechanic) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const isValidPin = await Mechanic.comparePin(pin, mechanic.pin);
        if (!isValidPin) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { 
                id: mechanic.id,
                rut: mechanic.rut,
                role: mechanic.role
            },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: '8h' }
        );

        return res.json({
            token,
            mechanic: {
                id: mechanic.id,
                name: mechanic.name,
                rut: mechanic.rut,
                role: mechanic.role
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ message: 'Error en el servidor' });
    }
};

export const register = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { name, rut, pin, role } = req.body;

        const existingMechanic = await Mechanic.findByRut(rut);
        if (existingMechanic) {
            return res.status(400).json({ message: 'Ya existe un mecánico con este RUT' });
        }

        const hashedPin = await bcrypt.hash(pin, 10);
        const mechanicId = await Mechanic.create({
            name,
            rut,
            pin: hashedPin,
            role: role || 'mecanico'
        });

        return res.status(201).json({
            message: 'Mecánico registrado exitosamente',
            mechanicId
        });
    } catch (error) {
        console.error('Error en registro:', error);
        return res.status(500).json({ message: 'Error en el servidor' });
    }
}; 