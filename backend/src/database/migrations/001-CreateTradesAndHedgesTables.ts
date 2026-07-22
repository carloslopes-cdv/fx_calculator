import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTradesAndHedgesTables1710000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "trades" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "book_id" UUID NOT NULL, -- ID da carteira à qual o trade pertence
        "side" VARCHAR(4) NOT NULL, -- Sentido: 'BUY' ou 'SELL'
        "currency_pair" VARCHAR(6) NOT NULL, -- Par de moedas (ex: 'USDBRL')
        "volume" NUMERIC(18,4) NOT NULL, -- Volume financeiro operado
        "entry_rate" NUMERIC(12,6) NOT NULL, -- Taxa de câmbio de entrada contratada
        "trade_date" TIMESTAMP NOT NULL, -- Data em que a operação financeira ocorreu
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        
        -- Restrições de Integridade (Constraints) do Trade:
        CONSTRAINT "PK_trades" PRIMARY KEY ("id"),
        
        -- FOREIGN KEY: Garante que o book_id exista de verdade na tabela books.
        -- ON DELETE RESTRICT impede que alguém apague um Book se existirem trades vinculados a ele.
        CONSTRAINT "FK_trades_books" FOREIGN KEY ("book_id") REFERENCES "books" ("id") ON DELETE RESTRICT,
        
        -- CHECK constraints validam as regras de negócio direto no motor do banco:
        CONSTRAINT "CHK_trades_side" CHECK ("side" IN ('BUY', 'SELL')), -- Bloqueia qualquer texto diferente de BUY ou SELL
        CONSTRAINT "CHK_trades_volume" CHECK ("volume" > 0) -- Impede que o volume seja zero ou negativo
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "hedges" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "trade_id" UUID NOT NULL, -- ID do trade original protegido por este hedge
        "volume" NUMERIC(18,4) NOT NULL, -- Volume financeiro alocado para proteção
        "entry_rate" NUMERIC(12,6) NOT NULL, -- Taxa travada no hedge
        "hedge_date" TIMESTAMP NOT NULL, -- Data de contratação da proteção
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        
        -- Restrições de Integridade (Constraints) do Hedge:
        CONSTRAINT "PK_hedges" PRIMARY KEY ("id"),
        
        -- FOREIGN KEY: Vincula o hedge ao trade original.
        -- ON DELETE CASCADE é uma decisão de negócio: se o trade original for cancelado/deletado,
        -- os hedges que dependiam dele perdem o sentido e são deletados automaticamente em cascata.
        CONSTRAINT "FK_hedges_trades" FOREIGN KEY ("trade_id") REFERENCES "trades" ("id") ON DELETE CASCADE,
        
        CONSTRAINT "CHK_hedges_volume" CHECK ("volume" > 0) -- Impede hedge com volume zerado ou negativo
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "hedges"`);
    await queryRunner.query(`DROP TABLE "trades"`);
  }
}
