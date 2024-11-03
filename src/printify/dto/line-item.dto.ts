import {
    IsString,
    IsNumber,
    IsNotEmpty,
    ValidateNested,
    IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PrintDetailsDto } from './print-details.dto';

export class LineItemDto {
    @IsString()
    @IsNotEmpty()
    product_id: string;

    @IsString()
    @IsNotEmpty()
    variant_id: string;

    @IsNumber()
    quantity: number;

    @IsOptional()
    @ValidateNested()
    @Type(() => PrintDetailsDto)
    print_details?: PrintDetailsDto;
}
