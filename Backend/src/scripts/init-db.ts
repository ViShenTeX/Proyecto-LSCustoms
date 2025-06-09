import db from '../config/database';
import bcrypt from 'bcryptjs';

async function initDatabase() {
  try {
    // Crear tabla de mecánicos
    await db.execute(`
      CREATE TABLE IF NOT EXISTS mechanics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        rut VARCHAR(20) NOT NULL UNIQUE,
        pin VARCHAR(255) NOT NULL,
        role ENUM('mecanico', 'admin') DEFAULT 'mecanico',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla de mecánicos creada o verificada');

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

    // Crear usuario admin por defecto
    const adminPin = await bcrypt.hash('1234', 10);
    await db.execute(`
        INSERT INTO mechanics (name, rut, pin, role, created_at, updated_at)
        VALUES ('Admin', '21.430.534-8', ?, 'admin', NOW(), NOW())
        ON DUPLICATE KEY UPDATE role = 'admin'
    `, [adminPin]);
    console.log('Usuario admin creado o actualizado');

    process.exit(0);
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  }
}

initDatabase(); 