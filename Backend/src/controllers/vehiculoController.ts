import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Vehiculo } from '../models/Vehiculo';
import multer from 'multer';
import path from 'path';

const vehiculoRepository = AppDataSource.getRepository(Vehiculo);

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

export const getVehiculos = async (_req: Request, res: Response): Promise<void> => {
    try {
        const vehiculos = await vehiculoRepository.find({
            relations: ['cliente']
        });
        res.json(vehiculos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener vehículos' });
        return;
    }
};

export const getVehiculoById = async (req: Request, res: Response): Promise<void> => {
    try {
        const vehiculo = await vehiculoRepository.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ['cliente']
        });
        if (!vehiculo) {
            res.status(404).json({ message: 'Vehículo no encontrado' });
            return;
        }
        res.json(vehiculo);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener vehículo' });
        return;
    }
};

export const createVehiculo = async (req: Request, res: Response): Promise<void> => {
    try {
        upload.single('imagen')(req, res, async (err) => {
            if (err) {
                res.status(400).json({ message: 'Error al subir imagen' });
                return;
            }

            const vehiculoData = {
                ...req.body,
                imagen: req.file ? `/uploads/vehicles/${req.file.filename}` : null
            };

            const vehiculo = vehiculoRepository.create(vehiculoData);
            const result = await vehiculoRepository.save(vehiculo);
            res.status(201).json(result);
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear vehículo' });
        return;
    }
};

export const updateVehiculo = async (req: Request, res: Response): Promise<void> => {
    try {
        upload.single('imagen')(req, res, async (err) => {
            if (err) {
                res.status(400).json({ message: 'Error al subir imagen' });
                return;
            }

            const vehiculo = await vehiculoRepository.findOneBy({ id: parseInt(req.params.id) });
            if (!vehiculo) {
                res.status(404).json({ message: 'Vehículo no encontrado' });
                return;
            }

            const vehiculoData = {
                ...req.body,
                imagen: req.file ? `/uploads/vehicles/${req.file.filename}` : vehiculo.imagen
            };

            vehiculoRepository.merge(vehiculo, vehiculoData);
            const result = await vehiculoRepository.save(vehiculo);
            res.json(result);
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar vehículo' });
        return;
    }
};

export const deleteVehiculo = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await vehiculoRepository.delete(req.params.id);
        if (result.affected === 0) {
            res.status(404).json({ message: 'Vehículo no encontrado' });
            return;
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar vehículo' });
        return;
    }
}; 