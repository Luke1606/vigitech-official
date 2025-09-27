/* eslint-disable prettier/prettier */
import { UUID } from 'crypto';
import { Controller, Get, Logger } from '@nestjs/common';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import { Session } from 'supertokens-nestjs';
import { UsersService } from './users.service';
import { DislpayUser } from './types/display-user.type';

@Controller('users')
export class UsersController {
    private readonly logger: Logger = new Logger('UsersController');

    constructor(private readonly usersService: UsersService) {}

    @Get('session')
    async getCurrentUser(@Session() session: SessionContainer): Promise<DislpayUser> {
        const userId: UUID = session.getUserId() as UUID;
        return await this.usersService.getCurrentUserInfo(userId);
    }
}
