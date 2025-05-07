import { Controller, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QrcodeService, QRCodeDetails } from './qrcode.service';
@ApiTags('QRcode')
@Controller('qr')
export class QrcodeController {
    constructor(private readonly qrcodeService: QrcodeService) {}

    @Post('/:qrId')
    async getQRCodeDetails(@Request() req): Promise<QRCodeDetails> {
        return this.qrcodeService.getQRCodeDetails(req.params.qrId);
    }
}
