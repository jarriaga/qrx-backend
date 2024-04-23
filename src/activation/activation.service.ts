import {
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { ValidateActivationCodeDto } from './dto/validateActivationCode.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActivationDto } from './dto/activation.dto';

@Injectable()
export class ActivationService {
    private readonly logger = new Logger(ActivationService.name);

    constructor(private readonly prismaService: PrismaService) { }

    async validateActivationCode(dto: ValidateActivationCodeDto) {
        const { activationCode, shirtId } = dto;
        const qrcode = await this.prismaService.qrcode.findFirst({
            where: {
                activationCode,
                shirtId: shirtId,
                purchased: true,
            },
        });

        this.logger.debug(qrcode);

        return { message: 'valid' };
    }

    async activateQrCodeAndCreateQuser(activationDto: ActivationDto) {
        const { activationCode, shirtId, email, password } = activationDto;
        const qrcode = await this.prismaService.qrcode.findFirst({
            where: {
                activationCode,
                shirtId,
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

        const user = await this.prismaService.user.create({
            data: {
                email,
                password,
                Qrcodes: {
                    connect: {
                        id: qrcode.id,
                    },
                },
            },
        });

        if (!user) {
            this.logger.error('Failed to create user');
            throw new InternalServerErrorException('Failed to create user');
        }

        this.logger.debug(user);

        return { message: 'created' };
    }
}
