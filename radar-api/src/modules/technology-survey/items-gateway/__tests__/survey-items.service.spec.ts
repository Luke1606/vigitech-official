// /* eslint-disable @typescript-eslint/unbound-method */
// import { Test, TestingModule } from '@nestjs/testing';
// import { SurveyItemsService } from '../survey-items.service';
// import { ItemAnalysisService } from '../../../tech-survey/faltan_por_ubicar/item-analysis/item-analysis.service';
// import {
//     MOCK_USER_ID,
//     MOCK_ITEM_ID,
//     mockSurveyItem,
//     mockItemAnalysis,
//     mockPrismaClient,
//     mockItemAnalysisService,
//     mockUserSubscribedItem,
//     mockUserHiddenItem,
//     mockExternalDataUsageService,
// } from '../../__mocks__/shared.mock';
// import { ExternalDataUsageService } from '../../../tech-survey/faltan_por_ubicar/external-actors/external-data-usage.service';
// import { PrismaService } from '../../../../common/services/prisma.service';

// describe('SurveyItemsService', () => {
//     let service: SurveyItemsService;

//     beforeEach(async () => {
//         const module: TestingModule = await Test.createTestingModule({
//             providers: [
//                 SurveyItemsService,
//                 { provide: PrismaService, useValue: mockPrismaClient },
//                 { provide: ItemAnalysisService, useValue: mockItemAnalysisService },
//                 { provide: ExternalDataUsageService, useValue: mockExternalDataUsageService },
//             ],
//         }).compile();

//         service = module.get<SurveyItemsService>(SurveyItemsService);
//         jest.clearAllMocks();
//     });

//     it('debe estar definido', () => {
//         expect(service).toBeDefined();
//     });

//     describe('findOne', () => {
//         it('debe devolver un item con su último análisis cuando no está oculto', async () => {
//             (mockPrismaClient.surveyItem.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockSurveyItem);
//             mockItemAnalysisService.findLastAnalysisFromItem.mockResolvedValue(mockItemAnalysis);

//             // Mock para asegurar que NO está oculto
//             (mockPrismaClient.userHiddenItem.findUnique as jest.Mock).mockResolvedValue(null);

//             const result = await service.findOne(MOCK_ITEM_ID, MOCK_USER_ID);

//             // La expectativa es el objeto base de SurveyItemWithAnalysisType
//             expect(result).toEqual({
//                 item: mockSurveyItem,
//                 lastAnalysis: mockItemAnalysis,
//             });
//         });

//         it('debe lanzar un error si el item está oculto para el usuario', async () => {
//             (mockPrismaClient.surveyItem.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockSurveyItem);
//             // Mock para asegurar que SÍ está oculto
//             (mockPrismaClient.userHiddenItem.findUnique as jest.Mock).mockResolvedValue(mockUserHiddenItem);

//             await expect(service.findOne(MOCK_ITEM_ID, MOCK_USER_ID)).rejects.toThrow(
//                 `El item de id ${MOCK_ITEM_ID} no está disponible`,
//             );
//         });
//     });

//     describe('subscribeOne', () => {
//         it('debe crear una suscripción y devolver el item', async () => {
//             // Mocks necesarios para que findOne() (llamado internamente) no falle
//             (mockPrismaClient.surveyItem.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockSurveyItem);

//             // CORRECCIÓN 1: Asegurar que NO está oculto para que findOne no lance error
//             (mockPrismaClient.userHiddenItem.findUnique as jest.Mock).mockResolvedValue(null);

//             // CORRECCIÓN 2: Mock para que findOne pueda obtener el lastAnalysis
//             mockItemAnalysisService.findLastAnalysisFromItem.mockResolvedValue(mockItemAnalysis);

//             // Mock de la operación principal y de limpieza
//             (mockPrismaClient.userSubscribedItem.create as jest.Mock).mockResolvedValue(mockUserSubscribedItem);
//             // También se debe mockear la limpieza de registros ocultos
//             (mockPrismaClient.userHiddenItem.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

//             const result = await service.subscribeOne(MOCK_ITEM_ID, MOCK_USER_ID);

//             // Asumiendo que el resultado esperado es `mockSurveyItem` (el ítem base)
//             expect(result).toEqual(mockUserSubscribedItem);

//             // ... (rest of the assertions like create.toHaveBeenCalledWith)
//             expect(mockPrismaClient.userSubscribedItem.create).toHaveBeenCalledWith(
//                 expect.objectContaining({
//                     data: {
//                         userId: MOCK_USER_ID,
//                         itemId: MOCK_ITEM_ID,
//                     },
//                 }),
//             );
//             // Opcional: Verificar que se llamó a deleteMany
//             expect(mockPrismaClient.userHiddenItem.deleteMany).toHaveBeenCalled();
//         });
//     });
// });
