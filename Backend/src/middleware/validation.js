const { body, param } = require('express-validator');

const validation = {
    // Validaciones para la creación de un mecánico
    crearMecanico: [
        body('nombre').notEmpty().withMessage('El nombre es requerido'),
        body('rut').notEmpty().withMessage('El RUT es requerido').isLength({ min: 9, max: 20 }).withMessage('El RUT debe tener entre 9 y 20 caracteres'),
        body('pin').notEmpty().withMessage('El PIN es requerido').isLength({ min: 4, max: 6 }).withMessage('El PIN debe tener entre 4 y 6 dígitos'),
        body('rango').isIn(['lubricacion', 'tecnico_c', 'tecnico_b', 'tecnico_a', 'maestro']).withMessage('Rango de mecánico inválido')
    ],

    // Validaciones para el login de mecánico
    loginMecanico: [
        body('rut').notEmpty().withMessage('El RUT es requerido'),
        body('pin').notEmpty().withMessage('El PIN es requerido')
    ],

    // Validaciones para la creación de un cliente
    crearCliente: [
        body('rut').notEmpty().withMessage('El RUT es requerido').isLength({ min: 9, max: 20 }).withMessage('El RUT debe tener entre 9 y 20 caracteres'),
        body('patente_vehiculo').notEmpty().withMessage('La patente del vehículo es requerida').isLength({ min: 6, max: 10 }).withMessage('La patente debe tener entre 6 y 10 caracteres')
    ],

    // Validaciones para la creación de un vehículo
    crearVehiculo: [
        body('patente').notEmpty().withMessage('La patente es requerida').isLength({ min: 6, max: 10 }).withMessage('La patente debe tener entre 6 y 10 caracteres'),
        body('descripcion').notEmpty().withMessage('La descripción es requerida'),
        body('rutCliente').notEmpty().withMessage('El RUT del cliente es requerido')
    ],

    // Validaciones para el ID en los parámetros de la ruta
    idEnParametros: [
        param('id').isInt().withMessage('El ID debe ser un número entero')
    ],

    // Validaciones para la patente en los parámetros de la ruta
    patenteEnParametros: [
        param('patente').notEmpty().withMessage('La patente es requerida').isLength({ min: 6, max: 10 }).withMessage('La patente debe tener entre 6 y 10 caracteres')
    ]
};

module.exports = validation; 