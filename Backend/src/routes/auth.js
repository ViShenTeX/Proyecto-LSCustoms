const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginMecanico } = require('../middleware/validation');

// Ruta para el login de mecánicos
router.post('/login', loginMecanico, authController.login);

module.exports = router; 