import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import clerkClient from '@clerk/clerk-sdk-node';
import { User } from '@prisma/client';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UsersService } from '../users/users.service';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
    private readonly logger: Logger = new Logger('ClerkAuthGuard');

    constructor(
        private readonly reflector: Reflector,
        private readonly usersService: UsersService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()]
        );

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token: string = request.cookies.__session;

        if (!token) return false;

        try {
            await clerkClient.verifyToken(token);

            const userId: string = (
                await clerkClient.base.verifySessionToken(token)
            )?.sub;

            if (!userId) return false;

            let user: User | null =
                await this.usersService.findByClerkId(userId);

            if (!user) {
                user = await this.usersService.signUpNewUser(userId);
            }

            request.user = user;
        } catch (error) {
            this.logger.error('Auth error', error);
            return false;
        }
        return true;
    }
}
