import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config();

interface Config {
    port: number;
    db: {
        host: string;
        user: string;
        password: string;
        database: string;
        port: number;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    uploads: {
        vehicles: string;
    };
}

const config: Config = {
    port: parseInt(process.env.PORT || '3000'),
    db: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ls-garage',
        port: parseInt(process.env.DB_PORT || '3306')
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'default_secret',
        expiresIn: '24h'
    },
    uploads: {
        vehicles: path.join(__dirname, '../../uploads/vehicles')
    }
};

export default config; 