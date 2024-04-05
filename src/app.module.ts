import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuserModule } from './quser/quser.module';

@Module({
  imports: [QuserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
