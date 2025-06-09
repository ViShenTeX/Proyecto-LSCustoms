import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1709000000000 implements MigrationInterface {
    name = 'InitialSchema1709000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`cliente\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`nombre\` varchar(255) NOT NULL,
                \`apellido\` varchar(255) NOT NULL,
                \`email\` varchar(255) NOT NULL,
                \`telefono\` varchar(255) NOT NULL,
                \`direccion\` varchar(255) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_cliente_email\` (\`email\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE \`mechanic\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`nombre\` varchar(255) NOT NULL,
                \`apellido\` varchar(255) NOT NULL,
                \`email\` varchar(255) NOT NULL,
                \`password\` varchar(255) NOT NULL,
                \`especialidad\` varchar(255) NOT NULL,
                \`activo\` tinyint NOT NULL DEFAULT 1,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_mechanic_email\` (\`email\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE \`vehiculo\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`marca\` varchar(255) NOT NULL,
                \`modelo\` varchar(255) NOT NULL,
                \`anio\` int NOT NULL,
                \`patente\` varchar(255) NOT NULL,
                \`color\` varchar(255) NOT NULL,
                \`imagen\` varchar(255) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`cliente_id\` int NULL,
                UNIQUE INDEX \`IDX_vehiculo_patente\` (\`patente\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            ALTER TABLE \`vehiculo\`
            ADD CONSTRAINT \`FK_vehiculo_cliente\`
            FOREIGN KEY (\`cliente_id\`) REFERENCES \`cliente\`(\`id\`)
            ON DELETE SET NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`vehiculo\` DROP FOREIGN KEY \`FK_vehiculo_cliente\``);
        await queryRunner.query(`DROP TABLE \`vehiculo\``);
        await queryRunner.query(`DROP TABLE \`mechanic\``);
        await queryRunner.query(`DROP TABLE \`cliente\``);
    }
} 