import { Logger } from '@nestjs/common';
import { RawDataSource, RawDataType } from '@prisma/client';
import { IFetcher } from './collection.interfaces';

export abstract class BaseFetcher implements IFetcher {
    protected readonly logger: Logger;

    constructor() {
        this.logger = new Logger(this.constructor.name);
    }

    /**
     * Recopila datos brutos de la fuente externa y los almacena en la tabla RawData.
     */
    public abstract fetch(): Promise<object[]>;
    public abstract getDatatype(): RawDataType;
    public abstract getDataSource(): RawDataSource;
}
