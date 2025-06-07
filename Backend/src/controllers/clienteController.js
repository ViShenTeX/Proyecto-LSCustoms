const { Cliente, Vehiculo } = require('../models');
const { validationResult } = require('express-validator');

const clienteController = {
    // Crear un nuevo cliente
    async crearCliente(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { rut, patente_vehiculo } = req.body;
            const cliente = await Cliente.create({ rut, patente_vehiculo });
            res.status(201).json(cliente);
        } catch (error) {
            res.status(500).json({ error: 'Error al crear el cliente' });
        }
    },

    // Obtener un cliente por RUT
    async obtenerClientePorRut(req, res) {
        try {
            const { rut } = req.params;
            const cliente = await Cliente.findOne({ where: { rut } });
            if (!cliente) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }
            res.json(cliente);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener el cliente' });
        }
    },

    // Obtener los vehículos de un cliente por RUT
    async obtenerVehiculosDeCliente(req, res) {
        try {
            const { rut } = req.params;
            const cliente = await Cliente.findOne({
                where: { rut },
                include: [{ model: Vehiculo, as: 'Vehiculos' }]
            });

            if (!cliente) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }
            res.json(cliente.Vehiculos);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener los vehículos del cliente' });
        }
    }
};

module.exports = clienteController; 