export type RedditPost = {
    id: string;
    title: string;
    selftext: string;
    url: string;
    score: number;
    subreddit: string;
    author: string;
    created_utc: number;
};

export type RedditApiResponse = {
    data: {
        children: {
            data: RedditPost;
        }[];
    };
};
