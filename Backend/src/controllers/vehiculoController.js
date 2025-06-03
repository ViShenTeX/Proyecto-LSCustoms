const { Vehiculo, Cliente, Mecanico } = require('../models');
const { validationResult } = require('express-validator');

const vehiculoController = {
    // Crear nuevo vehículo
    async crear(req, res) {
        try {
            const { patente, descripcion, rutCliente } = req.body;
            
            // Validar que el cliente existe
            const cliente = await Cliente.findOne({ where: { rut: rutCliente } });
            if (!cliente) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }

            // Crear vehículo
            const vehiculo = await Vehiculo.create({
                patente,
                descripcion,
                propietarioId: cliente.id,
                mecanicoId: req.mecanico.id
            });

            res.status(201).json(vehiculo);
        } catch (error) {
            res.status(500).json({ error: 'Error al crear el vehículo' });
        }
    },

    // Subir imágenes
    async subirImagenes(req, res) {
        try {
            const { id } = req.params;
            const vehiculo = await Vehiculo.findByPk(id);
            
            if (!vehiculo) {
                return res.status(404).json({ error: 'Vehículo no encontrado' });
            }

            const imagenes = req.files.map(file => ({
                url: `/uploads/${file.filename}`,
                fecha: new Date()
            }));

            vehiculo.imagenes = [...(vehiculo.imagenes || []), ...imagenes];
            await vehiculo.save();

            res.json(vehiculo);
        } catch (error) {
            res.status(500).json({ error: 'Error al subir las imágenes' });
        }
    },

    // Obtener vehículo por patente
    async obtenerPorPatente(req, res) {
        try {
            const { patente } = req.params;
            const vehiculo = await Vehiculo.findOne({
                where: { patente },
                include: [
                    { model: Cliente, as: 'propietario' },
                    { model: Mecanico, as: 'mecanico' }
                ]
            });

            if (!vehiculo) {
                return res.status(404).json({ error: 'Vehículo no encontrado' });
            }

            res.json(vehiculo);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener el vehículo' });
        }
    }
};

module.exports = vehiculoController;
