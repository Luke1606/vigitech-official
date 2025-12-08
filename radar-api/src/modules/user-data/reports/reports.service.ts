import { UUID } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { Report } from '@prisma/client';
import { PrismaService } from '@/common/services/prisma.service';
import { CreateReportDto } from '../reports/dto/create-report.dto';

/**
 * Servicio para la gestión de reportes.
 * Proporciona método para que un usuario genere un reporte
 */
@Injectable()
export class ReportService {
    private readonly logger: Logger;

    constructor(private readonly prisma: PrismaService) {
        this.logger = new Logger(this.constructor.name);
        this.logger.log('Initialized');
    }

    /**
     * Permite generar un reporte.
     * @param creatorId El UUID del usuario.
     * @param data La información necesaria para el reporte, usando {@link CreateReportDto} .
     * @returns Una Promesa que resuelve con el objeto {@link Report} creado.
     */
    async generateReport(creatorId: UUID, data: CreateReportDto): Promise<Report> {
        this.logger.log('Executed generateReport');

        return this.prisma.report.create({
            data: {
                ...data,
                creator: {
                    connect: {
                        id: creatorId,
                    },
                },
            },
        });
    }
}
