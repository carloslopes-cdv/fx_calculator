import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TradesService } from './trades.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { Trade } from './entities/trade.entity';

@ApiTags('Trades')
@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova operação financeira (Trade)' })
  @ApiResponse({
    status: 201,
    description: 'Trade criado com sucesso.',
    type: Trade,
  })
  async create(@Body() createTradeDto: CreateTradeDto): Promise<Trade> {
    return this.tradesService.create(createTradeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as operações' })
  @ApiResponse({
    status: 200,
    description: 'Lista de trades retornada com sucesso.',
    type: [Trade],
  })
  async findAll(): Promise<Trade[]> {
    return this.tradesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar trade por ID' })
  @ApiParam({ name: 'id', description: 'UUID do trade' })
  @ApiResponse({ status: 200, description: 'Trade encontrado.', type: Trade })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Trade> {
    return this.tradesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um trade com validação de limite' })
  @ApiParam({ name: 'id', description: 'UUID do trade' })
  @ApiResponse({
    status: 200,
    description: 'Trade atualizado com sucesso.',
    type: Trade,
  })
  @ApiResponse({
    status: 400,
    description: 'Volume reduzido viola o total de hedges ativos.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTradeDto: UpdateTradeDto,
  ): Promise<Trade> {
    return this.tradesService.update(id, updateTradeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar um trade e seus hedges associados' })
  @ApiParam({ name: 'id', description: 'UUID do trade' })
  @ApiResponse({ status: 200, description: 'Trade removido com sucesso.' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.tradesService.remove(id);
  }
}
