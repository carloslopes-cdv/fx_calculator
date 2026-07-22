import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { TradeSide } from '../entities/trade.entity';

export class CreateTradeDto {
  @ApiProperty({
    description: 'ID da carteira (Book) associada',
    example: '2a1e5733-cf20-4d43-9761-a2d88f2fc0f8',
  })
  @IsUUID()
  @IsNotEmpty()
  bookId!: string;

  @ApiProperty({
    description: 'Direção da operação',
    enum: ['BUY', 'SELL'],
    example: 'BUY',
  })
  @IsEnum(['BUY', 'SELL'])
  side!: TradeSide;

  @ApiProperty({ description: 'Par de moedas', example: 'USDBRL' })
  @IsString()
  @IsNotEmpty()
  currencyPair!: string;

  @ApiProperty({
    description: 'Volume financeiro da operação',
    example: 1000000,
  })
  @IsNumber()
  @IsPositive()
  volume!: number;

  @ApiProperty({
    description: 'Taxa de câmbio de entrada contratada',
    example: 5.25,
  })
  @IsNumber()
  @IsPositive()
  entryRate!: number;

  @ApiPropertyOptional({
    description:
      'Data da operação (ISO 8601). Se omitido, assume a data/hora atual.',
    example: '2026-07-21T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  tradeDate?: string;
}
