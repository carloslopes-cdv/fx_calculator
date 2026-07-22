import { PartialType } from '@nestjs/swagger';
import { CreateHedgeDto } from './create-hedge.dto';

export class UpdateHedgeDto extends PartialType(CreateHedgeDto) {}
