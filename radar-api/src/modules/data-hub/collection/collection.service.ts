/**
 * Servicio encargado de orquestar la recolección masiva de datos de múltiples fuentes
 * y su almacenamiento en la base de datos como `RawData`.
 * @class CollectionService
 */
import { Injectable, Logger, Inject } from '@nestjs/common';
import { Prisma, RawData } from '@prisma/client';
import { PrismaService } from '@/common/services/prisma.service';
import { FETCHERS_ARRAY_TOKEN } from './constants';
import { BaseFetcher } from './base.fetcher';

@Injectable()
export class CollectionService {
    private readonly logger = new Logger(CollectionService.name);
    private readonly fetchers: BaseFetcher[];

    /**
     * @param injectedFetchers Array de implementaciones de `BaseFetcher` inyectadas.
     * @param prisma Servicio Prisma para interactuar con la base de datos.
     */
    constructor(
        @Inject(FETCHERS_ARRAY_TOKEN) injectedFetchers: BaseFetcher[],
        private readonly prisma: PrismaService,
    ) {
        this.fetchers = injectedFetchers;
        this.logger.log(`CollectionService initialized with ${this.fetchers.length} fetcher strategies.`);
    }

    /**
     * Recopila datos de todas las fuentes configuradas y los guarda masivamente en la base de datos.
     * Los datos se almacenan como `RawData`.
     * @returns Una promesa que resuelve con un array de los `RawData` insertados.
     * @throws {Error} Si ocurre un error fatal durante la inserción masiva en Prisma.
     */
    public async collectAllDataAndSave(): Promise<RawData[]> {
        this.logger.log('--- Starting massive data collection across all fetchers ---');

        const allRawDataToInsert: Prisma.RawDataCreateManyInput[] = [];

        const fetchPromises = this.fetchers.map(async (fetcher) => {
            const source = fetcher.getDataSource();
            const dataType = fetcher.getDatatype();
            const fetcherName = fetcher.constructor.name;

            try {
                const rawItems = await fetcher.fetch();

                if (Array.isArray(rawItems) && rawItems.length > 0) {
                    rawItems.forEach((item) => {
                        if (item !== null) {
                            allRawDataToInsert.push({
                                source,
                                dataType,
                                content: item,
                            });
                        } else {
                            this.logger.warn(`Skipping null item collected by ${fetcherName}.`);
                        }
                    });
                    this.logger.log(`Fetcher ${fetcherName} collected ${rawItems.length} items.`);
                }
            } catch (error) {
                this.logger.error(`Error collecting data from ${fetcherName} (${source}#${dataType}):`, error);
            }
        });

        await Promise.all(fetchPromises);

        if (allRawDataToInsert.length > 0) {
            this.logger.log(`Consolidated a total of ${allRawDataToInsert.length} raw data records.`);
            try {
                const result = await this.prisma.rawData.createManyAndReturn({
                    data: allRawDataToInsert,
                    skipDuplicates: true,
                });

                this.logger.log(`Successfully saved ${result.length} raw data records using createMany. 🎉`);

                return result;
            } catch (error) {
                this.logger.error('FATAL: Error during Prisma createMany operation.', error);
                throw error;
            }
        } else {
            this.logger.log('No raw data collected to save.');
            return [];
        }
    }
}
