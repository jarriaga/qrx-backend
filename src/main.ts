import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

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

        // Enable CORS
        app.enableCors();

        // Enable raw body parsing for stripe webhook
        app.use(
            express.json({
                verify: (req: any, res, buf) => {
                    if (req.url.includes('/webhook')) {
                        req.rawBody = buf.toString();
                    }
                },
            }),
        );

        await app.listen(3001);
    } catch (error) {
        console.log('Application failed to start:', error);
        process.exit(1);
    }
}
bootstrap();
