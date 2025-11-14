import { RawDataSource, RawDataType } from '@prisma/client';

export interface IFetcher {
    fetch(): Promise<object[]>;
    getDataSource(): RawDataSource;
    getDatatype(): RawDataType;
}
