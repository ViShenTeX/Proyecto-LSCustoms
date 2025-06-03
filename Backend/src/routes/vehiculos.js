const express = require('express');
const router = express.Router();
const vehiculoController = require('../controllers/vehiculoController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// Rutas protegidas que requieren autenticación
router.post('/', authMiddleware, vehiculoController.crear);
router.post('/:id/imagenes', authMiddleware, upload.array('imagenes', 5), vehiculoController.subirImagenes);

// Ruta pública para consultar vehículo
router.get('/:patente', vehiculoController.obtenerPorPatente);

module.exports = router;
