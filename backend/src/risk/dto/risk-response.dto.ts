import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RiskHealthStatus } from '../enums/risk-status.enum';

export class TradeRiskDetailDto {
  @ApiProperty({
    description: 'UUID do Trade',
    example: 'e3b8a101-8178-438d-8a21-94943714cb2f',
  })
  tradeId!: string;

  @ApiProperty({
    description: 'Direção da operação',
    enum: ['BUY', 'SELL'],
    example: 'BUY',
  })
  side!: 'BUY' | 'SELL';

  @ApiProperty({
    description: 'Par de moedas',
    example: 'USDBRL',
  })
  currencyPair!: string;

  @ApiProperty({
    description: 'Volume total do Trade',
    example: 1000000,
  })
  volume!: number;

  @ApiProperty({
    description: 'Volume protegido por Hedges',
    example: 500000,
  })
  hedgedVolume!: number;

  @ApiProperty({
    description: 'Volume desprotegido (exposto)',
    example: 500000,
  })
  unhedgedVolume!: number;

  @ApiProperty({
    description: 'Percentual de cobertura individual (%)',
    example: 50,
  })
  hedgeRatioPercent!: number;

  @ApiProperty({
    description: 'Taxa de câmbio contratada',
    example: 5.25,
  })
  entryRate!: number;

  @ApiProperty({
    description: 'Cotação de mercado atual utilizada no cálculo',
    example: 5.4,
  })
  marketRate!: number;

  @ApiProperty({
    description: 'Lucro/Prejuízo Não Realizado (Unrealized PnL)',
    example: 150000,
  })
  unrealizedPnl!: number;
}

export class RiskSuggestedActionDto {
  @ApiProperty({
    description: 'Ação Recomendada',
    enum: ['BUY', 'SELL', 'HOLD'],
    example: 'BUY',
  })
  action!: 'BUY' | 'SELL' | 'HOLD';

  @ApiProperty({
    description: 'Moeda alvo da ação',
    example: 'USD',
  })
  targetCurrency!: string;

  @ApiProperty({
    description: 'Volume financeiro sugerido',
    example: 100000,
  })
  amount!: number;
}

export class RiskReportResponseDto {
  @ApiProperty({
    description: 'UUID do Book analisado',
    example: '2a1e5733-cf20-4d43-9761-a2d88f2fc0f8',
  })
  bookId!: string;

  @ApiProperty({
    description: 'Nome da carteira',
    example: 'Corporate FX Portfolio',
  })
  bookName!: string;

  @ApiProperty({
    description: 'Volume total exposto da carteira',
    example: 1000000,
  })
  totalExposedVolume!: number;

  @ApiProperty({
    description: 'Volume total protegido da carteira',
    example: 700000,
  })
  totalHedgedVolume!: number;

  @ApiProperty({
    description: 'Percentual geral de cobertura do Book (%)',
    example: 70,
  })
  overallHedgeRatioPercent!: number;

  @ApiProperty({
    description: 'Exposição Total da Carteira',
    example: 400000,
  })
  netExposure!: number;

  @ApiProperty({
    description: 'Classificação da saúde financeira do Book',
    enum: RiskHealthStatus,
    example: RiskHealthStatus.Warning,
  })
  healthStatus!: RiskHealthStatus;

  @ApiPropertyOptional({
    description:
      'Objeto com a ação corretiva sugerida pelo Motor de Risco (estruturado)',
    type: RiskSuggestedActionDto,
  })
  suggestedAction?: RiskSuggestedActionDto;

  @ApiProperty({
    description: 'PnL consolidado não realizado da carteira',
    example: 250000,
  })
  totalUnrealizedPnl!: number;

  @ApiProperty({
    description: 'Detalhamento de risco operação por operação',
    type: [TradeRiskDetailDto],
  })
  tradesDetails!: TradeRiskDetailDto[];
}
