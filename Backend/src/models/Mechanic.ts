import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import * as bcrypt from "bcryptjs";
import db from "../config/database"; // Importar la conexión directa a la base de datos

type MechanicRole = 'mecanico' | 'admin';

@Entity()
export class Mechanic {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column()
    apellido: string;

    @Column({ unique: true })
    rut: string;

    @Column()
    password: string;

    @Column()
    especialidad: string;

    @Column({ default: true })
    activo: boolean;

    @Column({ default: 'mecanico' })
    rol: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }

    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    static async findByRut(rut: string): Promise<Mechanic | null> {
        const [rows]: any = await db.execute('SELECT * FROM mechanics WHERE rut = ?', [rut]);
        if (rows.length === 0) return null;
        const mechanicData = rows[0];
        const mechanic = new Mechanic();
        mechanic.id = mechanicData.id;
        mechanic.nombre = mechanicData.name;
        mechanic.apellido = mechanicData.apellido || '';
        mechanic.rut = mechanicData.rut;
        mechanic.password = mechanicData.pin;
        mechanic.especialidad = mechanicData.especialidad || '';
        mechanic.rol = mechanicData.role;
        mechanic.activo = mechanicData.active;
        mechanic.createdAt = new Date(mechanicData.created_at);
        mechanic.updatedAt = new Date(mechanicData.updated_at);
        return mechanic;
    }

    static async create(data: { rut: string, pin: string, name: string, role: MechanicRole }): Promise<number> {
        const hashedPin = await bcrypt.hash(data.pin, 10);
        const [result]: any = await db.execute(
            'INSERT INTO mechanics (rut, pin, name, role) VALUES (?, ?, ?, ?)',
            [data.rut, hashedPin, data.name, data.role]
        );
        return result.insertId;
    }

    static async comparePin(pin: string, hashedPin: string): Promise<boolean> {
        return bcrypt.compare(pin, hashedPin);
    }

    static async findById(id: number): Promise<Mechanic | null> {
        const [rows]: any = await db.execute('SELECT * FROM mechanics WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        const mechanicData = rows[0];
        // Mapear los datos de la fila a una instancia de Mechanic
        const mechanic = new Mechanic();
        mechanic.id = mechanicData.id;
        mechanic.nombre = mechanicData.name;
        mechanic.apellido = mechanicData.apellido || '';
        mechanic.rut = mechanicData.rut;
        mechanic.password = mechanicData.pin;
        mechanic.especialidad = mechanicData.especialidad || '';
        mechanic.rol = mechanicData.role;
        mechanic.activo = mechanicData.active;
        mechanic.createdAt = new Date(mechanicData.created_at);
        mechanic.updatedAt = new Date(mechanicData.updated_at);
        return mechanic;
    }
} 