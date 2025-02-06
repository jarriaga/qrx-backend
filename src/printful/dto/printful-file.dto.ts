//print-details
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class PrintfulFileDto {
    @IsString()
    @IsNotEmpty()
    url: string;  

    @IsNumber()
    @IsNotEmpty()
    position: number;  
}
