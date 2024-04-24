import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CredentialsDto } from './dto/credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async signIn(
        credentialsDto: CredentialsDto,
    ): Promise<{ access_token: string }> {
        const { email, password } = credentialsDto;

        const user = await this.prismaService.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            this.logger.error(`User with email ${email} not found`);
            throw new UnauthorizedException('not authorized');
        }

        if (!(await compare(password, user.password))) {
            this.logger.error(`Invalid password for user with email ${email}`);
            throw new UnauthorizedException('User not found');
        }

        this.logger.debug(
            `User with email ${email} successfully authenticated`,
        );

        const payload = { email: user.email, sub: user.id };

        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }
}
