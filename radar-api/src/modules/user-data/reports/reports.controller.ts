import type { UUID } from 'crypto';
import { Post, Body, Logger, Controller, Req } from '@nestjs/common';
import { Report } from '@prisma/client';
import type { AuthenticatedRequest } from '@/shared/types/authenticated-request.type';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportService } from './reports.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('user-data')
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
    @ApiOperation({ summary: 'Genera un reporte para el usuario a partir de los ítems suscritos.' })
    @ApiResponse({ status: 201, description: 'Reporte generado correctamente.' })
    @ApiResponse({ status: 400, description: 'Datos de reporte inválidos o rango de fechas incorrecto.' })
    @ApiResponse({ status: 403, description: 'El usuario no tiene acceso a alguno de los ítems indicados.' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
    async generateReport(@Body() data: CreateReportDto, @Req() request: AuthenticatedRequest): Promise<Report> {
        this.logger.log('Executed generateReport');
        const userId: UUID = request.userId as UUID;
        return await this.reportService.generateReport(userId, data);
    }
}
