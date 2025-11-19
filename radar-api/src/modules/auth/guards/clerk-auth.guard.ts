import { UUID } from 'crypto';
import { Request } from 'express';
import { Injectable, CanActivate, ExecutionContext, Logger, UnauthorizedException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type ClerkClient, verifyToken } from '@clerk/backend';
import { User } from '@prisma/client';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UsersService } from '../../user-data/users/users.service';
import { AuthenticatedRequest } from '../../../shared/types/authenticated-request.type';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
    private readonly logger: Logger = new Logger('ClerkAuthGuard');

    constructor(
        @Inject('ClerkClient')
        private readonly clerkClient: ClerkClient,
        private readonly reflector: Reflector,
        private readonly usersService: UsersService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) return true;

        const request: AuthenticatedRequest = context.switchToHttp().getRequest<Request>();

        // Check for session cookie
        const sessionToken: string = request.cookies.__session;

        // Check for bearer token
        const authHeader = request.headers.authorization;
        const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

        if (!sessionToken && !bearerToken) {
            throw new UnauthorizedException('No authentication token provided');
        }

        try {
            // Try to verify the token (either session or bearer)
            const tokenToVerify = bearerToken || sessionToken;
            const tokenPayload = await verifyToken(tokenToVerify, {
                secretKey: process.env.CLERK_SECRET_KEY,
            });

            if (!tokenPayload) {
                throw new UnauthorizedException('Invalid session');
            }

            const user = await this.clerkClient.users.getUser(tokenPayload.sub);

            if (!user) return false;

            let userInDB: User | null = await this.usersService.findByClerkId(user.id);

            if (!userInDB) userInDB = await this.usersService.signUpNewUser(user.id);

            request.userId = userInDB.id as UUID;
            return true;
        } catch (err) {
            this.logger.error('Token verification error:', err);
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
