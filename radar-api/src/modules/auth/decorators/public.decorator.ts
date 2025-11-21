/**
 * Clave de metadatos utilizada para identificar rutas públicas.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorador que marca una ruta como pública, omitiendo la autenticación.
 * @function Public
 * @returns {MethodDecorator}
 */
import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
