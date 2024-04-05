import { Module } from '@nestjs/common';
import { QuserService } from './quser.service';
import { QuserController } from './quser.controller';

@Module({
  controllers: [QuserController],
  providers: [QuserService],
})
export class QuserModule {}
