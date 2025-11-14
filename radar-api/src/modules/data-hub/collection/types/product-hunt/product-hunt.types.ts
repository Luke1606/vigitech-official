export type ProductHuntMaker = {
    id: number;
    name: string;
    headline: string;
    username: string;
    // Más campos de usuario podrían ser relevantes:
    twitterUsername?: string;
};

export type ProductHuntTopic = {
    name: string;
    slug?: string;
};

/**
 * Representa un Producto listado en Product Hunt.
 */
export type ProductHuntProduct = {
    id: string; // Usando el ID de cadena para consistencia
    name: string;
    tagline: string; // Descripción corta
    description: string; // Descripción larga (si se obtiene del endpoint completo)
    slug: string; // URL amigable
    website: string; // Enlace primario
    url: string; // URL en Product Hunt
    votesCount: number; // Métrica clave
    createdAt: string;
    makers: ProductHuntMaker[]; // Quién lo hizo
    topics: ProductHuntTopic[];
    thumbnail: {
        url: string; // URL de la imagen principal
    };
    commentsCount?: number; // Añadido para métricas de discusión
    upvoters: { username: string }[]; // Representación de quienes votaron (si la API lo permite)
};

export type ProductHuntApiResponse = {
    data: {
        posts: {
            edges: {
                node: ProductHuntProduct;
            }[];
        };
    };
};
