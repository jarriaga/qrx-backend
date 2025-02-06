//API de tarifas de envío
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { LineItemDto } from '../../printful/dto/line-item.dto'; 
import { ShippingAddressDto } from '../../printful/dto/shipping-address.dto'; 

export class CalculateShippingDto {
    @ValidateNested()
    @Type(() => ShippingAddressDto)
    recipient: ShippingAddressDto;
    @ValidateNested({ each: true })
    @Type(() => LineItemDto)
    items: LineItemDto[];
}
