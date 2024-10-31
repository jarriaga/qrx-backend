import { Type } from 'class-transformer';
import {
    IsNumber,
    IsBoolean,
    IsOptional,
    ValidateNested,
    IsArray,
} from 'class-validator';

import { IsString, IsNotEmpty } from 'class-validator';

export class VariantOptionDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    value: string;
}

export class VariantDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsNumber()
    price: number;

    @IsBoolean()
    @IsOptional()
    is_enabled?: boolean = true;

    @IsString()
    @IsOptional()
    sku?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VariantOptionDto)
    options: VariantOptionDto[];
}
