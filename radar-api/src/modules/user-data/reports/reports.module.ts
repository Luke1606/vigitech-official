import { Module } from '@nestjs/common';
import { ReportService } from './reports.service';
import { ReportController } from './reports.controller';

/**
 * Módulo para la gestión de reportes.
 * Proporciona los controladores y servicios para generar reportes
 * @module ReportsModule
 */
@Module({
    controllers: [ReportController],
    providers: [ReportService],
    exports: [ReportService],
})
export class ReportsModule {}
