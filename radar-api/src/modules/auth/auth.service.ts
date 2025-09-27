/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { SuperTokensConfig } from 'supertokens-node';
import Session from 'supertokens-node/recipe/session';
import ThirdParty from 'supertokens-node/recipe/thirdparty';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import { ProviderInput } from 'supertokens-node/recipe/thirdparty/types';

import { UsersService } from '../users/users.service';
import { UserType } from '../users/types/user.type';

@Injectable()
export class AuthConfigService {
    private readonly logger: Logger = new Logger('AuthService');

    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService
    ) {}

    getConfig(): SuperTokensConfig {
        const connectionURI: string = this.configService.get<string>(
            'SUPERTOKENS_CONNECTION_URI'
        ) as string;

        const apiKey: string = this.configService.get<string>(
            'SUPERTOKENS_API_KEY'
        ) as string;

        const apiUrl: string = this.configService.get<string>(
            'API_URL'
        ) as string;

        const websiteUrl: string = this.configService.get<string>(
            'WEBSITE_URL'
        ) as string;

        return {
            framework: 'express',
            supertokens: {
                connectionURI,
                apiKey,
            },
            appInfo: {
                appName: 'Technology-Radar',
                apiDomain: apiUrl,
                apiBasePath: 'api/auth',
                websiteDomain: websiteUrl,
                websiteBasePath: 'vigitech/auth',
            },
            recipeList: [
                EmailPassword.init(),
                ThirdParty.init({
                    override: {
                        functions: (originalImplementation) => {
                            return {
                                ...originalImplementation,

                                signInUp: async (input) => {
                                    const response =
                                        await originalImplementation.signInUp(
                                            input
                                        );

                                    if (response.status === 'OK') {
                                        const userData: UserType = {
                                            email: response?.user?.emails[0],
                                            name: response?.user?.emails[0].split('@')[0]
                                        };

                                        await this.usersService.createOrUpdateUser(
                                            userData
                                        );
                                    }
                                    return response;
                                },
                            };
                        },
                    },
                    signInAndUpFeature: {
                        providers: [
                            this.getGoogleConfig(),
                            this.getGitHubConfig(),
                            this.getGitLabConfig(),
                            this.getLinkedInConfig(),
                        ],
                    },
                }),
                Session.init({
                    exposeAccessTokenToFrontendInCookieBasedAuth: true,
                }),
            ],
        };
    }

    private getGoogleConfig (): ProviderInput {
        const googleClient: string = this.configService.get<string>(
            'GOOGLE_CLIENT_ID'
        ) as string;

        const googleSecret: string = this.configService.get<string>(
            'GOOGLE_CLIENT_SECRET'
        ) as string;

        return {
            config: {
                thirdPartyId: 'google',
                clients: [
                    {
                        clientId: googleClient,
                        clientSecret: googleSecret,
                    },
                ],
            },
        }
    }

    private getGitHubConfig (): ProviderInput {
        const gitHubClient: string = this.configService.get<string>(
            'GITHUB_CLIENT_ID'
        ) as string;

        const gitHubSecret: string = this.configService.get<string>(
            'GITHUB_CLIENT_SECRET'
        ) as string;

        return {
            config: {
                thirdPartyId: 'github',
                clients: [
                    {
                        clientId: gitHubClient,
                        clientSecret: gitHubSecret,
                    },
                ],
            },
        }
    }

    private getGitLabConfig (): ProviderInput {
        const gitLabClient: string = this.configService.get<string>(
            'GITLAB_CLIENT_ID'
        ) as string;

        const gitLabSecret: string = this.configService.get<string>(
            'GITLAB_CLIENT_SECRET'
        ) as string;

        return {
            config: {
                thirdPartyId: 'gitlab',
                clients: [
                    {
                        clientId: gitLabClient,
                        clientSecret: gitLabSecret,
                    },
                ],
            },
        }
    }

    private getLinkedInConfig (): ProviderInput {
        const linkedInClient: string = this.configService.get<string>(
            'LINKEDIN_CLIENT_ID'
        ) as string;

        const linkedInSecret: string = this.configService.get<string>(
            'LINKEDIN_CLIENT_SECRET'
        ) as string;

        return {
            config: {
                thirdPartyId: 'linkedin',
                clients: [
                    {
                        clientId: linkedInClient,
                        clientSecret: linkedInSecret,
                    },
                ],
            },
        }
    }
}
