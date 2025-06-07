module.exports = {
    // Configuración de la base de datos
    database: {
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    },

    // Configuración del servidor
    server: {
        port: process.env.PORT || 3000,
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }
    },

    // Configuración de autenticación
    auth: {
        jwtSecret: process.env.JWT_SECRET,
        tokenExpiration: '8h'
    },

    // Configuración de carga de archivos
    upload: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
        uploadPath: 'uploads/'
    },

    // Configuración de estados de vehículos
    vehiculoEstados: {
        PENDIENTE: 'pendiente',
        EN_PROGRESO: 'en_progreso',
        COMPLETADO: 'completado',
        ENTREGADO: 'entregado'
    },

    // Configuración de rangos de mecánicos
    mecanicoRangos: {
        LUBRICACION: 'lubricacion',
        TECNICO_C: 'tecnico_c',
        TECNICO_B: 'tecnico_b',
        TECNICO_A: 'tecnico_a',
        MAESTRO: 'maestro'
    }
}; 