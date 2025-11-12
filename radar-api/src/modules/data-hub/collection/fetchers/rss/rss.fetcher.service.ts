import * as xml2js from 'xml2js';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RadarQuadrant } from '@prisma/client';
import { BaseFetcher } from '../../base.fetcher';
import { PrismaService } from '../../../../../common/services/prisma.service';
import { ParsedFeed, RssFeed, AtomFeed, RssFeedChannel } from '../../types/rss/rss.types';

@Injectable()
export class RssFetcher extends BaseFetcher {
    readonly quadrants = [RadarQuadrant.SCIENTIFIC_STAGE, RadarQuadrant.LANGUAGES_AND_FRAMEWORKS]; // Example: RSS can cover multiple quadrants

    // Example RSS/Atom feed URLs. In a real scenario, these would be configured dynamically.
    private readonly feedUrls = [
        'https://www.techcrunch.com/feed/', // Example RSS feed
        'https://hnrss.org/frontpage', // Hacker News RSS
        // Add more relevant tech blogs, news sites, etc.
        // Netflix, Uber, Google, Martin Fowler, etc
        // DB-Engines, StackShare
    ];

    constructor(
        protected readonly prisma: PrismaService,
        private readonly httpService: HttpService,
    ) {
        super(prisma);
    }

    public async fetch(): Promise<void> {
        this.logger.log(`Collecting data from RSS Feeds for quadrants: ${this.quadrants.join(', ')}...`);

        for (const url of this.feedUrls) {
            try {
                const response = await this.httpService.get(url).toPromise();
                const xmlContent = response?.data;

                if (!xmlContent) {
                    this.logger.warn(`No content received from RSS feed: ${url}`);
                    continue;
                }

                const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
                const parsedFeed: ParsedFeed = await parser.parseStringPromise(xmlContent);

                if (!parsedFeed) {
                    this.logger.warn(`Failed to parse XML content from URL: ${url}`);
                    continue;
                }

                if ('rss' in parsedFeed && (parsedFeed.rss as RssFeed).channel) {
                    // RSS 2.0 feed
                    const channel: RssFeedChannel = (parsedFeed.rss as RssFeed).channel;
                    if (!channel.items || channel.items.length === 0) {
                        this.logger.warn(`No items found in RSS feed: ${url}`);
                        continue;
                    }
                    for (const item of channel.items) {
                        await this.saveRawData('RSS', 'RssFeedItem', item);
                    }
                    this.logger.log(`Successfully collected ${channel.items.length} items from RSS feed: ${url}`);
                } else if ('feed' in parsedFeed && (parsedFeed.feed as AtomFeed).entries) {
                    // Atom 1.0 feed
                    const feed: AtomFeed = parsedFeed.feed as AtomFeed;
                    if (!feed.entries || feed.entries.length === 0) {
                        this.logger.warn(`No entries found in Atom feed: ${url}`);
                        continue;
                    }
                    for (const entry of feed.entries) {
                        await this.saveRawData('RSS', 'AtomFeedEntry', entry);
                    }
                    this.logger.log(`Successfully collected ${feed.entries.length} entries from Atom feed: ${url}`);
                } else {
                    this.logger.warn(`Unsupported feed format for URL: ${url}`);
                }
            } catch (error) {
                this.logger.error(`Failed to collect data from RSS feed ${url}`, error);
            }
        }
    }
}
