/* eslint-disable prettier/prettier */
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Webhook } from 'svix';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class WebhooksService {
    private readonly logger: Logger = new Logger('WebhookService');
    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
    ) {
        this.logger.log('Initialized')
    }

    async processWebhook(
        svixId: string,
        svixTimestamp: string,
        svixSignature: string,
        payload: any
    ) {
        const clerkWebhookSecret: string = this.configService.get<string>(
            'CLERK_WEBHOOK_SECRET'
        ) as string;

        if (!clerkWebhookSecret)
            throw new Error('CLERK_WEBHOOK_SECRET is not set');

        const clerkWebhook: Webhook = new Webhook(clerkWebhookSecret);

        let event;
        try {
            // Verificar la firma del webhook
            event = clerkWebhook.verify(JSON.stringify(payload), {
                'svix-id': svixId,
                'svix-timestamp': svixTimestamp,
                'svix-signature': svixSignature,
            });
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(
                'Invalid signature',
                HttpStatus.UNAUTHORIZED
            );
        }

        // Procesar el evento específico
        const eventType = event.type;

        switch (eventType) {
            case 'user.created':
                await this.handleUserCreatedOrUpdated(event.data);
                break;

            case 'user.updated':
                await this.handleUserCreatedOrUpdated(event.data);
                break;
        }
    }

    private async handleUserCreatedOrUpdated(
        userData: { 
            id: string, 
            first_name: string, 
            last_name: string,
        }) {
        const { id, first_name, last_name } = userData;

        try {
            await this.usersService.createOrUpdateUser({
                profileId: id,
                name: `${first_name || ''} ${last_name || ''}`.trim(),
            });
        } catch (error) {
            this.logger.error(error);
            throw new HttpException(
                'Error syncing user to database',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
