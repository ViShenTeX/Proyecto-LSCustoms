const sequelize = require('./config/database');
require('dotenv').config();

// Agregar estas líneas para debug
console.log('Conectando a la base de datos:', process.env.DB_NAME);
console.log('Host:', process.env.DB_HOST);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    
    // Listar las tablas existentes
    const [results] = await sequelize.query('SHOW TABLES');
    console.log('Tablas existentes:', results);
    
    // Sincronizar modelos
    await sequelize.sync({ force: true }); // Cambiamos a force: true para forzar la creación
    
    // Listar las tablas después de la sincronización
    const [resultsAfter] = await sequelize.query('SHOW TABLES');
    console.log('Tablas después de la sincronización:', resultsAfter);
    
    process.exit(0);
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    process.exit(1);
  }
}

testConnection();