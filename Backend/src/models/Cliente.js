const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cliente = sequelize.define('Cliente', {
  rut: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  patente_vehiculo: {
    type: DataTypes.STRING(10),
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Cliente;
