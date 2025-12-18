/**
 * Guarda de autenticación que protege las rutas usando Clerk.
 * Verifica la validez del token de sesión o portador y asegura que el usuario exista en la base de datos local.
 * Si el usuario no existe, lo registra.
 * @class ClerkAuthGuard
 * @implements {CanActivate}
 */
import { Injectable, CanActivate, ExecutionContext, Logger, UnauthorizedException, Inject } from '@nestjs/common';
import { UUID } from 'crypto';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { type ClerkClient, verifyToken } from '@clerk/backend';
import { User } from '@prisma/client';
import { AuthenticatedRequest } from '@/shared/types/authenticated-request.type';
import { UsersService } from '../../user-data/users/users.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
    private readonly logger: Logger = new Logger('ClerkAuthGuard');

    /**
     * @param clerkClient Cliente de Clerk inyectado para interactuar con la API de Clerk.
     * @param reflector Proporciona métodos para leer metadatos.
     * @param usersService Servicio para gestionar usuarios en la base de datos local.
     */
    constructor(
        @Inject('ClerkClient')
        private readonly clerkClient: ClerkClient,
        private readonly reflector: Reflector,
        private readonly usersService: UsersService,
    ) {}

    /**
     * Determina si la ruta actual puede ser activada.
     * @param context Contexto de ejecución que proporciona detalles sobre la solicitud HTTP actual.
     * @returns {Promise<boolean>} `true` si la ruta puede ser activada, `false` en caso contrario.
     * @throws {UnauthorizedException} Si no se proporciona un token de autenticación o es inválido/expirado.
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Verifica si la ruta está marcada como pública
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) return true;

        const request: AuthenticatedRequest = context.switchToHttp().getRequest<Request>();

        // Extrae el token de sesión de las cookies o el token Bearer del encabezado de autorización
        const sessionToken: string = request.cookies.__session;
        const authHeader = request.headers.authorization;
        const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

        if (!sessionToken && !bearerToken) {
            throw new UnauthorizedException('No authentication token provided');
        }

        try {
            // Intenta verificar el token (sesión o portador)
            const tokenToVerify = bearerToken || sessionToken;
            const tokenPayload = await verifyToken(tokenToVerify, {
                secretKey: process.env.CLERK_SECRET_KEY,
            });

            if (!tokenPayload) {
                throw new UnauthorizedException('Invalid session');
            }

            // Busca el usuario en Clerk y en la base de datos local
            const user = await this.clerkClient.users.getUser(tokenPayload.sub);

            if (!user) throw new UnauthorizedException('User not found in Clerk');

            let userInDB: User | null = await this.usersService.findByClerkId(user.id);

            // Si el usuario no existe en la DB local, lo registra
            if (!userInDB) userInDB = await this.usersService.signUpNewUser(user.id);

            // Asigna el ID del usuario de la DB local a la solicitud autenticada
            request.userId = userInDB.id as UUID;
            return true;
        } catch (error) {
            this.logger.error('Token verification error:', error);
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
