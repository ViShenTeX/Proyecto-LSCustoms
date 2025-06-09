import { Router } from 'express';
import { AppDataSource } from '../config/data-source';
import { Vehiculo } from '../models/Vehiculo';
import multer from 'multer';
import path from 'path';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const vehiculoRepository = AppDataSource.getRepository(Vehiculo);

// Apply auth middleware to all routes
router.use(authMiddleware);

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/vehicles'));
    },
    filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Obtener todos los vehículos
router.get('/', async (_req, res) => {
    try {
        const vehiculos = await vehiculoRepository.find({
            relations: ['cliente']
        });
        res.json(vehiculos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener vehículos' });
    }
});

// Obtener un vehículo por ID
router.get('/:id', async (req: any, res: any) => {
    try {
        const vehiculo = await vehiculoRepository.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ['cliente']
        });
        if (!vehiculo) return res.status(404).json({ message: 'Vehículo no encontrado' });
        res.json(vehiculo);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener vehículo' });
    }
});

// Crear un nuevo vehículo
router.post('/', upload.single('imagen'), async (req: any, res: any) => {
    try {
        const vehiculoData = {
            ...req.body,
            imagen: req.file ? `/uploads/vehicles/${req.file.filename}` : null
        };
        const vehiculo = vehiculoRepository.create(vehiculoData);
        const result = await vehiculoRepository.save(vehiculo);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear vehículo' });
    }
});

// Actualizar un vehículo
router.put('/:id', upload.single('imagen'), async (req: any, res: any) => {
    try {
        const vehiculo = await vehiculoRepository.findOneBy({ id: parseInt(req.params.id) });
        if (!vehiculo) return res.status(404).json({ message: 'Vehículo no encontrado' });
        
        const vehiculoData = {
            ...req.body,
            imagen: req.file ? `/uploads/vehicles/${req.file.filename}` : vehiculo.imagen
        };
        
        vehiculoRepository.merge(vehiculo, vehiculoData);
        const result = await vehiculoRepository.save(vehiculo);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar vehículo' });
    }
});

// Eliminar un vehículo
router.delete('/:id', async (req: any, res: any) => {
    try {
        const result = await vehiculoRepository.delete(req.params.id);
        if (result.affected === 0) return res.status(404).json({ message: 'Vehículo no encontrado' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar vehículo' });
    }
});

export default router; 