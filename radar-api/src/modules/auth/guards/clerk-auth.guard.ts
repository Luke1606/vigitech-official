import { Injectable, CanActivate, ExecutionContext, Logger, UnauthorizedException, Inject } from '@nestjs/common';
import { UUID } from 'crypto';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { type ClerkClient, verifyToken } from '@clerk/backend';
import { AuthenticatedRequest } from '@/shared/types/authenticated-request.type';
import { UsersService } from '../../user-data/users/users.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Guarda de autenticación que protege las rutas usando Clerk.
 * Verifica la validez del token de sesión o portador y asegura que el usuario exista en la base de datos local.
 * Si el usuario no existe, lo registra.
 * @class ClerkAuthGuard
 * @implements {CanActivate}
 */
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
     * @description Determina si la ruta actual puede ser activada.
     * @param context Contexto de ejecución que proporciona detalles sobre la solicitud HTTP actual.
     * @returns {Promise<boolean>} `true` si la ruta puede ser activada, `false` en caso contrario.
     * @throws {UnauthorizedException} Si no se proporciona un token de autenticación o es inválido/expirado.
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (this._isThisRoutePublic(context)) return true;

        const request: AuthenticatedRequest = context.switchToHttp().getRequest<Request>();

        try {
            let clerkUserId;

            if (process.env.NODE_ENV === 'test') {
                // ESTE PROCEDIMIENTO SOLO DEBE EJECUTARSE EN ENTORNO DE PRUEBAS.
                clerkUserId = request.headers['x-user-id'];

                if (!clerkUserId || Array.isArray(clerkUserId))
                    throw new UnauthorizedException('Invalid x-user-id header');
            } else {
                // Procedimiento normal
                const tokenSub: string = await this._extractAndVerifyToken(request);

                clerkUserId = (await this.clerkClient.users.getUser(tokenSub)).id;

                if (!clerkUserId) throw new UnauthorizedException('User not found in Clerk');
            }

            let userInDB = await this.usersService.findByClerkId(clerkUserId);

            // Si el usuario no existe en la DB local, lo registra
            if (!userInDB) userInDB = await this.usersService.signUpNewUser(clerkUserId);

            // Asigna el ID del usuario de la DB local a la solicitud autenticada
            request.userId = userInDB.id as UUID;
            return true;
        } catch (error) {
            this.logger.error('Token verification error:', error);
            throw new UnauthorizedException('Auth verification error');
        }
    }

    /**
     * @description Verifica si la ruta está marcada como pública
     * @param context Contexto de ejecución que proporciona detalles sobre la solicitud HTTP actual.
     * @returns {boolean} `true` si la ruta está marcada como pública, `false` en caso contrario.
     */
    private _isThisRoutePublic(context: ExecutionContext): boolean {
        return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    }

    /**
     * @description Extrae el token de sesión de las cookies o el token Bearer del encabezado de autorización, lo verifica y envía el sub.
     * @param request Solicitud de HTTP actual de la cual se está verificando su acceso.
     * @returns {string} Sub del token final, de no existir ninguno o de ser inválido lanza una exception.
     * @throws {UnauthorizedException} En cualquiera de los casos:
     * - Si no se logra extraer ni se encuentra ninguno de los dos tokens.
     * - Si al verificar el token encontrado no se obtiene un payload.
     */
    private async _extractAndVerifyToken(request: AuthenticatedRequest): Promise<string> {
        const sessionToken = request.cookies?.['__session'];
        const authHeader = request.headers.authorization;
        const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

        if (!sessionToken && !bearerToken) {
            throw new UnauthorizedException('No authentication token provided');
        }

        const tokenToVerify = bearerToken || sessionToken;

        // Intenta verificar el token (sesión o portador)
        const tokenPayload = await verifyToken(tokenToVerify, {
            secretKey: process.env.CLERK_SECRET_KEY,
        });

        if (!tokenPayload) {
            throw new UnauthorizedException('Invalid session');
        }

        return tokenPayload.sub;
    }
}
