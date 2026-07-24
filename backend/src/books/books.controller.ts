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
import { BooksService, BookSummary } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova carteira (Book)' })
  @ApiResponse({
    status: 201,
    description: 'Carteira criada com sucesso.',
    type: Book,
  })
  async create(@Body() createBookDto: CreateBookDto): Promise<Book> {
    return this.booksService.create(createBookDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as carteiras' })
  @ApiResponse({
    status: 200,
    description: 'Lista de carteiras retornada com sucesso.',
    type: [Book],
  })
  async findAll(): Promise<BookSummary[]> {
    return this.booksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar carteira por ID' })
  @ApiParam({ name: 'id', description: 'UUID da carteira' })
  @ApiResponse({ status: 200, description: 'Carteira encontrada.', type: Book })
  @ApiResponse({ status: 404, description: 'Carteira não encontrada.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Book> {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados de uma carteira' })
  @ApiParam({ name: 'id', description: 'UUID da carteira' })
  @ApiResponse({
    status: 200,
    description: 'Carteira atualizada com sucesso.',
    type: Book,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar uma carteira' })
  @ApiParam({ name: 'id', description: 'UUID da carteira' })
  @ApiResponse({ status: 200, description: 'Carteira removida com sucesso.' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.booksService.remove(id);
  }
}
