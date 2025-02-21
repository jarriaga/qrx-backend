import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { LineItemDto } from './line-item.dto'; 
import { ShippingAddressDto } from './shipping-address.dto'; 

export class CalculateShippingDto {
    @ValidateNested()
    @Type(() => ShippingAddressDto)
    recipient: ShippingAddressDto;

    @ValidateNested({ each: true })
    @Type(() => LineItemDto)
    items: LineItemDto[];

    address: any;
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
