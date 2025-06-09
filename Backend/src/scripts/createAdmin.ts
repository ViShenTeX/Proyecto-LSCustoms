import { AppDataSource } from '../config/data-source';
import { Mechanic } from '../models/Mechanic';
import bcrypt from 'bcrypt';

async function createAdmin() {
    try {
        await AppDataSource.initialize();
        console.log('Conexión a la base de datos establecida');

        const mechanicRepository = AppDataSource.getRepository(Mechanic);

        // Verificar si ya existe un administrador
        const existingAdmin = await mechanicRepository.findOne({
            where: { rut: '21.430.534-8' }
        });

        if (existingAdmin) {
            console.log('El administrador ya existe');
            return;
        }

        // Crear el administrador
        const admin = new Mechanic();
        admin.nombre = 'Administrador';
        admin.rut = '21.430.534-8';
        admin.password = await bcrypt.hash('103003', 10);
        admin.rol = 'admin';
        admin.activo = true;

        await mechanicRepository.save(admin);
        console.log('Administrador creado exitosamente');

    } catch (error) {
        console.error('Error al crear el administrador:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

createAdmin(); 