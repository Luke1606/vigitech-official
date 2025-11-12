import { Injectable } from '@nestjs/common';
import { BaseProcessor } from '../base.processor';
import { PrismaService } from '../../../../common/services/prisma.service';
import { RawData, RadarQuadrant } from '@prisma/client';

@Injectable()
export class BiConceptProcessor extends BaseProcessor {
    public readonly quadrant = RadarQuadrant.BUSSINESS_INTEL;

    constructor(protected readonly prisma: PrismaService) {
        super(prisma);
    }

    public async process(rawData: RawData): Promise<void> {
        this.logger.log(`Processing RawData ${rawData.id} for quadrant ${this.quadrant}...`);

        if (rawData.dataType === 'Dataset' && rawData.source === 'Kaggle') {
            const dataset = rawData.content as any; // Asumir que el contenido es un objeto de dataset de Kaggle

            // Extraer el título del dataset como un concepto de BI
            if (dataset.title) {
                await this.findOrCreateSurveyItem(
                    dataset.title,
                    this.quadrant,
                    `Concepto de Business Intelligence: ${dataset.title}`,
                );
                this.logger.log(`Identified and processed BI concept: ${dataset.title}`);
            }

            // Aquí se podría añadir lógica más compleja para extraer conceptos de BI
            // Por ejemplo, analizando la descripción del dataset, las etiquetas,
            // o los notebooks asociados para identificar tendencias más profundas.
        }
        // Otros dataType y source pueden ser procesados aquí
    }
}
