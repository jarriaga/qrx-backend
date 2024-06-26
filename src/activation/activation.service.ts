import {
    Injectable,
    Logger,
    UnprocessableEntityException,
} from '@nestjs/common';
import { ValidateActivationCodeDto } from './dto/validateActivationCode.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActivationDto } from './dto/activation.dto';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { QrcodeService } from 'src/qrcode/qrcode.service';
import { bcrypt } from 'bcrypt';

@Injectable()
export class ActivationService {
    private readonly logger = new Logger(ActivationService.name);

    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly qrCodeService: QrcodeService,
    ) {}
    /**
     *
     * just validate if activation code is valid or not
     * @param dto
     * @returns
     */
    async validateActivationCode(dto: ValidateActivationCodeDto) {
        const { activationCode, shirtId } = dto;
        const qrcode =
            await this.qrCodeService.findQrcodeNotActivatedAndPurchased(
                activationCode,
                shirtId,
            );
        this.logger.debug(qrcode);
        return { message: 'valid' };
    }

    /**
     *
     * activate qrcode and create user
     * @param activationDto
     * @returns
     */
    async activateQrCodeAndCreateQuser(activationDto: ActivationDto) {
        const { activationCode, shirtId, email, password } = activationDto;

        //find qrcode
        const qrcode =
            await this.qrCodeService.findQrcodeNotActivatedAndPurchased(
                activationCode,
                shirtId,
            );

        this.logger.debug(qrcode);

        const userExists = await this.userService.findUserByEmail(email);
        if (userExists) {
            this.logger.error(`User account ${email} already exist.`);
            throw new UnprocessableEntityException(`account_already_taken`);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.userService.createUserwithQrCode(
            email,
            hashedPassword,
            qrcode.id,
        );

        //update qrcode to activated true
        await this.qrCodeService.activateQrcode(qrcode.id);

        this.logger.debug(user);

        return await this.authService.signIn({
            password,
            email,
        });
    }
}
