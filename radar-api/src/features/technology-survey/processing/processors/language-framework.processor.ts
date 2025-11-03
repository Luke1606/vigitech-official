import { Injectable } from '@nestjs/common';
import { BaseProcessor } from '../base.processor';
import { PrismaService } from '../../../../common/services/prisma.service';
import { RawData, RadarQuadrant } from '@prisma/client';

@Injectable()
export class LanguageFrameworkProcessor extends BaseProcessor {
    public readonly quadrant = RadarQuadrant.LANGUAGES_AND_FRAMEWORKS;

    constructor(protected readonly prisma: PrismaService) {
        super(prisma);
    }

    public async process(rawData: RawData): Promise<void> {
        this.logger.log(`Processing RawData ${rawData.id} for quadrant ${this.quadrant}...`);

        if (rawData.dataType === 'Repository' && rawData.source === 'GitHub') {
            const repo = rawData.content as any;

            // Extraer lenguaje principal
            if (repo.language) {
                await this.findOrCreateSurveyItem(
                    repo.language,
                    this.quadrant,
                    `Lenguaje de programación: ${repo.language}`,
                );
                this.logger.log(`Identified and processed language: ${repo.language}`);
            }

            // Aquí se podría añadir lógica más compleja para extraer frameworks
            // Por ejemplo, analizando el `package.json` si estuviera disponible en el RawData
            // o usando un agente de IA para analizar la descripción del repo.
        } else if (rawData.dataType === 'Project' && rawData.source === 'GitLab') {
            const project = rawData.content as any; // Asumir que el contenido es un objeto de proyecto de GitLab

            // Extraer lenguaje principal (GitLab también tiene un campo de lenguaje)
            if (project.programming_language) {
                // O el campo que GitLab use para el lenguaje
                await this.findOrCreateSurveyItem(
                    project.programming_language,
                    this.quadrant,
                    `Lenguaje de programación: ${project.programming_language}`,
                );
                this.logger.log(`Identified and processed language: ${project.programming_language}`);
            }
        }
        // Otros dataType y source pueden ser procesados aquí
    }
}
