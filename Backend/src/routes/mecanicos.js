const express = require('express');
const router = express.Router();
const mecanicoController = require('../controllers/mecanicoController');
const authMiddleware = require('../middleware/auth');
const { crearMecanico, idEnParametros } = require('../middleware/validation');

// Rutas protegidas (solo administradores/mecanicos con cierto rango pueden gestionar mecánicos)
router.post('/', authMiddleware, crearMecanico, mecanicoController.crearMecanico);
router.get('/', authMiddleware, mecanicoController.obtenerMecanicos);
router.put('/:id', authMiddleware, idEnParametros, mecanicoController.actualizarMecanico);
router.delete('/:id', authMiddleware, idEnParametros, mecanicoController.eliminarMecanico);

module.exports = router; 