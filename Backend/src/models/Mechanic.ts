import * as bcrypt from "bcryptjs";
import db from "../config/database";

type MechanicRole = 'mechanic' | 'admin';

export class Mechanic {
    id: number;
    name: string;
    rut: string;
    pin: string;
    role: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.rut = data.rut;
        this.pin = data.pin;
        this.role = data.role;
        this.active = data.active === 1;
        this.createdAt = new Date(data.created_at);
        this.updatedAt = new Date(data.updated_at);
    }

    static async findByRut(rut: string): Promise<Mechanic | null> {
        const [rows]: any = await db.execute(
            'SELECT * FROM mechanics WHERE rut = ?',
            [rut]
        );
        console.log('Datos encontrados en DB:', rows[0]);
        return rows.length > 0 ? new Mechanic(rows[0]) : null;
    }

    static async findById(id: number): Promise<Mechanic | null> {
        const [rows]: any = await db.execute(
            'SELECT * FROM mechanics WHERE id = ?',
            [id]
        );
        return rows.length > 0 ? new Mechanic(rows[0]) : null;
    }

    static async create(data: { rut: string, pin: string, name: string, role: MechanicRole }): Promise<number> {
        console.log('Datos a insertar:', data);
        const hashedPin = await bcrypt.hash(data.pin, 10);
        const [result]: any = await db.execute(
            'INSERT INTO mechanics (rut, pin, name, role, active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, NOW(), NOW())',
            [data.rut, hashedPin, data.name, data.role]
        );
        console.log('Resultado de inserción:', result);
        return result.insertId;
    }

    static async comparePin(inputPin: string, storedPin: string): Promise<boolean> {
        return bcrypt.compare(inputPin, storedPin);
    }
} 