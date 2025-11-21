/**
 * Clase base abstracta para todos los recolectores de datos (`Fetchers`).
 * Proporciona una implementación común de `Logger` y define la interfaz `IFetcher`
 * para la recolección de datos brutos.
 * @class BaseFetcher
 * @implements {IFetcher}
 */
import { Logger } from '@nestjs/common';
import { RawDataSource, RawDataType } from '@prisma/client';
import { IFetcher } from './collection.interfaces';

export abstract class BaseFetcher implements IFetcher {
    protected readonly logger: Logger;

    constructor() {
        this.logger = new Logger(this.constructor.name);
    }

    /**
     * Recopila datos brutos de la fuente externa.
     * Esta es una implementación abstracta y debe ser definida por las clases concretas de Fetcher.
     * @returns Una promesa que resuelve con un array de objetos (`RawData`) recolectados.
     */
    public abstract fetch(): Promise<object[]>;

    /**
     * Obtiene el tipo de dato bruto que este fetcher recolecta.
     * Esta es una implementación abstracta y debe ser definida por las clases concretas de Fetcher.
     * @returns El tipo de dato bruto (`RawDataType`).
     */
    public abstract getDatatype(): RawDataType;

    /**
     * Obtiene la fuente de datos bruta que este fetcher recolecta.
     * Esta es una implementación abstracta y debe ser definida por las clases concretas de Fetcher.
     * @returns La fuente de datos bruta (`RawDataSource`).
     */
    public abstract getDataSource(): RawDataSource;
}
