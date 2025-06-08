const express = require('express');
const router = express.Router();
const mechanicController = require('../controllers/mechanicController');
const auth = require('../middleware/auth');

// Ruta pública para registro de mecánicos (solo admin)
router.post('/register', auth, mechanicController.registerMechanic);

// Ruta pública para login
router.post('/login', mechanicController.loginMechanic);

// Ruta protegida para obtener perfil
router.get('/profile', auth, mechanicController.getMechanicProfile);

module.exports = router; 