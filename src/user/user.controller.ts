import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/me')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    async findUserByEmail(@Request() req) {
        /** req.user  email ,  sub "id" */
        console.log(req.user);
        return this.userService.findUserByEmail('test');
    }
}
