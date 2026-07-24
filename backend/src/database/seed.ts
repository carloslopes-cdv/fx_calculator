import dataSource from './data-source';

interface BookSeedResult {
  id: string;
  name: string;
}

interface TradeSeedResult {
  id: string;
}

async function runSeed() {
  await dataSource.initialize();
  const queryRunner = dataSource.createQueryRunner();

  console.log('Limpando dados antigos...');
  await queryRunner.query('TRUNCATE TABLE hedges, trades, books CASCADE;');

  console.log('Semeando 3 Books...');

  const books = (await queryRunner.query(`
    INSERT INTO books (name) VALUES
      ('Corporate FX Portfolio'),
      ('Energy & Commodities Desk'),
      ('Emerging Markets Desk')
    RETURNING id, name;
  `)) as BookSeedResult[];

  const b1 = books.find((b) => b.name === 'Corporate FX Portfolio')?.id;
  const b2 = books.find((b) => b.name === 'Energy & Commodities Desk')?.id;
  const b3 = books.find((b) => b.name === 'Emerging Markets Desk')?.id;

  if (!b1 || !b2 || !b3) {
    throw new Error('Falha ao recuperar os IDs das carteiras no Seeder.');
  }

  console.log('Semeando Trades...');

  const trades = (await queryRunner.query(`
    INSERT INTO trades (book_id, side, currency_pair, volume, entry_rate, trade_date) VALUES
      ('${b1}', 'BUY',  'USDBRL', 1500000.0000, 5.2500, '2026-06-01 10:00:00'),
      ('${b1}', 'BUY',  'EURBRL', 1000000.0000, 6.1000, '2026-06-10 11:30:00'),
      ('${b1}', 'SELL', 'USDBRL', 1000000.0000, 5.5500, '2026-06-15 14:00:00'),
      ('${b2}', 'BUY',  'USDBRL', 2000000.0000, 5.3500, '2026-06-05 09:15:00'),
      ('${b2}', 'BUY',  'EURBRL', 1200000.0000, 5.9500, '2026-06-18 15:45:00'),
      ('${b2}', 'SELL', 'USDBRL',  800000.0000, 5.4800, '2026-06-22 13:20:00'),
      ('${b3}', 'BUY',  'USDBRL', 3000000.0000, 5.4000, '2026-07-01 08:30:00'),
      ('${b3}', 'BUY',  'EURBRL', 1500000.0000, 6.0500, '2026-07-05 16:00:00'),
      ('${b3}', 'SELL', 'USDBRL', 1000000.0000, 5.6200, '2026-07-12 10:10:00')
    RETURNING id;
  `)) as TradeSeedResult[];

  const t1 = trades[0]?.id;
  const t2 = trades[1]?.id;
  const t3 = trades[2]?.id;
  const t4 = trades[3]?.id;
  const t5 = trades[4]?.id;
  const t6 = trades[5]?.id;
  const t7 = trades[6]?.id;
  const t8 = trades[7]?.id;
  const t9 = trades[8]?.id;

  // CORREÇÃO: Garantindo que o TypeScript saiba que nenhum Trade ID é nulo
  if (!t1 || !t2 || !t3 || !t4 || !t5 || !t6 || !t7 || !t8 || !t9) {
    throw new Error('Falha ao recuperar os IDs dos trades no Seeder.');
  }

  console.log('Semeando Hedges...');
  await queryRunner.query(`
    INSERT INTO hedges (trade_id, volume, entry_rate, hedge_date) VALUES
      ('${t1}', 500000.0000, 5.2800, '2026-06-02 09:00:00'),
      ('${t1}', 500000.0000, 5.3000, '2026-06-03 14:00:00'),
      ('${t1}', 400000.0000, 5.3200, '2026-06-04 11:00:00'),
      ('${t2}', 400000.0000, 6.1200, '2026-06-11 10:00:00'),
      ('${t2}', 450000.0000, 6.1500, '2026-06-12 15:00:00'),
      ('${t3}', 500000.0000, 5.5200, '2026-06-16 10:30:00'),
      ('${t3}', 350000.0000, 5.5000, '2026-06-17 16:15:00'),
      ('${t4}', 600000.0000, 5.3800, '2026-06-06 09:30:00'),
      ('${t4}', 600000.0000, 5.4000, '2026-06-07 13:00:00'),
      ('${t4}', 300000.0000, 5.4100, '2026-06-08 11:20:00'),
      ('${t5}', 400000.0000, 5.9800, '2026-06-19 10:00:00'),
      ('${t5}', 300000.0000, 6.0000, '2026-06-20 14:30:00'),
      ('${t6}', 300000.0000, 5.4600, '2026-06-23 09:10:00'),
      ('${t7}', 500000.0000, 5.4200, '2026-07-02 10:00:00'),
      ('${t7}', 400000.0000, 5.4500, '2026-07-03 15:00:00'),
      ('${t8}', 250000.0000, 6.0800, '2026-07-06 11:00:00'),
      ('${t8}', 150000.0000, 6.1000, '2026-07-07 14:00:00'),
      ('${t9}', 100000.0000, 5.6000, '2026-07-13 10:00:00'),
      ('${t9}', 100000.0000, 5.5800, '2026-07-14 11:30:00');
  `);

  console.log('Base de dados re-semeada com Sucesso!');
  await dataSource.destroy();
}

void runSeed();
