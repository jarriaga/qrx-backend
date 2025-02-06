
import {
    IsArray,
    IsNumber,
    IsNotEmpty,
    ValidateNested,
    IsOptional,
    IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PrintfulFileDto } from './printful-file.dto';

export class LineItemDto {
   
    @IsNumber()
    @IsNotEmpty()
    variant_id: number; //variante de la API de catálogo 

    @IsNumber()
    @IsNotEmpty()
    quantity: number;
   
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PrintfulFileDto)
    files?: PrintfulFileDto[]; //Agregar archivos de impresión
}
