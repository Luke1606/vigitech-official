/**
 * Extiende la interfaz `Request` de Express para incluir información de autenticación.
 * Añade una propiedad `userId` opcional para identificar al usuario autenticado.
 * @typedef {Express.Request & { userId?: UUID }} AuthenticatedRequest
 */
import { UUID } from 'crypto';
import { Request } from 'express';

export type AuthenticatedRequest = Request & {
    userId?: UUID;
};
