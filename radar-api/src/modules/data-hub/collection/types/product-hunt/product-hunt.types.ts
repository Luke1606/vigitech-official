export type ProductHuntPost = {
    id: string;
    name: string;
    tagline: string;
    description: string;
    topics: { name: string }[];
    votesCount: number;
    url: string;
    website: string;
    thumbnail: { url: string };
    createdAt: string;
};

export type ProductHuntApiResponse = {
    data: {
        posts: {
            edges: {
                node: ProductHuntPost;
            }[];
        };
    };
};
