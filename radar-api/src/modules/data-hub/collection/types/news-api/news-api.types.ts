export type NewsArticle = {
    source: {
        id: string | null;
        name: string;
    };
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string | null;
};

export type NewsApiResponse = {
    status: 'ok' | 'error';
    totalResults: number;
    articles: NewsArticle[];
};
