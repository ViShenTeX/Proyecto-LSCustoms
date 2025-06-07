const sequelize = require('./config/database');

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    
    // Sincronizar modelos
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados correctamente.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    process.exit(1);
  }
}

testConnection();
