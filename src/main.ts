import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    try {
        const app = await NestFactory.create(AppModule);
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

        const config = new DocumentBuilder()
            .addBearerAuth()
            .setTitle('API test')
            .setDescription('API test')
            .setVersion('1.0')
            .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api', app, document);

        await app.listen(3001);
    } catch (error) {
        console.log('Application failed to start:', error);
        process.exit(1);
    }
}
bootstrap();
