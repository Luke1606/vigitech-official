/**
 * Define los tipos para la respuesta de la API de Google Books.
 */
export type GoogleBooksVolume = {
    kind: string; // 'books#volume'
    id: string;
    etag: string;
    volumeInfo: {
        title: string;
        authors?: string[];
        publisher?: string;
        publishedDate?: string;
        description?: string;
        categories?: string[];
        averageRating?: number;
        ratingsCount?: number;
        language: string;
        previewLink: string; // URL para previsualizar el libro
    };
    saleInfo: object;
    accessInfo: object;
};
