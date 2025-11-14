/**
 * Define los tipos para la respuesta de la API de Dev.to.
 */
export type DevToArticle = {
    type_of: string;
    id: number;
    title: string;
    description: string;
    cover_image: string | null;
    readable_publish_date: string;
    url: string; // URL del artículo
    tag_list: string[]; // Tags/Temas
    comments_count: number;
    public_reactions_count: number;
    body_markdown: string; // Contenido completo (si se solicita)
    user: {
        name: string;
        username: string;
    };
};
