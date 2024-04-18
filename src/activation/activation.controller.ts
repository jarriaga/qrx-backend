import { Body, Controller, Post } from '@nestjs/common';
import { ActivationService } from './activation.service';

@Controller('activation')
export class ActivationController {

    constructor(private readonly activationService: ActivationService) { }

    @Post("/validate")
    async validateActivationCode(@Body() { activationCode, tshirtId }: { activationCode: string, tshirtId: string }) {
        return this.activationService.validateActivationCode(activationCode, tshirtId);
    }

}
