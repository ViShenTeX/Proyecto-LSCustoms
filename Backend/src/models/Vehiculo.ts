import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Cliente } from "./Cliente";

@Entity()
export class Vehiculo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    marca: string;

    @Column()
    modelo: string;

    @Column()
    anio: number;

    @Column()
    patente: string;

    @Column()
    color: string;

    @Column({ nullable: true })
    imagen: string;

    @ManyToOne(() => Cliente, cliente => cliente.vehiculos)
    @JoinColumn({ name: "cliente_id" })
    cliente: Cliente;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 