import { lastValueFrom } from 'rxjs';
import { parseStringPromise } from 'xml2js';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { ArxivAuthor, ArxivCategory, ArxivPaper } from '../../types/arxiv-org/arxiv-org.types';
import { BaseFetcher } from '../../base.fetcher';
import { ARXIV_BASE_URL } from './base-url';

@Injectable()
export class ArxivTrendingFetcher extends BaseFetcher {
    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.ARXIV_ORG;
    }

    getDatatype(): RawDataType {
        return RawDataType.ACADEMIC_PAPER;
    }

    async fetch(): Promise<ArxivPaper[]> {
        this.logger.log('Collecting vast volume of recent papers across all major science categories...');

        // Búsqueda amplia en las categorías principales.
        const apiUrl = `${ARXIV_BASE_URL}/query?search_query=cat:cs OR cat:math OR cat:physics OR cat:q-bio OR cat:eess&sortBy=submittedDate&sortOrder=descending&max_results=200`;

        try {
            const response = await lastValueFrom(this.httpService.get(apiUrl, { responseType: 'text' }));
            const xmlData = response.data;

            const result = await parseStringPromise(xmlData, { explicitArray: false, mergeAttrs: true });
            const entries = result.feed.entry || [];

            const papers: ArxivPaper[] = entries.map((entry: any) => ({
                id: entry.id,
                title: entry.title,
                summary: entry.summary,
                authors: Array.isArray(entry.authors)
                    ? entry.authors.map((author: ArxivAuthor) => ({ name: author.name }))
                    : [{ name: entry.authors.name }],
                published: entry.published,
                updated: entry.updated,
                categories: Array.isArray(entry.categories)
                    ? entry.categories.map((category: ArxivCategory) => ({
                          term: category.term,
                          scheme: category.scheme,
                      }))
                    : [{ term: entry.categories.term, scheme: entry.categories.scheme }],
                primaryCategory: {
                    term: entry['arxiv:primary_category'].term,
                    scheme: entry['arxiv:primary_category'].scheme,
                },
                link: Array.isArray(entry.link)
                    ? entry.link.find((link: any) => link.title === 'pdf')?.href || entry.link[0].href
                    : entry.link.href,
            }));

            this.logger.log(`Successfully collected ${papers.length} trending papers from arXiv.`);
            return papers;
        } catch (error) {
            this.logger.error('Failed to collect data from arXiv', error);
            throw error;
        }
    }
}
