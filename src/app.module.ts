import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuserModule } from './quser/quser.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ActivationModule } from './activation/activation.module';
@Module({
  imports: [
    QuserModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ActivationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
