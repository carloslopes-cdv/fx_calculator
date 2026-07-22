import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { RiskService } from './risk.service';
import { RiskReportResponseDto } from './dto/risk-response.dto';

@ApiTags('Risk')
@Controller('risk')
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  @Get('books/:bookId')
  @ApiOperation({
    summary:
      'Gerar Relatório de Risco, Alertas de Saúde e Mark-to-Market (MtM) em tempo real',
  })
  @ApiParam({
    name: 'bookId',
    description: 'UUID da carteira para análise de risco',
  })
  @ApiQuery({
    name: 'usdbrl',
    required: false,
    description: 'Simulação manual da cotação USDBRL',
  })
  @ApiQuery({
    name: 'eurbrl',
    required: false,
    description: 'Simulação manual da cotação EURBRL',
  })
  @ApiResponse({
    status: 200,
    description: 'Relatório consolidado de risco gerado com sucesso.',
    type: RiskReportResponseDto, // <-- Agora o Swagger expõe a estrutura completa no OpenAPI JSON!
  })
  async getBookRiskReport(
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @Query('usdbrl') usdbrl?: string,
    @Query('eurbrl') eurbrl?: string,
  ): Promise<RiskReportResponseDto> {
    const marketRates: Record<string, number> = {};

    if (usdbrl && !isNaN(Number(usdbrl))) {
      marketRates['USDBRL'] = Number(usdbrl);
    }
    if (eurbrl && !isNaN(Number(eurbrl))) {
      marketRates['EURBRL'] = Number(eurbrl);
    }

    return this.riskService.getBookRiskReport(bookId, marketRates);
  }
}
