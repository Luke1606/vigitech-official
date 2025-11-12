export interface BusinessIntelInsights {
    softwareQuality: {
        functionality: 'compliant' | 'non-compliant';
        reliability: 'compliant' | 'non-compliant';
        usability: 'compliant' | 'non-compliant';
        efficiency: 'compliant' | 'non-compliant';
        maintainability: 'compliant' | 'non-compliant';
        portability: 'compliant' | 'non-compliant';
    };
    developerProductivity: 'high' | 'medium' | 'low';
    userSatisfactionImpact: 'compliant' | 'non-conforming';
    softwareResponsiveness: 'fast' | 'adequate' | 'slow';
    marketInvestment: 'high' | 'medium' | 'low';
    companiesLinkedToTechnology: number;
    technologyAccessLevel: {
        userDeviceRatio: number;
        totalDevicesPerPersonRatio: number;
        accessPerPerson: number;
        technologicalCensus: number;
    };
    dataAnalysisEffectiveness: 'efficient' | 'not-efficient' | 'insufficient';
    predictivePower: {
        marketAnalysis: 'reliable' | 'unreliable';
        supplierAnalysis: 'reliable' | 'unreliable';
    };
    emergingTechnologiesUse: {
        patentsRegistered: number;
        newTechnologiesImplemented: number;
        revenuePercentageFromProductsAndServices: number;
    };
}
