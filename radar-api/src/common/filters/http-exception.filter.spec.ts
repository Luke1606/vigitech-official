import { HttpExceptionFilter } from './http-exception.filter';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('HttpExceptionFilter', () => {
    let filter: HttpExceptionFilter;
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    };
    const mockRequest = { url: '/test-path' };
    const mockArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue({
            getResponse: () => mockResponse,
            getRequest: () => mockRequest,
        }),
    } as any;

    beforeEach(() => {
        filter = new HttpExceptionFilter();
        jest.clearAllMocks();
    });

    it('debe manejar HttpException correctamente', () => {
        const status = HttpStatus.BAD_REQUEST;
        const exception = new HttpException('Error de prueba', status);

        filter.catch(exception, mockArgumentsHost);

        expect(mockResponse.status).toHaveBeenCalledWith(status);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: status,
                path: '/test-path',
                timestamp: expect.any(String),
            }),
        );
    });

    it('debe manejar errores desconocidos como 500 Internal Server Error', () => {
        const exception = new Error('Error fatal');

        filter.catch(exception, mockArgumentsHost);

        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: 500,
            }),
        );
    });
});
