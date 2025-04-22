import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PrintifyController } from './printify.controller';
import { PrintifyService } from './printify.service';

@Module({
    imports: [HttpModule, ConfigModule],
    controllers: [PrintifyController],
    providers: [PrintifyService],
    exports: [PrintifyService],
})
export class PrintifyModule {}
