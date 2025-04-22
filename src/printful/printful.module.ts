import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PrintfulController } from './printful.controller';
import { PrintfulService } from './printful.service';

@Module({
    imports: [HttpModule, ConfigModule],
    controllers: [PrintfulController],
    providers: [PrintfulService],
    exports: [PrintfulService],
})
export class PrintfulModule {}
