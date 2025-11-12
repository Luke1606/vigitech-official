import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RadarQuadrant } from '@prisma/client';
import { BaseFetcher } from '../../base.fetcher';
import { PrismaService } from '../../../../../common/services/prisma.service';
import { StackOverflowSurveyRecord } from '../../types/stack-overflow/stack-overflow-survey.types';

@Injectable()
export class StackOverflowSurveyFetcher extends BaseFetcher {
    readonly quadrants = [RadarQuadrant.LANGUAGES_AND_FRAMEWORKS]; // Or a more appropriate quadrant

    // Note: Stack Overflow Survey data is typically released as CSV files, not a direct API.
    // This fetcher would simulate fetching or parsing such data.
    // For a real implementation, you might:
    // 1. Download the CSV from Kaggle or Stack Overflow directly.
    // 2. Parse the CSV into a structured format.
    // 3. Store the parsed data.
    // This example uses a placeholder for where data would be processed.

    constructor(
        protected readonly prisma: PrismaService,
        private readonly httpService: HttpService, // HttpService might not be directly used for CSV, but kept for consistency
    ) {
        super(prisma);
    }

    public async fetch(): Promise<void> {
        this.logger.log(
            `Collecting data from Stack Overflow Developer Survey for quadrant ${this.quadrants.join()}...`,
        );

        try {
            // Placeholder for fetching/parsing survey data.
            // In a real scenario, this might involve:
            // - Using a library to read a local CSV file.
            // - Making an HTTP request to a hosted CSV/JSON version of the survey.
            // - Using Kaggle API to download the dataset.

            // For demonstration, we'll simulate some data.
            const simulatedSurveyData: StackOverflowSurveyRecord[] = [
                {
                    ResponseId: 1,
                    Q120: 'Employed, full-time',
                    MainBranch: 'I am a developer by profession',
                    Age: '25-34 years old',
                    Employment: 'Employed, full-time',
                    RemoteWork: 'Hybrid (some remote, some in-person)',
                    EdLevel: 'Bachelor’s degree (B.A., B.S., B.Eng., etc.)',
                    YearsCodePro: '5-9 years',
                    DevType: 'Developer, full-stack',
                    LanguageHaveWorkedWith: 'JavaScript;TypeScript;Python;HTML/CSS',
                    LanguageWantToWorkWith: 'Rust;Go',
                    DatabaseHaveWorkedWith: 'PostgreSQL;MongoDB',
                    DatabaseWantToWorkWith: 'Redis',
                    PlatformHaveWorkedWith: 'AWS;Docker',
                    PlatformWantToWorkWith: 'Kubernetes',
                    WebframeHaveWorkedWith: 'React;Node.js',
                    WebframeWantToWorkWith: 'Next.js',
                    MiscTechHaveWorkedWith: 'Apache Kafka',
                    MiscTechWantToWorkWith: 'WebAssembly',
                    ToolsTechHaveWorkedWith: 'Docker;Git;Jira',
                    ToolsTechWantToWorkWith: 'Pulumi',
                    Country: 'USA',
                },
                // Add more simulated records or actual parsed data
            ];

            if (simulatedSurveyData.length > 0) {
                for (const record of simulatedSurveyData) {
                    await this.saveRawData('StackOverflowSurvey', 'SurveyRecord', record);
                }
                this.logger.log(
                    `Successfully collected ${simulatedSurveyData.length} records from Stack Overflow Survey.`,
                );
            } else {
                this.logger.warn('No data found from Stack Overflow Developer Survey.');
            }
        } catch (error) {
            this.logger.error('Failed to collect data from Stack Overflow Developer Survey', error);
        }
    }
}
