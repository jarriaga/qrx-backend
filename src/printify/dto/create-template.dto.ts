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

    @IsNumber()
    @IsNotEmpty()
    blueprintId: number;

    @IsNumber()
    printProviderId: number;

    @IsNumber()
    @IsNotEmpty()
    shopId: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VariantDto)
    variants: VariantDto[];
}
