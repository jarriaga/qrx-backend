import { Type } from 'class-transformer';
import { ValidateNested, IsArray, IsNotEmpty } from 'class-validator';
import { LineItemDto } from './line-item.dto'; 
import { ShippingAddressDto } from './shipping-address.dto'; 

export class CalculateShippingDto {
    @ValidateNested()
    @Type(() => ShippingAddressDto)
    @IsNotEmpty()
    recipient: ShippingAddressDto;

    @ValidateNested({ each: true })
    @Type(() => LineItemDto)
    @IsArray()
    @IsNotEmpty()
    items: LineItemDto[];
}

 
//import { Type } from 'class-transformer';
// import { ValidateNested } from 'class-validator';
// import { LineItemDto } from './line-item.dto';
// import { ShippingAddressDto } from './shipping-address.dto'; 

// export class CalculateShippingDto {
//     @ValidateNested()
//     @Type(() => ShippingAddressDto)
//     address_to: ShippingAddressDto;
//     @ValidateNested({ each: true })
//     @Type(() => LineItemDto)
//     line_items: LineItemDto[];
// }
