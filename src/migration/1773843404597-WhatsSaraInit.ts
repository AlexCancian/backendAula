import { MigrationInterface, QueryRunner } from "typeorm";

export class WhatsSaraInit1773843404597 implements MigrationInterface {
    name = 'WhatsSaraInit1773843404597'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user_refresh_token\` (\`id\` varchar(36) NOT NULL, \`expiresIn\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`idUsuario\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`usuario\` (\`idUsuario\` int NOT NULL AUTO_INCREMENT, \`nome\` varchar(255) NOT NULL, \`apelido\` varchar(100) NOT NULL, \`cpf\` char(11) NULL, \`status\` tinyint NOT NULL DEFAULT 1, \`email\` varchar(200) NULL, \`senha\` varchar(255) NULL, \`codigoRecuperacao\` varchar(6) NULL, PRIMARY KEY (\`idUsuario\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`diasSemana\` (\`idHorario\` int NOT NULL AUTO_INCREMENT, \`diaSemana\` int NOT NULL, \`horaInicio\` time NULL, \`horaFim\` time NULL, \`intervaloSlotMinutos\` int NOT NULL DEFAULT '30', \`ativo\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`idHorario\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`promptIA\` (\`idTipoMensagem\` int NOT NULL AUTO_INCREMENT, \`tipo\` varchar(150) NOT NULL, \`prompt\` text NOT NULL, \`unidade\` varchar(50) NOT NULL, \`valor\` int NOT NULL, \`associado\` tinyint NOT NULL DEFAULT 1, \`status\` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (\`idTipoMensagem\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`mensagensEnviadas\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nome\` varchar(100) NOT NULL, \`agendaPara\` datetime NOT NULL, \`payload\` json NOT NULL, \`status\` varchar(255) NOT NULL DEFAULT 'pendente', \`tentativas\` int NOT NULL DEFAULT '0', \`idTipoMensagem\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`intervaloFuncionamento\` (\`idIntervalo\` int NOT NULL AUTO_INCREMENT, \`diaSemana\` int NOT NULL, \`horaInicio\` time NOT NULL, \`horaFim\` time NOT NULL, \`descricao\` varchar(255) NOT NULL, \`status\` tinyint NOT NULL, PRIMARY KEY (\`idIntervalo\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`audit\` (\`id\` int NOT NULL AUTO_INCREMENT, \`descricao\` varchar(255) NOT NULL, \`entidade\` varchar(100) NULL, \`entityId\` int NULL, \`dados\` text NULL, \`criadoEm\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`logsEnvios\` (\`id\` varchar(36) NOT NULL, \`idMensagem\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL, \`erro\` text NULL, \`criadoEm\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`job\` (\`id\` int NOT NULL AUTO_INCREMENT, \`file_url\` varchar(500) NOT NULL, \`status\` enum ('PENDENTE', 'PROCESSANDO', 'FINALIZADO', 'ERRO') NOT NULL DEFAULT 'PENDENTE', \`idTipoMensagem\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user_refresh_token\` ADD CONSTRAINT \`FK_d1d43bafe4445b18471f8bc9376\` FOREIGN KEY (\`idUsuario\`) REFERENCES \`usuario\`(\`idUsuario\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`mensagensEnviadas\` ADD CONSTRAINT \`FK_3ea941b333be855039cae002194\` FOREIGN KEY (\`idTipoMensagem\`) REFERENCES \`promptIA\`(\`idTipoMensagem\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`job\` ADD CONSTRAINT \`FK_job_prompt\` FOREIGN KEY (\`idTipoMensagem\`) REFERENCES \`promptIA\`(\`idTipoMensagem\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        for (let i = 0; i <= 6; i++) {
            await queryRunner.query(
                `INSERT INTO \`diasSemana\` (\`diaSemana\`, \`horaInicio\`, \`horaFim\`, \`intervaloSlotMinutos\`, \`ativo\`) VALUES (?, '07:30:00', '17:48:00', 1, 0)`,
                [i]
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mensagensEnviadas\` DROP FOREIGN KEY \`FK_3ea941b333be855039cae002194\``);
        await queryRunner.query(`ALTER TABLE \`user_refresh_token\` DROP FOREIGN KEY \`FK_d1d43bafe4445b18471f8bc9376\``);
        await queryRunner.query(`ALTER TABLE \`job\` DROP FOREIGN KEY \`FK_job_prompt\``);
        await queryRunner.query(`DROP TABLE \`logsEnvios\``);
        await queryRunner.query(`DROP TABLE \`job\``);
        await queryRunner.query(`DROP TABLE \`audit\``);
        await queryRunner.query(`DROP TABLE \`intervaloFuncionamento\``);
        await queryRunner.query(`DROP TABLE \`mensagensEnviadas\``);
        await queryRunner.query(`DROP TABLE \`promptIA\``);
        await queryRunner.query(`DROP TABLE \`diasSemana\``);
        await queryRunner.query(`DROP TABLE \`usuario\``);
        await queryRunner.query(`DROP TABLE \`user_refresh_token\``);
    }

}
