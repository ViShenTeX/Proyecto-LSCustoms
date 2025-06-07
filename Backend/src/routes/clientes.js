const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const authMiddleware = require('../middleware/auth');
const { crearCliente, patenteEnParametros } = require('../middleware/validation');

// Rutas protegidas (solo mecánicos pueden crear/gestionar clientes)
router.post('/', authMiddleware, crearCliente, clienteController.crearCliente);
router.get('/:rut', authMiddleware, clienteController.obtenerClientePorRut);
router.get('/:rut/vehiculos', authMiddleware, clienteController.obtenerVehiculosDeCliente);

module.exports = router; 