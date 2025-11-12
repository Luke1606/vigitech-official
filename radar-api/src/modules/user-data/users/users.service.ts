import { Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../../common/services/prisma.service';

@Injectable()
export class UsersService {
    private readonly logger: Logger;

    constructor(private readonly prisma: PrismaService) {
        this.logger = new Logger(this.constructor.name);
    }

    async findByClerkId(clerkId: string): Promise<User | null> {
        this.logger.log('Executed findByClerkId');
        return await this.prisma.user.findUnique({ where: { clerkId } });
    }

    async signUpNewUser(clerkId: string): Promise<User> {
        this.logger.log('Executed signUpNewUser');
        return await this.prisma.user.create({
            data: {
                clerkId,
            },
        });
    }
}
