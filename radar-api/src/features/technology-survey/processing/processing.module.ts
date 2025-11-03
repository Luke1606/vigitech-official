import { DynamicModule, Module, Provider } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { ProcessingService } from './processing.service';
import { BaseProcessor } from './base.processor';

@Module({})
export class ProcessingModule {
    static register(processors: (new (...args: unknown[]) => BaseProcessor)[]): DynamicModule {
        const processorProviders: Provider[] = processors.map((ProcessorClass) => ({
            provide: ProcessorClass,
            useClass: ProcessorClass,
        }));

        return {
            module: ProcessingModule,
            providers: [
                ProcessingService,
                PrismaService,
                ...processorProviders,
                {
                    provide: 'PROCESSORS_ARRAY', // Un token para inyectar todos los procesadores
                    useFactory: (...processorInstances: BaseProcessor[]) => processorInstances,
                    inject: processors, // Inyecta todas las clases de procesadores que se pasaron
                },
            ],
            exports: [ProcessingService],
        };
    }
}
