/* eslint-disable prettier/prettier */
import {
    Controller,
    Post,
    Headers,
    Body,
    HttpStatus,
    HttpException,
    Logger,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
    private readonly logger = new Logger(WebhooksController.name);

    constructor(private readonly webhooksService: WebhooksService) {}

    @Post('users-sync')
    async handleClerkWebhook(
        @Headers('svix-id') svixId: string,
        @Headers('svix-timestamp') svixTimestamp: string,
        @Headers('svix-signature') svixSignature: string,
        @Body() payload: any
    ) {
        // 1. Verificar las cabeceras de Svix
        if (!svixId || !svixTimestamp || !svixSignature) {
            throw new HttpException(
                'Missing Svix headers',
                HttpStatus.BAD_REQUEST
            );
        }

        try {
            // 2. Verificar la firma del webhook y procesarlo
            await this.webhooksService.processWebhook(
                svixId,
                svixTimestamp,
                svixSignature,
                payload
            );
            return { message: 'Webhook processed successfully' };
        } catch (error) {
            this.logger.error('Webhook processing failed', error);
            throw new HttpException(
                'Webhook processing failed',
                HttpStatus.BAD_REQUEST
            );
        }
    }
}
