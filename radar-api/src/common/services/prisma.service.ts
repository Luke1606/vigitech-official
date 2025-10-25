import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger: Logger = new Logger('PrismaService');

    constructor() {
        super();
    }

    async onModuleInit() {
        await this.$connect();
        this.logger.log('Initialized and connected to database');
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Initialized and connected to database');
    }
}
