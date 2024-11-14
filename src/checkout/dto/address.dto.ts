import { IsString, IsNotEmpty, IsEmail, IsPhoneNumber } from 'class-validator';

export class AddressDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    state: string;

    @IsString()
    @IsNotEmpty()
    zipCode: string;

    @IsString()
    @IsNotEmpty()
    country: string;

    @IsString()
    @IsPhoneNumber()
    phone: string;

    @IsString()
    @IsEmail()
    email: string;
}
