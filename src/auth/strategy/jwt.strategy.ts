import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service'; // Assuming you have a PrismaService
import { ConfigService } from '@nestjs/config'; // For accessing environment variables

interface JwtPayload {
    sub: string;
    email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'), // Replace 'JWT_SECRET' with your env variable name
        });

        Logger.log('JwtStrategy initialized', JwtStrategy.name);
    }

    async validate(payload: JwtPayload): Promise<any> {
        const user = await this.prisma.user.findFirst({
            where: { id: payload.sub, isActive: true },
        });

        if (!user) {
            throw new UnauthorizedException('User not found or token invalid');
        }
        delete user.password;
        return user;
    }
}
