import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';

@Injectable()
export class UsersService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    private readonly logger: Logger = new Logger('UsersService');

    async onModuleInit() {
        await this.$connect();
    }

    async findByClerkId(clerkId: string): Promise<User | null> {
        this.logger.log('Executed findByClerkId');
        return await this.user.findUnique({ where: { clerkId } });
    }

    async signUpNewUser(clerkId: string): Promise<User> {
        this.logger.log('Executed signUpNewUser');
        return await this.user.create({
            data: {
                clerkId,
            },
        });
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
