export interface PlatformsAndToolsInsights {
    languageTypologyFocusedPlatforms: 'high' | 'medium' | 'low';
    mostUsedCodesOrPrograms: 'high' | 'medium' | 'low';
    toolsWithHigherPerformance: 'high' | 'medium' | 'low';
    mostAdvancedTechnologiesGlobally: {
        leadingToolsInObservatories: number;
        employmentImpactOnObservatories: 'high' | 'medium' | 'low';
    };
    toolsDependingOnEffectiveness: 'feasible' | 'not-feasible';
    mostUsedTechnologyBySector: {
        employmentImpact: 'high' | 'medium' | 'low';
    };
    platformFunctionalities: {
        mostPopularTopics: string[];
        accessLevelToTopics: 'high' | 'medium' | 'low';
        downloadOfTopics: number;
    };
    platformProfitabilityLevel: {
        numberOfTimesUsed: number;
        accessLevel: 'high' | 'medium' | 'low';
        amountOfDischarge: number;
    };
    serverCapacity: {
        storageNumber: number;
        brandAppreciationByCapacityLevel: 'high' | 'medium' | 'low';
        documentWeightIdentification: 'high' | 'medium' | 'low';
    };
    platformSecurity: {
        numberOfRestrictions: number;
        antivirusStatus: 'updated' | 'outdated';
        authorizedPersonnel: number;
        antivirusUpdateLicense: 'active' | 'expired';
    };
}
