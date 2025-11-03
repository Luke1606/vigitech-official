import { DynamicModule, Module, Provider } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { CollectionService } from './collection.service';
import { BaseCollector } from './base.collector';

@Module({})
export class CollectionModule {
    static register(collectors: (new (...args: unknown[]) => BaseCollector)[]): DynamicModule {
        const collectorProviders: Provider[] = collectors.map((CollectorClass) => ({
            provide: CollectorClass,
            useClass: CollectorClass,
        }));

        return {
            module: CollectionModule,
            providers: [
                CollectionService,
                PrismaService,
                ...collectorProviders,
                {
                    provide: 'COLLECTORS_ARRAY',
                    useFactory: (...collectorInstances: BaseCollector[]) => collectorInstances,
                    inject: collectors,
                },
            ],
            exports: [CollectionService],
        };
    }
}
