import db from '../config/database';
import bcrypt from 'bcrypt';

async function createAdmin() {
    try {
        const adminPin = await bcrypt.hash('103003', 10);
        
        const [result]: any = await db.execute(
            'INSERT INTO mechanics (name, rut, pin, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
            ['Vichicho', '21.430.534-8', adminPin, 'admin']
        );

        console.log('Admin creado exitosamente con ID:', result.insertId);
    } catch (error) {
        console.error('Error al crear admin:', error);
    } finally {
        process.exit(0);
    }
}

createAdmin(); 