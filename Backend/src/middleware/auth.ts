import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Mechanic } from '../models/Mechanic';

interface JwtPayload {
  id: number;
  rut: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      mechanic?: JwtPayload;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as jwt.JwtPayload;
        const mechanic = await Mechanic.findByRut(decoded.rut);

        if (!mechanic) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }

        req.mechanic = {
            id: mechanic.id,
            rut: mechanic.rut,
            role: mechanic.role
        };

        next();
        return;
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Invalid token' });
        return;
    }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (req.mechanic?.role !== 'admin') {
        res.status(403).json({ message: 'Acceso denegado. Se requieren privilegios de administrador.' });
        return;
    }
    next();
}; 