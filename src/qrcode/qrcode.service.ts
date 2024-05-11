import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class QrcodeService {
    private readonly logger = new Logger(QrcodeService.name);

    constructor(private readonly prismaService: PrismaService) {}

    async activateQrcode(qrCodeId: string) {
        return this.prismaService.qrcode.update({
            where: {
                id: qrCodeId,
            },
            data: {
                activated: true,
            },
        });
    }

    async findQrcodeNotActivatedAndPurchased(
        activationCode: string,
        shirtId: string,
    ) {
        const qrcode = await this.prismaService.qrcode.findFirst({
            where: {
                activationCode,
                shirtId,
                purchased: true,
                activated: false,
            },
            include: {
                user: true,
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

        return qrcode;
    }
}
