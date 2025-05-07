import {
    Injectable,
    Logger,
    UnprocessableEntityException,
} from '@nestjs/common';
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
     * @param activationDto
     * @returns
     */
    async createUserWithQrcode(activationDto: ActivationDto) {
        const { qrcodeId, email, password } = activationDto;

        const qrcode = await this.qrCodeService.findQrcodeById(qrcodeId);

        this.logger.debug(qrcode, 'QRCODE Found');

        if (!qrcode) {
            this.logger.error(`QRCODE ${qrcodeId} not found.`);
            throw new UnprocessableEntityException(`qrcode_not_found`);
        }

        if (qrcode.activated) {
            this.logger.error(`QRCODE ${qrcode.id} already activated.`);
            throw new UnprocessableEntityException(`qrcode_already_activated`);
        }

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

        this.logger.debug(user, 'User created');

        await this.qrCodeService.activateQrcode(qrcode.id);

        this.logger.debug(user, 'Activation success');

        return await this.authService.signIn({
            password,
            email,
        });
    }
}
