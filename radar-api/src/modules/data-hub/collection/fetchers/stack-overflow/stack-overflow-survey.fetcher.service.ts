import csv from 'csv-parser';
import { lastValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RawDataSource, RawDataType } from '@prisma/client';
import { StackOverflowSurveyRecord } from '../../types/stack-overflow/stack-overflow.types';
import { BaseFetcher } from '../../base.fetcher';

@Injectable()
export class StackOverflowSurveyDataFetcher extends BaseFetcher {
    private readonly REPORT_DATA_URL =
        'https://raw.githubusercontent.com/stackoverflow/survey/master/survey_results_2023.csv';

    constructor(private readonly httpService: HttpService) {
        super();
    }

    getDataSource(): RawDataSource {
        return RawDataSource.STACK_OVERFLOW_SURVEY;
    }
    getDatatype(): RawDataType {
        return RawDataType.REPORT_OR_PRODUCT;
    }

    async fetch(): Promise<StackOverflowSurveyRecord[]> {
        this.logger.log('Collecting Stack Overflow Survey raw data via CSV stream...');

        const records: StackOverflowSurveyRecord[] = [];

        try {
            // 1. Iniciar la solicitud como un STREAM (crucial para archivos grandes)
            const response = await lastValueFrom(
                this.httpService.get(this.REPORT_DATA_URL, {
                    responseType: 'stream',
                }),
            );

            const dataStream = response.data;

            if (!dataStream) {
                throw new Error('Data stream is unavailable.');
            }

            // 2. Procesamiento del Stream
            await new Promise<void>((resolve, reject) => {
                // Inicia el parseo CSV y lo conecta a la tubería (pipe)
                dataStream
                    .pipe(csv())
                    .on('data', (data: any) => {
                        const record: StackOverflowSurveyRecord = {
                            ResponseId: parseInt(data.ResponseId, 10) || 0,
                            MainBranch: data.MainBranch || '',
                            Age: data.Age || '',
                            Employment: data.Employment || '',
                            EdLevel: data.EdLevel || '',
                            YearsCodePro: data.YearsCodePro || '',
                            DevType: data.DevType || '',
                            Q120: data.Q120 || '',
                            RemoteWork: data.RemoteWork || '',
                            Country: data.Country || '',
                            LanguageHaveWorkedWith: data.LanguageHaveWorkedWith || '',
                            DatabaseHaveWorkedWith: data.DatabaseHaveWorkedWith || '',
                            WebframeHaveWorkedWith: data.WebframeHaveWorkedWith || '',
                            MiscTechHaveWorkedWith: data.MiscTechHaveWorkedWith || '',
                            // Incluye el resto de campos variables
                            ...data,
                        };
                        records.push(record);
                    })
                    .on('end', () => {
                        this.logger.log(`Successfully collected ${records.length} survey records via stream.`);
                        resolve();
                    })
                    .on('error', (err: Error) => {
                        this.logger.error('Error during CSV stream processing', err);
                        reject(err);
                    });
            });

            return records;
        } catch (error: unknown) {
            this.logger.error('Failed to fetch or process SO Survey data. Check URL and connectivity.', error);
            return [];
        }
    }
}
