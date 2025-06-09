import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: true,
    entities: [path.join(__dirname, "../models/**/*.{ts,js}")],
    migrations: [path.join(__dirname, "../migrations/**/*.{ts,js}")],
    subscribers: [path.join(__dirname, "../subscribers/**/*.{ts,js}")]
}); 