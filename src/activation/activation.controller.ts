import { Body, Controller, Post } from '@nestjs/common';
import { ActivationService } from './activation.service';
import { ApiTags } from '@nestjs/swagger';
import { ActivationDto } from './dto/activation.dto';

@ApiTags('activation')
@Controller('activation')
export class ActivationController {
    constructor(private readonly activationService: ActivationService) {}

    @Post('/create-user-with-qrcode')
    async createUserWithQrcode(@Body() activationDto: ActivationDto) {
        return this.activationService.createUserWithQrcode(activationDto);
    }

    // @Post('/add-qrcode-to-user')
    // async addQrcodeToUser(@Body() addQrcodeToUserDto: AddQrcodeToUserDto) {
    //     return this.activationService.addQrcodeToUser(addQrcodeToUserDto);
    // }
}
