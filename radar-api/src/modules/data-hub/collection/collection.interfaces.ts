/**
 * Interfaz para definir el contrato de un recolector de datos (`Fetcher`).
 * Todos los fetchers deben implementar esta interfaz para ser utilizados por `CollectionService`.
 * @interface IFetcher
 */
import { RawDataSource, RawDataType } from '@prisma/client';

export interface IFetcher {
    /**
     * Realiza la recolección de datos de una fuente externa.
     * @returns Una promesa que resuelve con un array de objetos (`RawData`) recolectados.
     */
    fetch(): Promise<object[]>;

    /**
     * Obtiene la fuente de datos bruta que este fetcher recolecta.
     * @returns La fuente de datos bruta (`RawDataSource`).
     */
    getDataSource(): RawDataSource;

    /**
     * Obtiene el tipo de dato bruto que este fetcher recolecta.
     * @returns El tipo de dato bruto (`RawDataType`).
     */
    getDatatype(): RawDataType;
}
