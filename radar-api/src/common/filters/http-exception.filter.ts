/**
 * Filtro de excepción HTTP global para manejar errores de manera consistente.
 * Captura todas las excepciones HTTP y genera una respuesta de error estandarizada.
 * @class HttpExceptionFilter
 * @implements {ExceptionFilter}
 */
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    /**
     * Maneja la excepción dada y genera una respuesta de error.
     * @param exception La excepción que se va a manejar. Puede ser una `HttpException` o cualquier otro tipo de excepción.
     * @param host Proporciona acceso a los argumentos del controlador de ruta.
     */
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
        };

        response.status(status).json(errorResponse);
    }
}
