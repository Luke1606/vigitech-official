import * as xml2js from 'xml2js';
import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { ParsedFeed, RssFeed, AtomFeed, RssFeedItem, AtomFeedEntry } from '../../types/rss/rss.types';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class RssFetcher extends BaseFetcher {
    private readonly feedUrls = [
        'https://www.techcrunch.com/feed/',
        'https://hnrss.org/frontpage',
        'https://martinfowler.com/feed.atom',
        'https://aws.amazon.com/blogs/aws/feed/',
        'https://cloud.google.com/blog/rss.xml',
        'https://ai.googleblog.com/feeds/posts/default',
        'https://kubernetes.io/feed.xml',
        'https://db-engines.com/en/blog/feed',
        'https://www.theregister.com/dev/headlines.atom',
        'https://www.infoq.com/feed/news/',
        'https://devblogs.microsoft.com/feed/',
    ];

    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.RSS;
    }

    getDatatype(): RawDataType {
        return RawDataType.COMMUNITY_POST;
    }

    /**
     * @method fetch
     * @description Recolecta artículos de múltiples feeds RSS/Atom y devuelve el array consolidado
     * para que el servicio de recolección (CollectionService) maneje la persistencia (createMany).
     */
    public async fetch(): Promise<object[]> {
        this.logger.log(`Collecting data from ${this.feedUrls.length} RSS Feeds...`);
        const allItems: object[] = [];

        for (const url of this.feedUrls) {
            try {
                const response = await lastValueFrom(this.httpService.get(url));
                const xmlContent = response?.data;

                if (xmlContent) {
                    const fetchedItems = await this.processFeed(xmlContent, url);
                    allItems.push(...fetchedItems);
                } else {
                    this.logger.warn(`No content received from RSS feed: ${url}`);
                }
            } catch (error) {
                // Se registra el error con el objeto completo si es posible
                this.logger.error(`Failed to collect data from RSS feed ${url}`, error);
            }
        }

        this.logger.log(`RSS collection finished. Total items ready for persistence: ${allItems.length}`);
        return allItems;
    }

    /**
     * @method processFeed
     * @description Parsea el contenido XML y extrae los ítems de RSS o Atom,
     * devolviendo el array de objetos crudos (sin persistencia aquí).
     */
    private async processFeed(xmlContent: string, url: string): Promise<object[]> {
        const parser = new xml2js.Parser({
            explicitArray: false,
            mergeAttrs: true,
            tagNameProcessors: [xml2js.processors.stripPrefix],
        });

        try {
            const parsedFeed: ParsedFeed = await parser.parseStringPromise(xmlContent);

            // 🔑 Se inicializa como array de objetos
            let items: RssFeedItem[] | AtomFeedEntry[] = [];
            let itemName: string;

            if (!parsedFeed) {
                this.logger.warn(`Failed to parse XML content from URL: ${url}`);
                return [];
            }

            // 🔑 El tipo RssFeed está correctamente usado aquí
            if ('rss' in parsedFeed && (parsedFeed.rss as RssFeed).channel) {
                // RSS 2.0 feed
                const channel = (parsedFeed.rss as RssFeed).channel;

                // Lógica robusta para manejar: array (>=2), objeto único (1) o undefined (0)
                const channelItems = channel.items as RssFeedItem | RssFeedItem[] | undefined;

                items = Array.isArray(channelItems) ? channelItems : channelItems ? [channelItems] : [];
                itemName = 'RssFeedItem';
            } else if ('feed' in parsedFeed) {
                // Atom 1.0 feed
                const feed = parsedFeed.feed as AtomFeed;

                // Lógica robusta para manejar: array (>=2), objeto único (1) o undefined (0)
                const feedEntries = feed.entries as AtomFeedEntry | AtomFeedEntry[] | undefined;

                items = Array.isArray(feedEntries) ? feedEntries : feedEntries ? [feedEntries] : [];
                itemName = 'AtomFeedEntry';
            } else {
                this.logger.warn(`Unsupported feed format for URL: ${url}`);
                return [];
            }

            this.logger.log(`Processed ${items.length} ${itemName}s from: ${url}`);

            // 🔑 Se devuelve el array de objetos directamente
            return items;
        } catch (error) {
            this.logger.error(`Error processing feed structure from ${url}`, error);
            return [];
        }
    }
}
