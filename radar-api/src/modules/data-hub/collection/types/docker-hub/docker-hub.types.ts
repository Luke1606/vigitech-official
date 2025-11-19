/**
 * Define los tipos para la respuesta de la API de Docker Hub.
 */
export type DockerHubTag = {
    id: number;
    name: string; // Nombre del tag (ej: latest, 1.20)
    full_size: number;
    last_updated: string;
    image_id: string;
    v2: boolean;
};

export type DockerHubRepository = {
    user: string; // Nombre del usuario/organización (ej: library)
    name: string; // Nombre del repositorio (ej: nginx)
    namespace: string;
    repository_type: 'image';
    full_description: string | null;
    full_url: string;
    status: number;
    star_count: number;
    pull_count: number; // Indicador de popularidad
    last_updated: string;
};
