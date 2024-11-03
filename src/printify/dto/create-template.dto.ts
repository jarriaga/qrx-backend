import { Type } from 'class-transformer';
import {
    IsString,
    IsNumber,
    IsArray,
    IsNotEmpty,
    ValidateNested,
} from 'class-validator';
import { VariantDto } from './variant.dto';

export class CreateTemplateDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    blueprint_id: number;

    @IsNotEmpty()
    print_provider_id: number;

    @IsNotEmpty()
    shop_id: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VariantDto)
    variants: VariantDto[];
}
