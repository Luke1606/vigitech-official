import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { HashnodePost } from '../../types/hashnode/hashnode.types';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class HashnodePostsFetcher extends BaseFetcher {
    // TODO: Hashnode usa GraphQL. Para un mayor Rate Limit y paginación avanzada,
    // conseguir una Hashnode API Key y adjuntarla en los headers de autenticación.
    private readonly BASE_URL = 'https://gql.hashnode.com/';

    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.HASHNODE;
    }
    getDatatype(): RawDataType {
        return RawDataType.COMMUNITY_POST;
    }

    async fetch(): Promise<HashnodePost[]> {
        this.logger.log('Collecting recent top posts from Hashnode via GraphQL...');

        // Consulta para obtener los nodos de posts más recientes (limitado por defecto).
        const graphqlQuery = {
            query: `
                query {
                    posts(filter: { publication: "hashnode" }, first: 50) {
                        nodes {
                            id title url publishedAt brief tags { name } reactionCount responseCount
                            author { username name } content { markdown }
                        }
                    }
                }
            `,
        };

        try {
            const response = await lastValueFrom(this.httpService.post(this.BASE_URL, graphqlQuery));

            const posts = (response?.data?.data?.posts?.nodes as HashnodePost[]) ?? [];

            this.logger.log(`Successfully collected ${posts.length} posts from Hashnode.`);
            return posts;
        } catch (error) {
            this.logger.error('Failed to collect data from Hashnode', error);
            throw error;
        }
    }
}
