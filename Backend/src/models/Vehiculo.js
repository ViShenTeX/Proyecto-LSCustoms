const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vehiculo = sequelize.define('Vehiculo', {
  patente: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'en_progreso', 'completado', 'entregado'),
    defaultValue: 'pendiente'
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  imagenes: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  timestamps: true
});

module.exports = Vehiculo;
