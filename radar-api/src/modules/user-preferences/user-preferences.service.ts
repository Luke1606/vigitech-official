import { UUID } from 'crypto';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { CreateDefaultUserPreferenceDto } from './dto/create-default-user-preference.dto';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import { PrismaClient, UserPreferences } from '@prisma/client';

@Injectable()
export class UserPreferencesService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger: Logger = new Logger('UserPreferencesService');

    async onModuleInit(): Promise<void> {
        await this.$connect();
        this.logger.log('Initialized and connected to database');
    }

    async findActualUserPreferences(userId: UUID): Promise<UserPreferences | null> {
        return this.userPreferences.findFirstOrThrow({
            where: { userId },
        });
    }

    async createOrReturnToDefault(userId: UUID) {
        const defaultPreferences: CreateDefaultUserPreferenceDto = {
            userId,
        };

        const preferences: UserPreferences | null = await this.findActualUserPreferences(userId);

        return await this.userPreferences.upsert({
            where: { id: preferences?.id },
            create: defaultPreferences,
            update: {
                id: preferences?.id as UUID,
                ...defaultPreferences,
            },
        });
    }

    async update(newPreferences: UpdateUserPreferenceDto) {
        return this.userPreferences.update({
            where: {
                id: newPreferences.id,
            },
            data: newPreferences,
        });
    }

    async onModuleDestroy(): Promise<void> {
        await this.$disconnect();
        this.logger.log('Disconnected from database');
    }
}
