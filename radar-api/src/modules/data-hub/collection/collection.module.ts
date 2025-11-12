import { DynamicModule, Module, Provider } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { CollectionService } from './collection.service';
import { BaseFetcher } from './base.fetcher';

@Module({})
export class CollectionModule {
    static register(fetchers: (new (...args: unknown[]) => BaseFetcher)[]): DynamicModule {
        const fetcherProviders: Provider[] = fetchers.map((FetcherClass) => ({
            provide: FetcherClass,
            useClass: FetcherClass,
        }));

        return {
            module: CollectionModule,
            providers: [
                CollectionService,
                PrismaService,
                ...fetcherProviders,
                {
                    provide: 'FETCHERS_ARRAY',
                    useFactory: (...fetcherInstances: BaseFetcher[]) => fetcherInstances,
                    inject: fetchers,
                },
            ],
            exports: [CollectionService],
        };
    }
}
