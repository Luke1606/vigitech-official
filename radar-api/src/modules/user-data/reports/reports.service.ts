import { UUID } from 'crypto';
import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
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
     * Permite generar un reporte asociado a items permitidos para el user (suscritos no ocultos).
     * @param creatorId El UUID del usuario.
     * @param data La información necesaria para el reporte, usando {@link CreateReportDto} .
     * @returns Una Promesa que resuelve con el objeto {@link Report} creado.
     */
    async generateReport(creatorId: UUID, data: CreateReportDto): Promise<Report> {
        this.logger.log('Executed generateReport');

        const { itemIds, startDate, endDate } = data;
        if (endDate < startDate)
            throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');

        const allowedItems = await this.prisma.item.findMany({
            where: {
                id: { in: itemIds },
                hiddenBy: { none: { userId: creatorId } },
                subscribedBy: { some: { userId: creatorId } },
                OR: [{ insertedById: null }, { insertedById: creatorId }],
            },
        });

        const haveSameLength = allowedItems.length === data.itemIds.length;

        const haveSameEntries = data.itemIds.every((id) => allowedItems.some((item) => item.id === id));

        if (haveSameLength && haveSameEntries) {
            return await this.prisma.report.create({
                data: {
                    items: {
                        connect: allowedItems.map((item) => ({ id: item.id })),
                    },
                    startDate,
                    endDate,
                    creatorId,
                },
                include: {
                    items: true,
                },
            });
        } else {
            throw new ForbiddenException(
                'En la lista de items a reportar se encontraron items no disponibles para el usuario.',
            );
        }
    }
}
