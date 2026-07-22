import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBooksTable1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "books" (
        -- UUID gera um ID único universal por registro. O default usa a função nativa do Postgres.
        "id" UUID NOT NULL DEFAULT gen_random_uuid(), 
        
        -- VARCHAR(100) limita o nome do book a 100 caracteres. NOT NULL obriga o preenchimento.
        "name" CHARACTER VARYING(100) NOT NULL, 
        
        -- Carimbo de data automática de quando a carteira foi inserida.
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        
        -- Define a chave primária da tabela no campo ID
        CONSTRAINT "PK_books" PRIMARY KEY ("id"),
        
        -- UNIQUE impede fisicamente que existam duas carteiras com o mesmo nome no banco
        CONSTRAINT "UQ_books_name" UNIQUE ("name")
      )
    `);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "books"`);
  }
}
