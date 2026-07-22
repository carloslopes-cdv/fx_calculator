import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
} from 'class-validator';

export class CreateHedgeDto {
  @ApiProperty({
    description: 'ID da operação (Trade) a ser protegida',
    example: 'e3b8a101-8178-438d-8a21-94943714cb2f',
  })
  @IsUUID()
  @IsNotEmpty()
  tradeId!: string;

  @ApiProperty({
    description: 'Volume da proteção contratada',
    example: 500000,
  })
  @IsNumber()
  @IsPositive()
  volume!: number;

  @ApiProperty({
    description: 'Taxa de câmbio travada para o Hedge',
    example: 5.28,
  })
  @IsNumber()
  @IsPositive()
  entryRate!: number;

  @ApiPropertyOptional({
    description:
      'Data do hedge (ISO 8601). Se omitido, assume a data/hora atual.',
    example: '2026-07-21T10:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  hedgeDate?: string;
}
