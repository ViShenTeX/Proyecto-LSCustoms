import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { BeforeInsert } from "typeorm";
import * as bcrypt from "bcryptjs";
import { AppDataSource } from "../config/data-source";

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

    @Column({ type: 'enum', enum: ['mecanico', 'admin'], default: 'mecanico' })
    rol: MechanicRole;

    @Column({ default: true })
    activo: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @BeforeInsert()
    async hashPassword() {
        if (this.password) {
            this.password = await bcrypt.hash(this.password, 10);
        }
    }

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }

    static async findByRut(rut: string): Promise<Mechanic | null> {
        const repository = AppDataSource.getRepository(Mechanic);
        return repository.findOne({ where: { rut } });
    }

    static async create(data: { rut: string, pin: string, name: string, role: MechanicRole }): Promise<number> {
        const repository = AppDataSource.getRepository(Mechanic);
        const mechanic = repository.create({
            rut: data.rut,
            password: data.pin,
            nombre: data.name,
            rol: data.role
        });
        const saved = await repository.save(mechanic);
        return saved.id;
    }

    static async comparePin(pin: string, hashedPin: string): Promise<boolean> {
        return bcrypt.compare(pin, hashedPin);
    }

    static async findById(id: number): Promise<Mechanic | null> {
        const repository = AppDataSource.getRepository(Mechanic);
        return repository.findOne({ where: { id } });
    }
} 