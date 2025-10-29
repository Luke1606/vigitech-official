import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { CreateSurveyItemType } from '../../../../../data-management/survey-items/types/create-survey-item.type';
import { GitHubRepo } from '../../../../types/api-responses/languages-frameworks/github.types';
import { BaseFetchingService } from '../../fetching-service.base';
import { SurveyItem } from '@prisma/client';

@Injectable()
export class GithubFetcherService extends BaseFetchingService {
    protected readonly logger: Logger = new Logger(GithubFetcherService.name);
    private readonly GITHUB_TRENDING_URL = 'https://api.github.com/search/repositories?q=stars:>1&sort=stars&order=desc'; // Example URL, replace with actual trending API if available

    constructor(protected readonly httpService: HttpService) {
        super(httpService, GithubFetcherService.name, 'https://api.github.com');
    }

    async getTrendings(): Promise<CreateSurveyItemType[]> {
        this.logger.log('Fetching trending items from GitHub');
        try {
            const response = await lastValueFrom(
                this.httpService.get<{ items: GitHubRepo[] }>(this.GITHUB_TRENDING_URL, {
                    headers: { Accept: 'application/vnd.github.v3+json' },
                }),
            );
            return response.data.items.map(this.transformGithubItem);
        } catch (error: any) {
            this.logger.error(`Failed to fetch GitHub trendings: ${error.message}`);
            return [];
        }
    }

    async getInfoFromItem(item: SurveyItem): Promise<any | undefined> {
        this.logger.log(`Fetching detailed info for item ${item.id} from GitHub`);
        // Implement logic to fetch specific item details from GitHub if needed
        // For now, return undefined as this might not be directly supported by a generic trending API
        return undefined;
    }

    private transformGithubItem(item: GitHubRepo): CreateSurveyItemType {
        return {
            title: item.name,
            summary: item.description || 'No description provided.',
            source: 'GitHub',
            externalId: item.id.toString(),
            url: item.html_url,
            // Add other relevant fields as needed
        };
    }
}
