const Mecanico = require('./Mecanico');
const Cliente = require('./Cliente');
const Vehiculo = require('./Vehiculo');

// Relaciones
Vehiculo.belongsTo(Cliente, { as: 'propietario', foreignKey: 'propietarioId' });
Cliente.hasMany(Vehiculo, { foreignKey: 'propietarioId' });

Vehiculo.belongsTo(Mecanico, { as: 'mecanico', foreignKey: 'mecanicoId' });
Mecanico.hasMany(Vehiculo, { foreignKey: 'mecanicoId' });

module.exports = {
  Mecanico,
  Cliente,
  Vehiculo
};
