import { Injectable, Logger } from '@nestjs/common';
import { CentralizedAiAgentService } from '../../centralized-ai-agent/centralized-ai-agent.service';
import { PrismaService } from '../../../common/services/prisma.service';
import { Field } from '@prisma/client';

@Injectable()
export class ItemsIdentifyingService {
    private readonly logger = new Logger(ItemsIdentifyingService.name);

    constructor(
        private readonly aiAgentService: CentralizedAiAgentService,
        private readonly prisma: PrismaService,
    ) {}

    async identifyAndCreateItem(knowledgeFragmentId: string): Promise<any> {
        this.logger.log(`Identifying item from KnowledgeFragment ID: ${knowledgeFragmentId}`);

        const knowledgeFragment = await (this.prisma as any).tech_survey.knowledgeFragment.findUnique({
            where: { id: knowledgeFragmentId },
        });

        if (!knowledgeFragment) {
            this.logger.error(`KnowledgeFragment with ID ${knowledgeFragmentId} not found.`);
            throw new Error(`KnowledgeFragment with ID ${knowledgeFragmentId} not found.`);
        }

        const textSnippet = knowledgeFragment.textSnippet;

        // Use LLM to identify potential technology item and its field
        const identificationPrompt = `Analyze the following text snippet and determine if it describes a technology item. If it does, extract its title, a concise summary, and classify its field into one of these categories: ${Object.values((this.prisma as any).tech_survey.Field).join(', ')}. Return the output as a JSON object with 'isTechnologyItem' (boolean), 'title' (string), 'summary' (string), and 'field' (string, matching one of the categories).
        Text: ${textSnippet}`;

        const identificationJson = await this.aiAgentService.generateText(identificationPrompt);
        let identifiedData: { isTechnologyItem: boolean; title?: string; summary?: string; field?: Field } = {
            isTechnologyItem: false,
        };

        try {
            identifiedData = JSON.parse(identificationJson || '{}');
        } catch (e: any) {
            this.logger.error(`Failed to parse identification data from LLM response: ${e.message}`);
        }

        if (identifiedData.isTechnologyItem && identifiedData.title && identifiedData.summary && identifiedData.field) {
            // Check if item already exists to avoid duplicates
            const existingItem = await (this.prisma as any).tech_survey.item.findFirst({
                where: { title: identifiedData.title },
            });

            if (existingItem) {
                this.logger.log(`Item "${identifiedData.title}" already exists. Skipping creation.`);
                return existingItem;
            }

            // Create the new Item
            const newItem = await (this.prisma as any).tech_survey.item.create({
                data: {
                    title: identifiedData.title,
                    summary: identifiedData.summary,
                    itemField: identifiedData.field,
                    citedFragments: {
                        create: {
                            fragmentId: knowledgeFragment.id,
                        },
                    },
                },
            });
            this.logger.log(`New technology item "${newItem.title}" created with ID: ${newItem.id}`);
            return newItem;
        } else {
            this.logger.log(`KnowledgeFragment ID ${knowledgeFragmentId} did not yield a new technology item.`);
            return null;
        }
    }
}
