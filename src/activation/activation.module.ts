import { Module } from '@nestjs/common';
import { ActivationController } from './activation.controller';
import { ActivationService } from './activation.service';

@Module({
  controllers: [ActivationController],
  providers: [ActivationService]
})
export class ActivationModule {}
