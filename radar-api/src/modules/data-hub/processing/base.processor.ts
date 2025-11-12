import { Logger } from '@nestjs/common';
import { RawData, RadarQuadrant, SurveyItem } from '@prisma/client';
import { PrismaService } from '../../../common/services/prisma.service';

export abstract class BaseProcessor {
    protected readonly logger: Logger;
    abstract readonly quadrant: RadarQuadrant; // Cambiado a public

    constructor(protected readonly prisma: PrismaService) {
        this.logger = new Logger(this.constructor.name);
    }

    /**
     * Procesa los datos brutos de la tabla RawData para extraer entidades
     * y crear o actualizar SurveyItems.
     */
    public abstract process(rawData: RawData): Promise<void>;

    /**
     * Busca un SurveyItem existente por título y cuadrante, o lo crea si no existe.
     * @param title El título del SurveyItem.
     * @param quadrant El cuadrante al que pertenece el SurveyItem.
     * @param summary Un resumen inicial para el SurveyItem (opcional).
     * @returns El SurveyItem existente o recién creado.
     */
    protected async findOrCreateSurveyItem(
        title: string,
        quadrant: RadarQuadrant,
        summary: string = '',
    ): Promise<SurveyItem> {
        let surveyItem = await this.prisma.surveyItem.findFirst({
            where: {
                title,
                radarQuadrant: quadrant,
            },
        });

        if (!surveyItem) {
            surveyItem = await this.prisma.surveyItem.create({
                data: {
                    title,
                    summary,
                    radarQuadrant: quadrant,
                    radarRing: 'UNKNOWN', // Valor por defecto
                    consolidatedMetadata: {},
                    insights: {},
                    externalReferences: [],
                },
            });
            this.logger.log(`Created new SurveyItem: ${surveyItem.title} in quadrant ${quadrant}`);
        }
        return surveyItem;
    }

    /**
     * Actualiza un SurveyItem existente.
     * @param id El ID del SurveyItem.
     * @param data Los datos a actualizar.
     * @returns El SurveyItem actualizado.
     */
    // protected async updateSurveyItem(id: string, data: Partial<SurveyItem>): Promise<SurveyItem> {
    // return this.prisma.surveyItem.update({
    // where: { id },
    // data,
    // });
    // }
}
