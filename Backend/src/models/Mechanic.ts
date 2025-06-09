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

    @Column({ unique: true })
    rut: string;

    @Column()
    pin: string;

    @Column({ default: 'mecanico' })
    rol: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    async validatePassword(pin: string): Promise<boolean> {
        return bcrypt.compare(pin, this.pin);
    }

    static async hashPassword(pin: string): Promise<string> {
        return bcrypt.hash(pin, 10);
    }

    static async hashPin(pin: string): Promise<string> {
        return bcrypt.hash(pin, 10);
    }

    static async comparePin(pin: string, hashedPin: string): Promise<boolean> {
        return bcrypt.compare(pin, hashedPin);
    }

    static async findByRut(rut: string): Promise<Mechanic | null> {
        const [rows]: any = await db.execute('SELECT * FROM mechanics WHERE rut = ?', [rut]);
        if (rows.length === 0) return null;
        const mechanicData = rows[0];
        const mechanic = new Mechanic();
        mechanic.id = mechanicData.id;
        mechanic.nombre = mechanicData.nombre;
        mechanic.rut = mechanicData.rut;
        mechanic.pin = mechanicData.pin;
        mechanic.rol = mechanicData.rol;
        mechanic.createdAt = new Date(mechanicData.created_at);
        mechanic.updatedAt = new Date(mechanicData.updated_at);
        return mechanic;
    }

    static async create(data: { rut: string, pin: string, nombre: string, rol: MechanicRole }): Promise<number> {
        const hashedPin = await bcrypt.hash(data.pin, 10);
        const [result]: any = await db.execute(
            'INSERT INTO mechanics (rut, pin, nombre, rol) VALUES (?, ?, ?, ?)',
            [data.rut, hashedPin, data.nombre, data.rol]
        );
        return result.insertId;
    }

    static async findById(id: number): Promise<Mechanic | null> {
        const [rows]: any = await db.execute('SELECT * FROM mechanics WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        const mechanicData = rows[0];
        const mechanic = new Mechanic();
        mechanic.id = mechanicData.id;
        mechanic.nombre = mechanicData.nombre;
        mechanic.rut = mechanicData.rut;
        mechanic.pin = mechanicData.pin;
        mechanic.rol = mechanicData.rol;
        mechanic.createdAt = new Date(mechanicData.created_at);
        mechanic.updatedAt = new Date(mechanicData.updated_at);
        return mechanic;
    }
} 