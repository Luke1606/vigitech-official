import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ClerkAuthGuard } from './clerk-auth.guard';
import { UsersService } from '../../user-data/users/users.service';
import { verifyToken } from '@clerk/backend';
import { AuthenticatedRequest } from '@/shared/types/authenticated-request.type';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';

// Mockear @clerk/backend
jest.mock('@clerk/backend', () => ({
    ...jest.requireActual('@clerk/backend'),
    verifyToken: jest.fn(),
}));

const mockClerkClient = {
    users: {
        getUser: jest.fn(),
    },
};

describe('ClerkAuthGuard', () => {
    let guard: ClerkAuthGuard;
    let reflector: Reflector;
    let usersService: UsersService;
    let originalEnv: string | undefined;

    beforeAll(() => {
        originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'test';
    });

    afterAll(() => {
        process.env.NODE_ENV = originalEnv;
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClerkAuthGuard,
                {
                    provide: 'ClerkClient',
                    useValue: mockClerkClient,
                },
                {
                    provide: UsersService,
                    useValue: {
                        findByClerkId: jest.fn(),
                        signUpNewUser: jest.fn(),
                    },
                },
                Reflector,
            ],
        }).compile();

        guard = module.get<ClerkAuthGuard>(ClerkAuthGuard);
        reflector = module.get<Reflector>(Reflector);
        usersService = module.get<UsersService>(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Helper para mockear el contexto de NestJS
    const getMockContext = (request: Partial<AuthenticatedRequest>) =>
        ({
            getHandler: () => {},
            getClass: () => {},
            switchToHttp: () => ({
                getRequest: () => request as AuthenticatedRequest,
            }),
        }) as unknown as ExecutionContext;

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should allow access to public routes', async () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
        const context = getMockContext({});
        expect(await guard.canActivate(context)).toBe(true);
    });

    // =========================================================================
    // Pruebas para entorno TEST (NODE_ENV === 'test')
    // =========================================================================

    it('should throw UnauthorizedException if no x-user-id header is provided in test env', async () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
        const context = getMockContext({ headers: {} });

        await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should authenticate using x-user-id header in test env', async () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
        (usersService.findByClerkId as jest.Mock).mockResolvedValue({
            id: 'db_user_123',
        });

        const context = getMockContext({
            headers: { 'x-user-id': 'clerk_user_123' },
        });

        const request = context.switchToHttp().getRequest();

        expect(await guard.canActivate(context)).toBe(true);
        expect(request.userId).toBe('db_user_123');
        expect(usersService.findByClerkId).toHaveBeenCalledWith('clerk_user_123');
    });

    it('should create a new user if not in DB during test env', async () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
        (usersService.findByClerkId as jest.Mock).mockResolvedValue(null);
        (usersService.signUpNewUser as jest.Mock).mockResolvedValue({
            id: 'new_db_user_123',
        });

        const context = getMockContext({
            headers: { 'x-user-id': 'clerk_user_123' },
        });

        const request = context.switchToHttp().getRequest();

        expect(await guard.canActivate(context)).toBe(true);
        expect(usersService.signUpNewUser).toHaveBeenCalledWith('clerk_user_123');
        expect(request.userId).toBe('new_db_user_123');
    });

    // =========================================================================
    // Pruebas para entorno de PRODUCCIÓN (Simulando NODE_ENV !== 'test')
    // =========================================================================

    it('should throw UnauthorizedException if no token is provided in prod env', async () => {
        // Forzar entorno de producción para esta prueba
        process.env.NODE_ENV = 'production';
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
        const context = getMockContext({ cookies: {}, headers: {} });

        await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);

        // Restaurar entorno
        process.env.NODE_ENV = 'test';
    });

    it('should authenticate with a valid session token in prod env', async () => {
        process.env.NODE_ENV = 'production';
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
        (verifyToken as jest.Mock).mockResolvedValue({ sub: 'user_123' });
        mockClerkClient.users.getUser.mockResolvedValue({
            id: 'user_123',
        });
        (usersService.findByClerkId as jest.Mock).mockResolvedValue({
            id: 'db_user_123',
        });

        const context = getMockContext({
            cookies: { __session: 'valid_token' },
            headers: {},
        });

        expect(await guard.canActivate(context)).toBe(true);
        process.env.NODE_ENV = 'test';
    });

    it('should authenticate with a valid bearer token in prod env', async () => {
        process.env.NODE_ENV = 'production';
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
        (verifyToken as jest.Mock).mockResolvedValue({ sub: 'user_123' });
        mockClerkClient.users.getUser.mockResolvedValue({
            id: 'user_123',
        });
        (usersService.findByClerkId as jest.Mock).mockResolvedValue({
            id: 'db_user_123',
        });

        const context = getMockContext({
            cookies: {},
            headers: { authorization: 'Bearer valid_token' },
        });

        expect(await guard.canActivate(context)).toBe(true);
        process.env.NODE_ENV = 'test';
    });
});
