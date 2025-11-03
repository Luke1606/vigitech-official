import { Logger } from '@nestjs/common';
import { RadarQuadrant, RawData } from '@prisma/client';
import { PrismaService } from '../../../common/services/prisma.service';
import { ICollector } from './collection.interfaces';

export abstract class BaseCollector implements ICollector {
    protected readonly logger: Logger;
    abstract readonly quadrant: RadarQuadrant;

    constructor(protected readonly prisma: PrismaService) {
        this.logger = new Logger(this.constructor.name);
    }

    /**
     * Recopila datos brutos de la fuente externa y los almacena en la tabla RawData.
     */
    public abstract collect(): Promise<void>;

    /**
     * Guarda un nuevo registro de datos brutos en la base de datos.
     * @param source El nombre de la fuente de datos (ej. "GitHub").
     * @param dataType El tipo de dato recopilado (ej. "Repository", "Dataset").
     * @param content El contenido JSON bruto de la respuesta de la API.
     */
    protected async saveRawData(
        source: string,
        dataType: string,
        content: object, // Changed to object to match current file state
    ): Promise<RawData> {
        this.logger.log(`Saving raw data from ${source} (${dataType})...`);
        return await this.prisma.rawData.create({
            data: {
                source,
                dataType,
                content,
            },
        });
    }
}
