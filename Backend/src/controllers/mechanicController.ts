import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Mechanic } from '../models/Mechanic';
import db from '../config/database';
import bcrypt from 'bcrypt';

export const registerMechanic = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    if (req.mechanic?.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para crear mecánicos' });
    }

    const { name, rut, pin, role } = req.body;

    // Verificar si ya existe un mecánico con ese RUT
    const [existing] = await db.execute(
      'SELECT id FROM mechanics WHERE rut = ?',
      [rut]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      res.status(400).json({ message: 'Ya existe un mecánico con ese RUT' });
      return;
    }

    // Hash del PIN
    const hashedPin = await bcrypt.hash(pin, 10);

    // Crear nuevo mecánico
    const [result]: any = await db.execute(
      'INSERT INTO mechanics (name, rut, pin, role, active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, NOW(), NOW())',
      [name, rut, hashedPin, role || 'mechanic']
    );

    res.status(201).json({
      id: result.insertId,
      name,
      rut,
      role: role || 'mechanic'
    });
  } catch (error) {
    console.error('Error al registrar mecánico:', error);
    res.status(500).json({ message: 'Error al registrar mecánico' });
  }
};

export const loginMechanic = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { rut, pin } = req.body;

    // Buscar mecánico por RUT
    const mechanic = await Mechanic.findByRut(rut);
    if (!mechanic) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    // Verificar PIN
    const isMatch = await Mechanic.comparePin(pin, mechanic.pin);
    if (!isMatch) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: mechanic.id,
        rut: mechanic.rut,
        role: mechanic.role 
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
        name: mechanic.name,
        role: mechanic.role
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

export const getMechanicProfile = async (req: Request, res: Response): Promise<Response | void> => {
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
      name: mechanic.name,
      role: mechanic.role
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
};

export const deleteMechanic = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    if (req.mechanic?.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para eliminar mecánicos' });
    }

    // No permitir eliminar el propio usuario
    if (req.mechanic.id === parseInt(req.params.id)) {
      res.status(400).json({ message: 'No puedes eliminar tu propia cuenta' });
      return;
    }

    const [result]: any = await db.execute(
      'DELETE FROM mechanics WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Mecánico no encontrado' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar mecánico:', error);
    res.status(500).json({ message: 'Error al eliminar mecánico' });
  }
}; 