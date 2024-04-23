import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class CredentialsDto {
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    @Transform(({ value }) => value.toLowerCase())
    email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    password: string;
}
