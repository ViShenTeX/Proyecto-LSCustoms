const sequelize = require('./config/database');
const { Mecanico, Cliente, Vehiculo } = require('./models');

async function syncDatabase() {
  try {
    console.log('Iniciando sincronización de la base de datos...');
    console.log('Base de datos:', process.env.DB_NAME);
    
    // Verificar tablas existentes
    const [tablesBefore] = await sequelize.query('SHOW TABLES');
    console.log('Tablas existentes antes de la sincronización:', tablesBefore);
    
    // Forzar la creación de las tablas
    await sequelize.sync({ force: true });
    console.log('Sincronización completada');
    
    // Verificar tablas después de la sincronización
    const [tablesAfter] = await sequelize.query('SHOW TABLES');
    console.log('Tablas después de la sincronización:', tablesAfter);
    
    process.exit(0);
  } catch (error) {
    console.error('Error durante la sincronización:', error);
    process.exit(1);
  }
}

syncDatabase();
