import { Mechanic } from '../../models/Mechanic';

declare global {
    namespace Express {
        interface Request {
            user?: Mechanic;
        }
    }
} 