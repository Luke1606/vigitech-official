export type HuggingFaceModel = {
    modelId: string;
    author: string;
    tags: string[];
    downloads: number;
    lastModified: string;
    likes: number;
};

export type HuggingFaceDataset = {
    id: string;
    author: string;
    downloads: number;
    likes: number;
    tags: string[];
    lastModified: string;
};

export type HuggingFaceSpace = {
    id: string;
    author: string;
    tags: string[];
    likes: number;
    sdk: string;
    lastModified: string;
    url: string;
};
