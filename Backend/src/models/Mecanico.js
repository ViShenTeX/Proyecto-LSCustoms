const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mecanico = sequelize.define('Mecanico', {
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  rut: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  pin: {
    type: DataTypes.STRING(6),
    allowNull: false
  },
  rango: {
    type: DataTypes.ENUM('lubricacion', 'tecnico_c', 'tecnico_b', 'tecnico_a', 'maestro'),
    defaultValue: 'lubricacion'
  }
}, {
  timestamps: true
});

module.exports = Mecanico;
