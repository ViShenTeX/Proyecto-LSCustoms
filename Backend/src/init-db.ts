import { pool } from './db';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

async function initializeDatabase() {
  try {
    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);

    // Check if default mechanic exists
    const result = await pool.query('SELECT * FROM mechanics WHERE rut = $1', ['11.111.111-1']);
    
    if (result.rows.length === 0) {
      // Create default mechanic
      const hashedPin = await bcrypt.hash('123456', 10);
      await pool.query(
        'INSERT INTO mechanics (rut, nombre, pin) VALUES ($1, $2, $3)',
        ['11.111.111-1', 'Mecánico Admin', hashedPin]
      );
      console.log('Default mechanic account created');
    } else {
      console.log('Default mechanic account already exists');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await pool.end();
  }
}

initializeDatabase(); 