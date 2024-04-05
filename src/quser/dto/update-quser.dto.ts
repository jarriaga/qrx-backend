import { PartialType } from '@nestjs/mapped-types';
import { CreateQuserDto } from './create-quser.dto';

export class UpdateQuserDto extends PartialType(CreateQuserDto) {}
