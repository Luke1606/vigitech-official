import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';

describe('PrismaService', () => {
    let service: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PrismaService],
        }).compile();

        service = module.get<PrismaService>(PrismaService);

        // Mockeamos las funciones de la clase base (PrismaClient)
        jest.spyOn(service, '$connect').mockImplementation(async () => undefined);
        jest.spyOn(service, '$disconnect').mockImplementation(async () => undefined);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should call $connect on onModuleInit', async () => {
        const loggerSpy = jest.spyOn(service['logger'], 'log');
        await service.onModuleInit();
        expect(service.$connect).toHaveBeenCalled();
        expect(loggerSpy).toHaveBeenCalledWith('Initialized and connected to database');
    });

    it('should call $disconnect on onModuleDestroy', async () => {
        const loggerSpy = jest.spyOn(service['logger'], 'log');
        await service.onModuleDestroy();
        expect(service.$disconnect).toHaveBeenCalled();
        expect(loggerSpy).toHaveBeenCalledWith('Disconnected from database');
    });
});
