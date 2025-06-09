import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { AppDataSource } from './config/data-source';
import mechanicRoutes from './routes/mechanicRoutes';
import vehiculoRoutes from './routes/vehiculoRoutes';
import authRoutes from './routes/authRoutes';

// Configuración de variables de entorno
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/vehicles');
if (!require('fs').existsSync(uploadsDir)) {
  require('fs').mkdirSync(uploadsDir, { recursive: true });
}

// Rutas
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/mecanicos', mechanicRoutes);

// Ruta de prueba
app.get('/api/health', (_req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// Manejo de errores
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// Inicializar la conexión a la base de datos y el servidor
AppDataSource.initialize()
  .then(() => {
    console.log("Conexión a la base de datos establecida");
    app.listen(port, () => {
      console.log(`Servidor corriendo en el puerto ${port}`);
    });
  })
  .catch((error: any) => {
    console.error("Error al conectar con la base de datos:", error);
  }); 