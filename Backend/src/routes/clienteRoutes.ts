import { Router } from 'express';
import { AppDataSource } from '../config/data-source';
import { Cliente } from '../models/Cliente';

const router = Router();
const clienteRepository = AppDataSource.getRepository(Cliente);

// Obtener todos los clientes
router.get('/', async (_req, res) => {
    try {
        const clientes = await clienteRepository.find();
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener clientes' });
    }
});

// Obtener un cliente por ID
router.get('/:id', async (req: any, res: any) => {
    try {
        const cliente = await clienteRepository.findOneBy({ id: parseInt(req.params.id) });
        if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
        res.json(cliente);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener cliente' });
    }
});

// Crear un nuevo cliente
router.post('/', async (req: any, res: any) => {
    try {
        const cliente = clienteRepository.create(req.body);
        const result = await clienteRepository.save(cliente);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear cliente' });
    }
});

// Actualizar un cliente
router.put('/:id', async (req: any, res: any) => {
    try {
        const cliente = await clienteRepository.findOneBy({ id: parseInt(req.params.id) });
        if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
        clienteRepository.merge(cliente, req.body);
        const result = await clienteRepository.save(cliente);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar cliente' });
    }
});

// Eliminar un cliente
router.delete('/:id', async (req: any, res: any) => {
    try {
        const result = await clienteRepository.delete(req.params.id);
        if (result.affected === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar cliente' });
    }
});

export default router; 