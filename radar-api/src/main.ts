import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import supertokens from 'supertokens-node';
import { SuperTokensExceptionFilter } from 'supertokens-nestjs';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
    const logger = new Logger('Main');
    const app = await NestFactory.create(AppModule);

    const globalPrefix = 'api';

    app.setGlobalPrefix(globalPrefix);

    app.enableCors({
        origin: 'http://localhost:5173',
        allowedHeaders: ['content-type', ...supertokens.getAllCORSHeaders()],
        credentials: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        })
    );

    app.useGlobalFilters(
        new HttpExceptionFilter(),
        new SuperTokensExceptionFilter()
    );

    const config = new DocumentBuilder()
        .setTitle('Technologic Radar API')
        .setDescription(
            'API para radar tecnologico, consta de recopilacion, analisis y obtencion de métricas sobre los objetivos tecnológicos'
        )
        .setVersion('1.0')
        .addTag('Radar')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const port = process.env.PORT || 3000;
    await app.listen(port);

    logger.log(
        `Application is running on: http://localhost:${port}/${globalPrefix}`
    );
}

void bootstrap();
