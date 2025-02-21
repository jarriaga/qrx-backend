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
    productId: string;

    @IsNumber()
    quantity: number;

    @IsString()
    @IsNotEmpty()
    variant_id: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => PrintDetailsDto)
    print_details?: PrintDetailsDto;
}
