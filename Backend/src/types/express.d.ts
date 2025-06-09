import { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            mechanic?: {
                id: number;
                rut: string;
                role: string;
            };
        }
    }
}

declare module 'jsonwebtoken' {
    interface JwtPayload {
        id: number;
        rut: string;
        role: string;
    }
} 