/**
 * Define los tipos para los items de la API de Hacker News (Firebase).
 */
export type HackerNewsItem = {
    id: number;
    deleted?: boolean;
    type: 'job' | 'story' | 'comment' | 'poll' | 'pollopt';
    by?: string; // Autor
    time: number; // UNIX timestamp
    text?: string; // Contenido (para comentarios/trabajos)
    dead?: boolean;
    parent?: number; // Para comentarios
    kids?: number[]; // IDs de comentarios
    url?: string; // Para historias
    score?: number;
    title?: string;
    parts?: number[]; // Para encuestas
    descendants?: number; // Contador de comentarios
};
