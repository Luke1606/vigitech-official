import { UUID } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ItemAnalysis } from '@prisma/client';
import { ItemAnalysisService } from '../../item-analysis/item-analysis.service';
import { SurveyItemWithAnalysisType } from '../survey-items/types/survey-item-with-analysis.type';
import { SurveyItemsService } from '../survey-items/survey-items.service';
import { AnalysisHistoryType } from './types/analysis-history.type';
import { PrismaService } from '../../../common/services/prisma.service';

@Injectable()
export class ReportsService {
    private readonly logger: Logger = new Logger('ReportsService');

    constructor(
        private readonly itemAnalysisService: ItemAnalysisService,
        private readonly surveyItemsService: SurveyItemsService,
        private readonly prisma: PrismaService,
    ) {}

    async generate(itemIds: UUID[], startDate: Date, endDate: Date, userId: UUID): Promise<AnalysisHistoryType[]> {
        const analysisesByItem: AnalysisHistoryType[] = [];

        for (let index = 0; index < itemIds.length; index++) {
            const id: UUID = itemIds[index];
            const itemWithAnalysis: SurveyItemWithAnalysisType = await this.surveyItemsService.findOne(id, userId);

            if (!itemWithAnalysis) throw new Error(`Id ${id} not found`);

            const analysises: ItemAnalysis[] = await this.itemAnalysisService.findAllInsideIntervalFromObjective(
                id,
                startDate,
                endDate,
            );

            analysisesByItem.push({
                item: itemWithAnalysis.item,
                analysises,
            });
        }
        await this.prisma.report.create({
            data: {
                startDate,
                endDate,
                items: {
                    connect: itemIds.map((id) => ({ id })),
                },
            },
        });
        return analysisesByItem;
    }
}
