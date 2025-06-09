import rateLimit from 'express-rate-limit';

// Limiter para rutas de autenticación
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos
    message: 'Demasiados intentos de inicio de sesión, por favor intente nuevamente en 15 minutos',
    standardHeaders: true,
    legacyHeaders: false,
});

// Limiter general para todas las rutas
export const generalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 100, // 100 peticiones por minuto
    message: 'Demasiadas peticiones, por favor intente nuevamente más tarde',
    standardHeaders: true,
    legacyHeaders: false,
});
