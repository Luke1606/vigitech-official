import type { UUID } from 'crypto';
import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import {
    PrismaClient,
    // RadarQuadrant,
    // RadarRing,
    SubscribedItemAnalysis,
    SurveyItem,
} from '@prisma/client';

import { CreateSurveyItemDto } from './dto/create-survey-item.dto';
import { UpdateSurveyItemDto } from './dto/update-survey-item.dto';
import {
    CrossRefAPIFetcher,
    LensAPIFetcher,
    OpenAlexAPIFetcher,
    UnpaywallAPIFetcher,
} from './external-actors/api-fetchers';

import { CrossRefResultDto } from './dto/api-results/cross-ref-result.dto';
import { LensResultDto } from './dto/api-results/lens-result.dto';
import { OpenAlexResultDto } from './dto/api-results/open-alex-result.dto';
import { UnpaywallResultDto } from './dto/api-results/unpaywall-result.dto';
import { GeneralSearchResultDto } from './dto/general-search-result.dto';
import { MetricsDto } from './dto/analysis-metrics.dto';
import { SurveyItemBasicData } from './types/survey-item-basic-data.type';
import { SurveyItemWithAnalysis } from './types/survey-item-with-analysis.type';

@Injectable()
export class SurveyItemsService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    private readonly logger: Logger = new Logger('SurveyItemsService');

    async onModuleInit() {
        await this.$connect();
        this.logger.log('Initialized and connected to database');
    }

    constructor(
        private readonly crossRefFetcher: CrossRefAPIFetcher,
        private readonly lensFetcher: LensAPIFetcher,
        private readonly openAlexFetcher: OpenAlexAPIFetcher,
        private readonly unpaywallFetcher: UnpaywallAPIFetcher
    ) {
        super();
    }

    async findAllRecommended(): Promise<SurveyItem[]> {
        this.logger.log('Executed findAllRecommended');

        return await this.surveyItem.findMany({
            where: {
                subscribed: false,
            },
        });
    }

    async findAllSubscribed(): Promise<SurveyItem[]> {
        this.logger.log('Executed findAllSubscribed');

        return await this.surveyItem.findMany({
            where: {
                subscribed: true,
            },
        });
    }

    async findOne(id: UUID): Promise<SurveyItemWithAnalysis> {
        this.logger.log(`Executed findOne of ${id}`);

        const item: SurveyItem = await this.surveyItem.findUniqueOrThrow({
            where: { id },
        });

        const lastAnalysis: SubscribedItemAnalysis =
            await this.findLastAnalysisFromItem(item.id as UUID);

        if (!item) throw new Error(`No existe el item de id ${id}`);
        if (!item.active)
            throw new Error(`El item de id ${id} no está disponible`);

        return {
            item,
            lastAnalysis,
        };
    }

    async subscribeOne(id: UUID): Promise<SurveyItem> {
        this.logger.log(`Executed subscribe of ${id}`);
        const data: SurveyItemWithAnalysis = await this.findOne(id);

        return await this.updateSurveyItem(id, {
            ...data,
            subscribed: true,
            active: true,
        });
    }

    async unsubscribeOne(id: UUID): Promise<SurveyItem> {
        this.logger.log(`Executed unsubscribe of ${id}`);
        const data: SurveyItemWithAnalysis = await this.findOne(id);

        return await this.updateSurveyItem(id, {
            ...data,
            subscribed: false,
        });
    }

    async removeOne(id: UUID): Promise<SurveyItem> {
        this.logger.log(`Executed remove of ${id}`);
        return await this.updateSurveyItem(id, {
            subscribed: false,
        });
    }

    async subscribeBatch(ids: UUID[]): Promise<void> {
        this.logger.log(`Executed subscribe of ${ids.length} items`);

        return await this.updateManySurveyItems(ids, {
            subscribed: true,
            active: true,
        });
    }

    async unsubscribeBatch(ids: UUID[]): Promise<void> {
        this.logger.log(`Executed unsubscribe of ${ids.length} items`);

        return await this.updateManySurveyItems(ids, {
            subscribed: false,
        });
    }

    async removeBatch(ids: UUID[]): Promise<void> {
        this.logger.log(`Executed remove of ${ids.length} items`);

        return await this.updateManySurveyItems(ids, {
            subscribed: false,
            active: false,
        });
    }

    private async updateSurveyItem(
        id: UUID,
        data: UpdateSurveyItemDto
    ): Promise<SurveyItem> {
        return await this.surveyItem.update({
            where: { id },
            data,
        });
    }

    private async updateManySurveyItems(
        ids: UUID[],
        data: UpdateSurveyItemDto
    ): Promise<void> {
        await this.surveyItem.updateMany({
            where: {
                id: { in: ids },
            },
            data: data,
        });
    }

    private async renewItems(): Promise<void> {
        this.logger.log('Executed renewItems');
        // borrar los no suscritos
        await this.surveyItem.deleteMany({
            where: {
                active: false,
            },
        });

        const subscribedItems: SurveyItemBasicData[] = await this.surveyItem
            .findMany({
                where: {
                    subscribed: true,
                },
            })
            .then((items: SurveyItem[]) =>
                items.map((item: SurveyItem) => {
                    const { title, summary, source } = item;
                    return {
                        title,
                        summary,
                        source,
                    };
                })
            );

        // obtener nuevos
        const trendingItems: CreateSurveyItemDto[] =
            await this.getNewTrendings();
        const stillRelevant: CreateSurveyItemDto[] = [];
        const newTrendings: CreateSurveyItemDto[] = [];

        trendingItems.forEach((trendingItem: CreateSurveyItemDto) => {
            if (subscribedItems.includes(trendingItem)) {
                // hace falta ver como verificar que sea el mismo item aunque cambie alguna propiedad en las fuentes
                // mediante la URI o algo asi, pq hasta la URL puede cambiar, y si algo en ese caso llamar a update
                stillRelevant.push(trendingItem);
                subscribedItems.filter((item) => item !== trendingItem);
            } else newTrendings.push(trendingItem);
        });

        const notRelevantAnymore: SurveyItemBasicData[] = subscribedItems;

        await this.surveyItem.createMany({
            data: { ...newTrendings },
            skipDuplicates: true,
        });

        // notificar los q ya no son relevantes
        this.logger.log(notRelevantAnymore);
    }

    private async getNewTrendings(): Promise<SurveyItemWithAnalysis[]> {
        this.logger.log('Executed getNewTrendings');

        // se obtienen las tendencias de cada api
        const crossRefTrendings = await this.crossRefFetcher.getTrendings();

        const lensTrendings = await this.lensFetcher.getTrendings();

        const openAlexTrendings = await this.openAlexFetcher.getTrendings();

        const unpaywallTrendings = await this.unpaywallFetcher.getTrendings();

        const trendingsBeforeFetching: SurveyItemBasicData[] = [];

        // se guardan todas en un solo array parseandolas a un solo tipo
        // q tenga solo las propiedades necesarias
        // PENDIENTE
        trendingsBeforeFetching.concat(
            crossRefTrendings.map((_item: CrossRefResultDto) => ({
                title: 'titulo',
                summary: 'resumen',
                source: 'http://myurl.com',
            }))
        );

        trendingsBeforeFetching.concat(
            lensTrendings.map((_item: LensResultDto) => ({
                title: 'titulo',
                summary: 'resumen',
                source: 'http://myurl.com',
            }))
        );

        trendingsBeforeFetching.concat(
            openAlexTrendings.map((_item: OpenAlexResultDto) => ({
                title: 'titulo',
                summary: 'resumen',
                source: 'http://myurl.com',
            }))
        );

        trendingsBeforeFetching.concat(
            unpaywallTrendings.map((_item: UnpaywallResultDto) => ({
                title: 'titulo',
                summary: 'resumen',
                source: 'http://myurl.com',
            }))
        );

        // Se recorre el array obteniendo el analisis de cada uno para guardarlos juntos
        const trendings: SurveyItemWithAnalysis[] = [];

        for (let index = 0; index < trendingsBeforeFetching.length; index++) {
            const item = trendingsBeforeFetching[index];

            const lastAnalysis: SubscribedItemAnalysis =
                await this.getAnalysisFromSurveyItem(item);

            trendings.push({
                item,
                lastAnalysis,
            });
        }

        return trendings;
    }

    private async getAnalysisFromSurveyItem(
        item: SurveyItemBasicData
    ): Promise<SubscribedItemAnalysis> {
        const searchedData: GeneralSearchResultDto =
            await this.getSurveyItemData(item);

        const analyzedMetrics: MetricsDto =
            await this.getSurveyItemMetricsFromData(item, searchedData);

        return {
            searchedData,
            analyzedMetrics,
        };
    }

    private async getSurveyItemData(
        item: SurveyItemBasicData
    ): Promise<GeneralSearchResultDto> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const crossRefResults: CrossRefResultDto =
            await this.crossRefFetcher.getInfoFromItem(item);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const lensResults: LensResultDto =
            await this.lensFetcher.getInfoFromItem(item);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const openAlexResults: OpenAlexResultDto =
            await this.openAlexFetcher.getInfoFromItem(item);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const unpaywallResults: UnpaywallResultDto =
            await this.unpaywallFetcher.getInfoFromItem(item);

        return {
            crossRefResults,
            lensResults,
            openAlexResults,
            unpaywallResults,
        } as GeneralSearchResultDto;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    private async getSurveyItemMetricsFromData(
        _item: SurveyItemBasicData,
        _data: GeneralSearchResultDto
    ): Promise<MetricsDto> {
        return {} as MetricsDto;
    }

    async findAllInsideIntervalFromObjective(
        itemId: UUID,
        startDate: Date,
        endDate: Date
    ) {
        return await this.subscribedItemAnalysis
            .findMany({
                where: { itemId },
                orderBy: { createdAt: 'asc' },
            })
            .then((analysisFromItem: SubscribedItemAnalysis[]) =>
                analysisFromItem.filter(
                    (analysis) =>
                        analysis.createdAt > startDate &&
                        analysis.createdAt < endDate
                )
            );
    }

    private async findLastAnalysisFromItem(
        itemId: UUID
    ): Promise<SubscribedItemAnalysis> {
        return await this.subscribedItemAnalysis.findFirstOrThrow({
            where: { itemId },
            orderBy: { searchedData: 'desc' },
        });
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Disconnected from database');
    }
}
