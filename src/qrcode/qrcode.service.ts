import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export interface QRCodeDetails {
    isActivated: boolean;
    type: string | null;
    html: string | null;
    data: string | null;
}

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
                urlCode: activationCode,
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

    async getQRCodeDetails(qrId: string): Promise<QRCodeDetails> {
        const details = await this.prismaService.qrcode.findUnique({
            where: { id: qrId },
        });

        if (!details) {
            this.logger.error(`QRCODE ${qrId} not found.`);
            throw new NotFoundException(`QRCODE ${qrId} not found.`);
        }

        return {
            isActivated: details.activated,
            type: details.type,
            html: details.html,
            data: details.data,
        };
    }

    async findQrcodeById(qrId: string) {
        return this.prismaService.qrcode.findUnique({
            where: { id: qrId },
        });
    }
}
