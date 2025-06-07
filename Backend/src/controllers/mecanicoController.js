const { Mecanico } = require('../models');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const mecanicoController = {
    // Crear un nuevo mecánico
    async crearMecanico(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { nombre, rut, pin, rango } = req.body;
            const hashedPassword = await bcrypt.hash(pin, 10);
            const mecanico = await Mecanico.create({ nombre, rut, pin: hashedPassword, rango });
            res.status(201).json({ id: mecanico.id, nombre: mecanico.nombre, rut: mecanico.rut, rango: mecanico.rango });
        } catch (error) {
            res.status(500).json({ error: 'Error al crear el mecánico' });
        }
    },

    // Obtener todos los mecánicos
    async obtenerMecanicos(req, res) {
        try {
            const mecanicos = await Mecanico.findAll({
                attributes: ['id', 'nombre', 'rut', 'rango'] // Evitar enviar el PIN
            });
            res.json(mecanicos);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener los mecánicos' });
        }
    },

    // Actualizar un mecánico
    async actualizarMecanico(req, res) {
        try {
            const { id } = req.params;
            const { nombre, pin, rango } = req.body;
            const mecanico = await Mecanico.findByPk(id);

            if (!mecanico) {
                return res.status(404).json({ error: 'Mecánico no encontrado' });
            }

            if (nombre) mecanico.nombre = nombre;
            if (rango) mecanico.rango = rango;
            if (pin) {
                const hashedPassword = await bcrypt.hash(pin, 10);
                mecanico.pin = hashedPassword;
            }

            await mecanico.save();
            res.json({ id: mecanico.id, nombre: mecanico.nombre, rut: mecanico.rut, rango: mecanico.rango });
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar el mecánico' });
        }
    },

    // Eliminar un mecánico
    async eliminarMecanico(req, res) {
        try {
            const { id } = req.params;
            const mecanico = await Mecanico.findByPk(id);

            if (!mecanico) {
                return res.status(404).json({ error: 'Mecánico no encontrado' });
            }

            await mecanico.destroy();
            res.status(204).send(); // No Content
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar el mecánico' });
        }
    }
};

module.exports = mecanicoController; 