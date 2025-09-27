/* eslint-disable prettier/prettier */
import { UUID } from 'crypto';
import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { UserType } from './types/user.type';
import { DislpayUser } from './types/display-user.type';

export class UsersService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    private readonly logger: Logger = new Logger('UserService');

    async onModuleInit() {
        await this.$connect();
        this.logger.log('Initialized');
    }

    async createOrUpdateUser(data: UserType): Promise<User> {
        return await this.user.upsert({
            where: { id: data?.id },
            update: data,
            create: data
        });
    }

    async getCurrentUserInfo(id: UUID): Promise<DislpayUser> {
        return this.user.findFirstOrThrow({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                // metadata: true,
            }
        });
    }
    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Disconnected from database');
    }
}
