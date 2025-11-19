/**
 * Representa un post/sumisión (t3) en Reddit.
 */
export type RedditPost = {
    id: string;
    name: string;
    title: string;
    selftext: string; // Contenido del cuerpo del post (si es un self-post)
    subreddit: string; // Ej. 'r/MachineLearning'
    author: string;
    created_utc: number; // Marca de tiempo UNIX
    score: number; // Puntuación (upvotes - downvotes)
    upvotes: number; // Añadido para claridad
    downvotes: number; // Añadido para claridad
    num_comments: number;
    permalink: string; // URL interna
    url: string; // URL externa si es un link post
    domain: string; // Dominio de la URL
    is_self: boolean;
    stickied: boolean;
    locked: boolean; // Si la discusión está cerrada
    gilded: number; // Número de premios (medallas)
    // Más campos de metadatos de usuario y NSFW/spoiler
};

/**
 * La estructura de la respuesta de la API que envuelve los posts.
 */
export type RedditListing = {
    kind: 'Listing';
    data: {
        after: string | null;
        before: string | null;
        children: { kind: 't3'; data: RedditPost }[];
    };
};
