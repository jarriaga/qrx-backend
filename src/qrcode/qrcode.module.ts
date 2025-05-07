import { Module } from '@nestjs/common';
import { QrcodeController } from './qrcode.controller';
import { QrcodeService } from './qrcode.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [QrcodeController],
    providers: [QrcodeService],
    exports: [QrcodeService],
})
export class QrcodeModule {}
