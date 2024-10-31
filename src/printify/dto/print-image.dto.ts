import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class PrintImageDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsNumber()
    height: number;

    @IsNumber()
    width: number;

    @IsNumber()
    x: number;

    @IsNumber()
    y: number;

    @IsNumber()
    scale: number;

    @IsNumber()
    angle: number;

    @IsString()
    @IsNotEmpty()
    src: string;
}
