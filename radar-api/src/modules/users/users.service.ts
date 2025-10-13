/* eslint-disable prettier/prettier */
import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { UserType } from './types/user.type';

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
        const { id, profileId } = data;

        let whereCondition;
            if (id)
                whereCondition = { id };
            else
                whereCondition = { profileId };

        return await this.user.upsert({
            where: whereCondition,
            update: data,
            create: data
        });
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Disconnected from database');
    }
}
