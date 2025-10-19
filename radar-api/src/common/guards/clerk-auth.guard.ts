/* eslint-disable prettier/prettier */
// src/auth/clerk-auth.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { Request } from 'express';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException(
                'Authentication token not found in Authorization header.'
            );
        }

        try {
            // Verificar el token usando el SDK de Clerk
            const payload = await clerkClient.users.verifyToken(token);

            // Adjuntar información del usuario al request para uso posterior en los controladores
            (request as any).auth = {
                userId: payload.sub,
                sessionId: payload.sid,
            };

            return true;
        } catch (error) {
            // El token es inválido, ha expirado o hubo otro error
            throw new UnauthorizedException(
                'Invalid or expired authentication token.'
            );
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
