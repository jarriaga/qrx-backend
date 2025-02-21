import {
    IsString,
    IsNumber,
    IsArray,
    IsOptional,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ShippingAddressDto } from './shipping-address.dto';
import { LineItemDto } from './line-item.dto';

export class CreateOrderDto {
    @IsOptional()
    @IsString()
    external_id?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LineItemDto)
    line_items: LineItemDto[];

    @ValidateNested()
    @Type(() => ShippingAddressDto)
    shipping_address: ShippingAddressDto; //

    @IsNumber()
    shipping_method: number;
    address_to: any;
}
