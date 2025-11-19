export type NpmPackage = {
    name: string;
    scope: string;
    version: string;
    description: string;
    date: string;
    links: {
        npm: string;
        repository?: string;
    };
    publisher: {
        username: string;
        email: string;
    };
    maintainers: {
        username: string;
        email: string;
    }[];
    downloads?: number;
};

export type NpmSearchResponse = {
    objects: {
        package: NpmPackage;
    }[];
    total: number;
};

export type NpmDownloadsResponse = {
    downloads: number;
    start: string;
    end: string;
    package: string;
};
