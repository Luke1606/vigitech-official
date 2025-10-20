/* eslint-disable prettier/prettier */
import { User, verifyToken } from '@clerk/backend';
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import type { ClerkClient } from '@clerk/backend';

@Injectable()
export class ClerkStrategy extends PassportStrategy(Strategy, 'clerk') {
    constructor(
        @Inject('ClerkClient')
        private readonly clerkClient: ClerkClient,
        private readonly configService: ConfigService
    ) {
        super();
    }

    async validate(req: Request): Promise<User> {
        const token = req.headers.authorization?.split(' ').pop();

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        try {
            const tokenPayload = await verifyToken(token, {
                secretKey: this.configService.get('CLERK_SECRET_KEY'),
            });

            const user = await this.clerkClient.users.getUser(tokenPayload.sub);

            return user;
        } catch (error) {
            console.error(error);
            throw new UnauthorizedException('Invalid token');
        }
    }
}
