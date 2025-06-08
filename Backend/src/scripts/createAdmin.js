require('dotenv').config();
const mongoose = require('mongoose');
const Mechanic = require('../models/Mechanic');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const adminData = {
      rut: '21.430.534-8',
      pin: '103003',
      name: 'Vichicho',
      role: 'admin'
    };

    const existingAdmin = await Mechanic.findOne({ rut: adminData.rut });
    if (existingAdmin) {
      console.log('El administrador ya existe');
      process.exit(0);
    }

    const admin = new Mechanic(adminData);
    await admin.save();
    console.log('Administrador creado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al crear administrador:', error);
    process.exit(1);
  }
}

createAdmin(); 