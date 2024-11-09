import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PrintImageDto } from './print-image.dto';

export class PrintPlaceholderDto {
    @IsString()
    position: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PrintImageDto)
    images: PrintImageDto[];
}
