import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QrType } from '@prisma/client';
import { customAlphabet } from 'nanoid';
import { CreateOrderDto } from 'src/printify/dto/create-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class QrcodeService {
    private readonly logger = new Logger(QrcodeService.name);

    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
    ) {}

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

    async createQrCode(createOrderDto: CreateOrderDto) {
        const alphabet = 'ABCDEFGHJKPMNQRXTVWYZ123456789';
        const nanoid = customAlphabet(alphabet, 9);

        // Calculate total quantity from order items
        const totalQuantity = createOrderDto.line_items.reduce(
            (sum, item) => sum + item.quantity,
            0,
        );

        // Create multiple QR codes
        const qrcodes = await Promise.all(
            Array.from({ length: totalQuantity }).map(async () => {
                return this.prismaService.qrcode.create({
                    data: {
                        orderNumber: createOrderDto.external_id,
                        urlCode: `${this.configService.get('STORE_URL')}/qr/${nanoid()}`,
                        activationCode: nanoid(),
                        type: QrType.TEXT,
                        html: 'Hello World!',
                        purchased: true,
                        activated: false,
                    },
                });
            }),
        );

        return qrcodes;
    }
}
