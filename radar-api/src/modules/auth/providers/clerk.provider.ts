/**
 * Proveedor de factoría para el cliente de Clerk.
 * Configura y expone una instancia de `ClerkClient` para la interacción con la API de Clerk.
 * @constant {object} ClerkClientProvider
 */
import { ConfigService } from '@nestjs/config';
import { createClerkClient } from '@clerk/backend';

export const ClerkClientProvider = {
    provide: 'ClerkClient',
    useFactory: (configService: ConfigService) => {
        return createClerkClient({
            publishableKey: configService.get('CLERK_PUBLISHABLE_KEY'),
            secretKey: configService.get('CLERK_SECRET_KEY'),
        });
    },
    inject: [ConfigService],
};
