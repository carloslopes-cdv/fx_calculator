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
import { HedgesService } from './hedges.service';
import { CreateHedgeDto } from './dto/create-hedge.dto';
import { UpdateHedgeDto } from './dto/update-hedge.dto';
import { Hedge } from './entities/hedge.entity';

@ApiTags('Hedges')
@Controller('hedges')
export class HedgesController {
  constructor(private readonly hedgesService: HedgesService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar uma nova proteção (Hedge) com validação Anti-Overhedging',
  })
  @ApiResponse({
    status: 201,
    description: 'Hedge criado com sucesso.',
    type: Hedge,
  })
  @ApiResponse({ status: 400, description: 'Violação de Anti-Overhedging.' })
  async create(@Body() createHedgeDto: CreateHedgeDto): Promise<Hedge> {
    const hedge: Hedge = await this.hedgesService.create(createHedgeDto);
    return hedge;
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as proteções (Hedges)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de hedges retornada.',
    type: [Hedge],
  })
  async findAll(): Promise<Hedge[]> {
    const hedges: Hedge[] = await this.hedgesService.findAll();
    return hedges;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar hedge por ID' })
  @ApiParam({ name: 'id', description: 'UUID do hedge' })
  @ApiResponse({ status: 200, description: 'Hedge encontrado.', type: Hedge })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Hedge> {
    const hedge: Hedge = await this.hedgesService.findOne(id);
    return hedge;
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar um hedge com revalidação de Anti-Overhedging',
  })
  @ApiParam({ name: 'id', description: 'UUID do hedge' })
  @ApiResponse({ status: 200, description: 'Hedge atualizado.', type: Hedge })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateHedgeDto: UpdateHedgeDto,
  ): Promise<Hedge> {
    const hedge: Hedge = await this.hedgesService.update(id, updateHedgeDto);
    return hedge;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar um hedge' })
  @ApiParam({ name: 'id', description: 'UUID do hedge' })
  @ApiResponse({ status: 200, description: 'Hedge removido.' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.hedgesService.remove(id);
  }
}
