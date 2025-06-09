import db from '../config/database';
import bcrypt from 'bcryptjs';

async function initDatabase() {
  try {
    // Crear tabla de mecánicos
    await db.execute(`
      CREATE TABLE IF NOT EXISTS mechanics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        rut VARCHAR(20) NOT NULL UNIQUE,
        pin VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role ENUM('mechanic', 'admin') DEFAULT 'mechanic',
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de clientes
    await db.execute(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        rut VARCHAR(20) NOT NULL UNIQUE,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        telefono VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de vehículos
    await db.execute(`
      CREATE TABLE IF NOT EXISTS vehiculos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patente VARCHAR(10) NOT NULL UNIQUE,
        marca VARCHAR(50) NOT NULL,
        modelo VARCHAR(50) NOT NULL,
        año INT NOT NULL,
        cliente_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
      )
    `);

    console.log('Tablas creadas exitosamente');

    // Verificar si el administrador ya existe
    const [existingAdmin] = await db.execute(
      'SELECT * FROM mechanics WHERE rut = ?',
      ['21.430.534-8']
    );

    if (!existingAdmin || (Array.isArray(existingAdmin) && existingAdmin.length === 0)) {
      // Crear el administrador
      const hashedPin = await bcrypt.hash('103003', 10);
      await db.execute(
        'INSERT INTO mechanics (rut, pin, name, role) VALUES (?, ?, ?, ?)',
        ['21.430.534-8', hashedPin, 'Vichicho', 'admin']
      );
      console.log('Administrador inicial creado exitosamente');
    } else {
      console.log('El administrador inicial ya existe');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  }
}

initDatabase(); 