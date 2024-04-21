import { Body, Controller, Post } from '@nestjs/common';
import { ActivationService } from './activation.service';
import { ApiTags } from '@nestjs/swagger';
import { ValidateActivationCodeDto } from './dto/validateActivationCode.dto';
import { ActivationDto } from './dto/activation.dto';

@ApiTags('activation')
@Controller('activation')
export class ActivationController {
    constructor(private readonly activationService: ActivationService) {}

    @Post('/validate')
    async validateActivationCode(
        @Body() validateActivationCodeDto: ValidateActivationCodeDto,
    ) {
        return this.activationService.validateActivationCode(
            validateActivationCodeDto,
        );
    }

    @Post('/create-user')
    async activateQrCodeAndCreateQuser(@Body() activationDto: ActivationDto) {
        return this.activationService.activateQrCodeAndCreateQuser(
            activationDto,
        );
    }
}
