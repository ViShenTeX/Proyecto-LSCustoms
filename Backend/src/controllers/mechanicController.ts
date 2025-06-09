import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Mechanic } from '../models/Mechanic';

export const registerMechanic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rut, pin, name, role } = req.body;

    // Verificar si el mecánico ya existe
    const existingMechanic = await Mechanic.findByRut(rut);
    if (existingMechanic) {
      res.status(400).json({ message: 'El RUT ya está registrado' });
      return;
    }

    // Crear nuevo mecánico
    const mechanicId = await Mechanic.create({ rut, pin, name, role });

    res.status(201).json({
      message: 'Mecánico registrado exitosamente',
      mechanicId
    });
  } catch (error) {
    console.error('Error al registrar mecánico:', error);
    res.status(500).json({ message: 'Error al registrar mecánico' });
  }
};

export const loginMechanic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rut, pin } = req.body;

    // Buscar mecánico por RUT
    const mechanic = await Mechanic.findByRut(rut);
    if (!mechanic) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    // Verificar si el mecánico está activo
    if (!mechanic.activo) {
      res.status(401).json({ message: 'Cuenta desactivada' });
      return;
    }

    // Verificar PIN
    const isMatch = await Mechanic.comparePin(pin, mechanic.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: mechanic.id,
        rut: mechanic.rut,
        role: mechanic.rol 
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      mechanic: {
        id: mechanic.id,
        rut: mechanic.rut,
        name: mechanic.nombre,
        role: mechanic.rol
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

export const getMechanicProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const mechanicId = (req as any).mechanic.id;
    const mechanic = await Mechanic.findById(mechanicId);
    
    if (!mechanic) {
      res.status(404).json({ message: 'Mecánico no encontrado' });
      return;
    }

    res.json({
      id: mechanic.id,
      rut: mechanic.rut,
      name: mechanic.nombre,
      role: mechanic.rol
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
}; 