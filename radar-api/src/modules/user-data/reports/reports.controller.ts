import type { UUID } from 'crypto';
import { Post, Body, Logger, Controller, Req } from '@nestjs/common';
import type { AuthenticatedRequest } from '@/shared/types/authenticated-request.type';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportService } from './reports.service';

/**
 * Controlador para la gestión de reportes.
 * Proporciona un endpoint para generar un reporte.
 */
@Controller('user-data/report')
export class ReportController {
    private readonly logger: Logger;

    constructor(private readonly reportService: ReportService) {
        this.logger = new Logger(this.constructor.name);
        this.logger.log('Initialized');
    }

    /**
     * Permite generar un reporte.
     * @param data La información necesaria para el reporte, usando {@link CreateReportDto}.
     * @returns Una Promesa que resuelve con el objeto {@link Report} creado.
     */
    @Post()
    generateReport(@Req() request: AuthenticatedRequest, @Body() data: CreateReportDto) {
        this.logger.log('Executed generateReport');
        const userId: UUID = request.userId as UUID;
        return this.reportService.generateReport(userId, data);
    }
}
