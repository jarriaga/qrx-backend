import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(private readonly prismaService: PrismaService) {}

    async createUser(email: string, password: string) {
        return this.prismaService.user.create({
            data: {
                email,
                password,
            },
        });
    }

    async createUserwithQrCode(
        email: string,
        password: string,
        qrCodeId: string,
    ) {
        const user = await this.prismaService.user.create({
            data: {
                email,
                password,
                Qrcodes: {
                    connect: {
                        id: qrCodeId,
                    },
                },
            },
        });

        if (!user) {
            this.logger.error('Failed to create user');
            throw new InternalServerErrorException('Failed to create user');
        }

        return user;
    }

    async findUserByEmail(email: string) {
        const user = await this.prismaService.user.findUnique({
            where: {
                email,
            },
        });

        return user;
    }
}
