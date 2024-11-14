import { Type } from 'class-transformer';
import { AddressDto } from './address.dto';
import {
    IsArray,
    IsIn,
    IsNumber,
    IsObject,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';

export class OrderItemDto {
    @IsObject()
    product: {
        id: string;
        title: string;
    };

    @IsObject()
    variant: {
        id: string;
        price: number;
        title: string;
    };

    @IsNumber()
    @Min(1)
    quantity: number;
}

export class CreateOrderDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @ValidateNested()
    @Type(() => AddressDto)
    address: AddressDto;

    @IsString()
    @IsIn(['standard', 'express'])
    shippingMethod: string;

    @IsNumber()
    subtotal: number;

    @IsNumber()
    shipping: number;

    @IsNumber()
    total: number;
}
