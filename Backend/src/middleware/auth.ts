import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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

export const auth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.header('x-auth-token');

    if (!token) {
      res.status(401).json({ message: 'No hay token, autorización denegada' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as JwtPayload;
    req.mechanic = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token no válido' });
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