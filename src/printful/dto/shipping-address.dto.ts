import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class ShippingAddressDto {
    @IsString()
    @IsNotEmpty()
    first_name: string;

    @IsString()
    @IsNotEmpty()
    last_name: string;

    @IsString()
    @IsNotEmpty()
    address1: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    zip: string;  

    @IsString()
    @IsNotEmpty()
    country: string;  

    @IsString()
    @IsNotEmpty()
    state_code: string; 

    @IsString()
    @IsOptional()
    state: string;  

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsOptional()
    zipCode?: string;  

    @IsString()
    @IsOptional()
    country_code?: string; 
}
