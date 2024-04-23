import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CredentialsDto } from './dto/credentials.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post('/login')
    async login(@Body() credentialsDto: CredentialsDto) {
        return this.authService.signIn(credentialsDto);
    }

}
