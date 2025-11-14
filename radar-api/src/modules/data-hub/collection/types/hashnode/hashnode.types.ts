/**
 * Define los tipos para la respuesta de la API GraphQL de Hashnode.
 */
export type HashnodePost = {
    id: string;
    title: string;
    brief: string;
    slug: string; // URL base
    url: string; // URL completa
    publishedAt: string;
    tags: { name: string }[];
    reactionCount: number;
    responseCount: number; // Comentarios
    author: {
        username: string;
        name: string;
    };
    content: {
        markdown: string; // Contenido completo
        html: string;
    };
};
