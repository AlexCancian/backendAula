import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNomeCompletoToPromptIA1774490145454 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE promptIA ADD nomeCompleto TINYINT NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE promptIA DROP COLUMN nomeCompleto`);
    }

}
