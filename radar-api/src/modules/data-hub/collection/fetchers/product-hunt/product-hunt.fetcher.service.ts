import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { ProductHuntProduct } from '../../types/product-hunt/product-hunt.types';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class ProductHuntTrendingProductsFetcher extends BaseFetcher {
    // TODO: Product Hunt requiere una clave de desarrollador (Developer Key) y acceso con GraphQL.
    private readonly BASE_URL: string = 'https://api.producthunt.com/v2/api/graphql';
    private readonly ACCESS_TOKEN: string = 'TODO: obtener_ACCESS_TOKEN';

    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.PRODUCT_HUNT;
    }
    getDatatype(): RawDataType {
        return RawDataType.REPORT_OR_PRODUCT;
    }

    async fetch(): Promise<ProductHuntProduct[]> {
        this.logger.log('Collecting trending products from Product Hunt...');

        // Query de GraphQL para obtener los productos de hoy con más votos
        const graphqlQuery = `
            query TrendingProducts {
                posts(first: 20, postedBefore: "${new Date().toISOString()}") {
                    edges {
                        node {
                            id
                            name
                            tagline
                            votesCount
                            makers { id name }
                            topics { name }
                            thumbnail { url }
                        }
                    }
                }
            }
        `;

        if (!this.ACCESS_TOKEN || this.ACCESS_TOKEN === 'TODO: obtener_ACCESS_TOKEN') {
            this.logger.error('Product Hunt ACCESS_TOKEN is not configured. Skipping fetch.');
            return [];
        }

        try {
            const headers = {
                Authorization: `Bearer ${this.ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            };
            const response = await lastValueFrom(
                this.httpService.post(this.BASE_URL, { query: graphqlQuery }, { headers }),
            );

            // La data de GraphQL requiere un mapeo más profundo
            const edges = response?.data?.data?.posts?.edges ?? [];
            const products: ProductHuntProduct[] = edges.map((edge: any) => edge.node);

            return products;
        } catch (error) {
            this.logger.error('Failed to collect data from Product Hunt API (check token and permissions)', error);
            return [];
        }
    }
}
