import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1784826884855 implements MigrationInterface {
    name = 'InitialSchema1784826884855'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "hedges" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "volume" numeric(18,4) NOT NULL, "entry_rate" numeric(12,6) NOT NULL, "hedge_date" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "trade_id" uuid NOT NULL, CONSTRAINT "PK_3552d50a546133845d6c2aede6d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "trades" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "side" character varying(4) NOT NULL, "currency_pair" character varying(6) NOT NULL, "volume" numeric(18,4) NOT NULL, "entry_rate" numeric(12,6) NOT NULL, "trade_date" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "book_id" uuid NOT NULL, CONSTRAINT "PK_c6d7c36a837411ba5194dc58595" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "books" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_daaf43033f8883943d0734e6743" UNIQUE ("name"), CONSTRAINT "PK_f3f2f25a099d24e12545b70b022" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "hedges" ADD CONSTRAINT "FK_a14d3b35df6d0571264c6c5560d" FOREIGN KEY ("trade_id") REFERENCES "trades"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trades" ADD CONSTRAINT "FK_1d971075b984614eb55118e0afb" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "trades" DROP CONSTRAINT "FK_1d971075b984614eb55118e0afb"`);
        await queryRunner.query(`ALTER TABLE "hedges" DROP CONSTRAINT "FK_a14d3b35df6d0571264c6c5560d"`);
        await queryRunner.query(`DROP TABLE "books"`);
        await queryRunner.query(`DROP TABLE "trades"`);
        await queryRunner.query(`DROP TABLE "hedges"`);
    }

}
