export type YouTubeVideoSnippet = {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
        default: { url: string; width: number; height: number };
        medium: { url: string; width: number; height: number };
        high: { url: string; width: number; height: number };
    };
    channelTitle: string;
    tags?: string[];
    categoryId: string;
    liveBroadcastContent: string;
    localized: {
        title: string;
        description: string;
    };
    defaultAudioLanguage?: string;
};

export type YouTubeVideoItem = {
    kind: string;
    etag: string;
    id: string;
    snippet: YouTubeVideoSnippet;
};

export type YouTubeApiResponse = {
    kind: string;
    etag: string;
    nextPageToken?: string;
    prevPageToken?: string;
    pageInfo: {
        totalResults: number;
        resultsPerPage: number;
    };
    items: YouTubeVideoItem[];
};

export type YouTubeTranscriptItem = {
    text: string;
    offset: number;
    duration: number;
};
