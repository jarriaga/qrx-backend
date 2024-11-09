import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PrintPlaceholderDto } from './print-placeholder.dto';

export class PrintDetailsDto {
    @IsArray()
    variant_ids: number[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PrintPlaceholderDto)
    placeholders: PrintPlaceholderDto[];
}
