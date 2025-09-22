import { UUID } from 'crypto';
import {
    Injectable,
    OnModuleInit,
    OnModuleDestroy,
    Logger,
} from '@nestjs/common';
import {
    PrismaClient,
    SubscribedItemAnalysis,
    SurveyItem,
} from '@prisma/client';
import { ItemAnalysisService } from '../item-analysis/item-analysis.service';
import { AnalysisHistoryType } from './types/analysis-history.type';

@Injectable()
export class ReportsService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    private readonly logger: Logger = new Logger('ReportsService');

    constructor(private readonly itemAnalysisService: ItemAnalysisService) {
        super();
    }

    async onModuleInit() {
        await this.$connect();
        this.logger.log('Initialized and connected to database');
    }

    async generate(
        itemIds: UUID[],
        startDate: Date,
        endDate: Date
    ): Promise<AnalysisHistoryType[]> {
        const items: SurveyItem[] = await this.surveyItem.findMany({
            where: {
                id: { in: itemIds },
            }
        });

        if (!items) throw new Error('Ids not found');

        const analysisesByItem: AnalysisHistoryType[] = [];

        for (let index = 0; index < items.length; index++) {
            const item: SurveyItem = items[index];

            const analysises: SubscribedItemAnalysis[] =
                await this.itemAnalysisService.findAllInsideIntervalFromObjective(
                    item.id as UUID,
                    startDate,
                    endDate
                );

            analysisesByItem.push({
                item,
                analysises,
            });
        }
        await this.report.create({
            data: { 
                startDate,
                endDate,
                items,
            }
        });
        return analysisesByItem;
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Disconnected from database');
    }
}
