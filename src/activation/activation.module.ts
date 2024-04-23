import { Module } from '@nestjs/common';
import { ActivationController } from './activation.controller';
import { ActivationService } from './activation.service';
import { AuthService } from 'src/auth/auth.service';
import { QrcodeService } from 'src/qrcode/qrcode.service';
import { UserService } from 'src/user/user.service';

@Module({
    controllers: [ActivationController],
    providers: [ActivationService, AuthService, QrcodeService, UserService],
})
export class ActivationModule {}
