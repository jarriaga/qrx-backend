import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ValidateActivationCodeDto } from './dto/validateActivationCode.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { iif } from 'rxjs';

@Injectable()
export class ActivationService {
    logger = new Logger('ActivationService');
    constructor(private readonly prismaService: PrismaService) {}

    async validateActivationCode(dto: ValidateActivationCodeDto) {
        const { activationCode, shirtId } = dto;
        const qrcode = await this.prismaService.qrcode.findFirst({
            where: {
                activationCode,
                shirtId: shirtId,
                purchased: true,
            },
        });

        if (!qrcode) {
            this.logger.error(
                `tshirt ${shirtId} with activation code ${activationCode} not found or not purchased yet.`,
            );
            throw new NotFoundException(
                `tshirt ${shirtId} with activation code ${activationCode} not found or not purchased yet.`,
            );
        }

        this.logger.debug(qrcode);

        return `Activation code ${activationCode} is valid for tshirt ${shirtId}`;
    }
}
