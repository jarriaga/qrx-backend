import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ValidateActivationCodeDto {
    @ApiProperty()
    @IsString()
    activationCode: string;

    @ApiProperty()
    @IsString()
    shirtId: string;
}
