import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/data-source';
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
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'Invalid token format' });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as any;
        const mechanicRepository = AppDataSource.getRepository(Mechanic);
        const mechanic = await mechanicRepository.findOneBy({ id: decoded.id });

        if (!mechanic) {
            res.status(401).json({ message: 'User not found' });
            return;
        }

        req.user = mechanic;
        next();
    } catch (error) {
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