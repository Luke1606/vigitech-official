import { UUID } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { UserPreferences } from '@prisma/client';
import { PrismaService } from '@/common/services/prisma.service';
import { CreateDefaultUserPreferenceDto } from './dto/create-default-user-preference.dto';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';

@Injectable()
export class UserPreferencesService {
    private readonly logger: Logger;

    constructor(private readonly prisma: PrismaService) {
        this.logger = new Logger(this.constructor.name);
        this.logger.log('Initialized');
    }

    async findActualUserPreferences(userId: UUID): Promise<UserPreferences | null> {
        return this.prisma.userPreferences.findFirstOrThrow({
            where: { userId },
        });
    }

    async createOrReturnToDefault(userId: UUID) {
        const defaultPreferences: CreateDefaultUserPreferenceDto = {
            userId,
        };

        const preferences: UserPreferences | null = await this.findActualUserPreferences(userId);

        return await this.prisma.userPreferences.upsert({
            where: { id: preferences?.id },
            create: defaultPreferences,
            update: {
                id: preferences?.id as UUID,
                ...defaultPreferences,
            },
        });
    }

    async update(newPreferences: UpdateUserPreferenceDto) {
        return this.prisma.userPreferences.update({
            where: {
                id: newPreferences.id,
            },
            data: newPreferences,
        });
    }
}
