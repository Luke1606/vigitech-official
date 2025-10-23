/* eslint-disable prettier/prettier */
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import clerkClient from '@clerk/clerk-sdk-node';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
    private readonly logger: Logger = new Logger('ClerkAuthGuard');
    
    constructor(private reflector: Reflector) {}

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
        } catch (error) {
            this.logger.error('Auth error', error);
            return false;
        }
        return true;
    }
}
