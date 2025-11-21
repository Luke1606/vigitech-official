/**
 * Servicio global de Prisma para gestionar la conexión a la base de datos.
 * Extiende `PrismaClient` y maneja el ciclo de vida de la conexión (inicialización y destrucción).
 * @class PrismaService
 * @extends {PrismaClient}
 * @implements {OnModuleInit}
 * @implements {OnModuleDestroy}
 */
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger: Logger = new Logger('PrismaService');

    constructor() {
        super();
    }

    /**
     * Se conecta a la base de datos cuando el módulo se inicializa.
     */
    async onModuleInit() {
        await this.$connect();
        this.logger.log('Initialized and connected to database');
    }

    /**
     * Se desconecta de la base de datos cuando el módulo se destruye.
     */
    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Disconnected from database');
    }
}
