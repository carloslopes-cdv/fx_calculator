import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBookDto {
  @ApiProperty({
    description: 'Nome da carteira de tesouraria',
    example: 'Corporate FX Portfolio',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;
}
