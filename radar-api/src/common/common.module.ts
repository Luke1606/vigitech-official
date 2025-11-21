/**
 * Módulo Global para servicios y componentes comunes.
 * Proporciona `HttpExceptionFilter` para un manejo consistente de errores
 * y `PrismaService` para la interacción con la base de datos a toda la aplicación.
 * @module CommonModule
 */
import { Global, Module } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { PrismaService } from './services/prisma.service';

@Global()
@Module({
    providers: [HttpExceptionFilter, PrismaService],
    exports: [HttpExceptionFilter, PrismaService],
})
export class CommonModule {}
