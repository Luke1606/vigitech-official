import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { PrismaService } from '@/common/services/prisma.service';
import { User } from '@prisma/client';

describe('UsersService', () => {
    let service: UsersService;
    let prisma: PrismaService;

    // Mock de un usuario para las pruebas
    const mockUser: User = {
        id: 'uuid-test',
        clerkId: 'user_2XXXXXXXXXXXX',
        createdAt: new Date(),
        updatedAt: new Date(),
    } as User;

    // Mock del PrismaService
    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UsersService, { provide: PrismaService, useValue: mockPrismaService }],
        }).compile();

        service = module.get<UsersService>(UsersService);
        prisma = module.get<PrismaService>(PrismaService);
        jest.clearAllMocks();
    });

    it('debe estar definido', () => {
        expect(service).toBeDefined();
    });

    describe('findByClerkId', () => {
        it('debe llamar a prisma.user.findUnique con el clerkId correcto', async () => {
            const clerkId = 'user_123';
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            const result = await service.findByClerkId(clerkId);

            expect(result).toEqual(mockUser);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { clerkId },
            });
        });

        it('debe devolver null si el usuario no existe', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            const result = await service.findByClerkId('non-existent');
            expect(result).toBeNull();
        });
    });

    describe('signUpNewUser', () => {
        it('debe llamar a prisma.user.create con los datos del nuevo usuario', async () => {
            const clerkId = 'user_new';
            mockPrismaService.user.create.mockResolvedValue({ ...mockUser, clerkId });

            const result = await service.signUpNewUser(clerkId);

            expect(result.clerkId).toBe(clerkId);
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: { clerkId },
            });
        });
    });
});
