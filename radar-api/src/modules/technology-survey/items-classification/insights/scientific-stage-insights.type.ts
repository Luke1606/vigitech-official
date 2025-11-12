export interface ScientificStageInsights {
    informationFlowsAndCommunicationChannels: {
        mainDirections: string[];
        mostUsedCommunicationChannels: string[];
        developmentTrends: 'high-impact' | 'medium-impact' | 'low-impact';
    };
    mostProductiveAuthorsCompaniesAndInstitutions: {
        relevanceXProductivity: 'high' | 'medium' | 'low';
        internationalRankingPosition: number;
    };
    leadersByTheme: {
        theme: string;
        positioning: 'high' | 'medium' | 'low';
    }[];
    authorAndInstitutionalCollaborationNetworks: {
        totalPlatformsUsingLanguage: 'high' | 'medium' | 'low';
    };
    totalDocumentsByTopic: number;
    authorshipLevel: number;
    authorByGenre: {
        femaleAuthors: number;
        maleAuthors: number;
    };
    authorshipByInstitution: number;
    mostCitedPublications: {
        alertsIndicatingCitation: number;
        citationPercentage: 'above-75' | 'between-74-50' | 'below-45';
    };
    mostReferencedPublications: {
        alertsIndicatingReference: number;
        positioningTable: string[]; // Descending order of referencing
    };
    publicationsIndexedInTopLevelJournals: number;
    informationNiches: {
        numberOfInformationNicheAlerts: number;
        developmentTopicsPositioning: 'relevant' | 'featured' | 'minor-relevance';
    };
}
