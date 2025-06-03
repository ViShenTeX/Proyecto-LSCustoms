const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Mecanico } = require('../models');
const { validationResult } = require('express-validator');

const authController = {
    // Login de mecánico
    async login(req, res) {
        try {
            const { rut, pin } = req.body;
            
            const mecanico = await Mecanico.findOne({ where: { rut } });
            if (!mecanico) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            const isValidPin = await bcrypt.compare(pin, mecanico.pin);
            if (!isValidPin) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            const token = jwt.sign(
                { id: mecanico.id, rut: mecanico.rut, rango: mecanico.rango },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );

            res.json({ token, mecanico: { id: mecanico.id, nombre: mecanico.nombre, rango: mecanico.rango } });
        } catch (error) {
            res.status(500).json({ error: 'Error en el servidor' });
        }
    }
};

module.exports = authController;
