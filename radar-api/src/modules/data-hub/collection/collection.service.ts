import { Injectable, Logger, Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseFetcher } from './base.fetcher';
import { FETCHERS_ARRAY_TOKEN } from './constants';
import { PrismaService } from '../../../common/services/prisma.service';

@Injectable()
export class CollectionService {
    private readonly logger = new Logger(CollectionService.name);
    private readonly fetchers: BaseFetcher[];

    constructor(
        @Inject(FETCHERS_ARRAY_TOKEN) injectedFetchers: BaseFetcher[],
        private readonly prisma: PrismaService,
    ) {
        this.fetchers = injectedFetchers;
        this.logger.log(`CollectionService initialized with ${this.fetchers.length} fetcher strategies.`);
    }

    public async collectAllDataAndSave(): Promise<void> {
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

        // 3. Inserción Masiva
        if (allRawDataToInsert.length > 0) {
            this.logger.log(`Consolidated a total of ${allRawDataToInsert.length} raw data records.`);
            try {
                const result = await this.prisma.rawData.createMany({
                    data: allRawDataToInsert,
                    skipDuplicates: true,
                });
                this.logger.log(`Successfully saved ${result.count} raw data records using createMany. 🎉`);
            } catch (error) {
                this.logger.error('FATAL: Error during Prisma createMany operation.', error);
                throw error;
            }
        } else {
            this.logger.log('No raw data collected to save.');
        }
    }
}
