import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ClerkAuthGuard } from './clerk-auth.guard';
import { UsersService } from '../../user-data/users/users.service';
import { verifyToken } from '@clerk/backend';

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

    const getMockContext = (request: any) =>
        ({
            getHandler: () => {},
            getClass: () => {},
            switchToHttp: () => ({
                getRequest: () => request,
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

    it('should throw UnauthorizedException if no token is provided', async () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
        const context = getMockContext({ cookies: {}, headers: {} });
        await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should authenticate with a valid session token', async () => {
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
    });

    it('should authenticate with a valid bearer token', async () => {
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
    });

    it('should create a new user if not in DB', async () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
        (verifyToken as jest.Mock).mockResolvedValue({ sub: 'user_123' });
        mockClerkClient.users.getUser.mockResolvedValue({
            id: 'user_123',
        });
        (usersService.findByClerkId as jest.Mock).mockResolvedValue(null);
        (usersService.signUpNewUser as jest.Mock).mockResolvedValue({
            id: 'new_db_user_123',
        });

        const context = getMockContext({
            cookies: { __session: 'valid_token' },
            headers: {},
        });
        expect(await guard.canActivate(context)).toBe(true);
        expect(usersService.signUpNewUser).toHaveBeenCalledWith('user_123');
    });

    it('should throw UnauthorizedException for an invalid token', async () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
        (verifyToken as jest.Mock).mockRejectedValue(new Error('Invalid token'));

        const context = getMockContext({
            cookies: { __session: 'invalid_token' },
            headers: {},
        });
        await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });
});
