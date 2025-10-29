export interface LanguagesFrameworksInsights {
    legibleAndElegant: 'impossible-to-write-obfuscated-code' | 'possible-to-write-obfuscated-code';
    simpleAndPowerful: {
        supportsHighLevelObjectsAndDataStructures: boolean;
        includesLibrariesWithUsefulClasses: boolean;
    };
    capacity: number; // Enable large storage volumes
    scripting: {
        numberOfVariables: number;
        commandBehavior: string;
    };
    interoperableCode: {
        platformsWithInteroperableCodes: string[];
        codeOperationVerified: boolean;
    };
    openSource: boolean;
    generalPurpose: boolean;
    functionality: {
        accuracy: 'high' | 'medium' | 'low';
        adequacy: 'high' | 'medium' | 'low';
        interoperability: 'high' | 'medium' | 'low';
        security: 'high' | 'medium' | 'low';
    };
    responseTime: {
        dataInsertionTransaction: 'high' | 'medium' | 'low'; // 1-6 min, 2-4 min, 0-1 min
        updateTransaction: 'high' | 'medium' | 'low'; // 1-6 min, 2-4 min, 0-1 min
        queryTransaction: 'high' | 'medium' | 'low'; // 1-6 min, 2-4 min, 0-1 min
    };
}
