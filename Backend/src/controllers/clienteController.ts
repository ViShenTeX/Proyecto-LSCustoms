import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Cliente } from '../models/Cliente';

const clienteRepository = AppDataSource.getRepository(Cliente);

export const getClientes = async (_req: Request, res: Response): Promise<void> => {
    try {
        const clientes = await clienteRepository.find();
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener clientes' });
        return;
    }
};

export const getClienteById = async (req: Request, res: Response): Promise<void> => {
    try {
        const cliente = await clienteRepository.findOneBy({ id: parseInt(req.params.id) });
        if (!cliente) {
            res.status(404).json({ message: 'Cliente no encontrado' });
            return;
        }
        res.json(cliente);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener cliente' });
        return;
    }
};

export const createCliente = async (req: Request, res: Response): Promise<void> => {
    try {
        const cliente = clienteRepository.create(req.body);
        const result = await clienteRepository.save(cliente);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear cliente' });
        return;
    }
};

export const updateCliente = async (req: Request, res: Response): Promise<void> => {
    try {
        const cliente = await clienteRepository.findOneBy({ id: parseInt(req.params.id) });
        if (!cliente) {
            res.status(404).json({ message: 'Cliente no encontrado' });
            return;
        }
        clienteRepository.merge(cliente, req.body);
        const result = await clienteRepository.save(cliente);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar cliente' });
        return;
    }
};

export const deleteCliente = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await clienteRepository.delete(req.params.id);
        if (result.affected === 0) {
            res.status(404).json({ message: 'Cliente no encontrado' });
            return;
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar cliente' });
        return;
    }
}; 