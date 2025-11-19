// Basado en la API de Maven Central (Sonatype Nexus Repository Manager)
export type MavenArtifact = {
    id: string; // El identificador único del artefacto
    group: string; // GroupId (ej. 'org.springframework')
    artifact: string; // ArtifactId (ej. 'spring-core')
    version: string; // Versión más reciente
    timestamp: number; // Última actualización (milisegundos)
    tags?: string[]; // Etiquetas o clasificadores
};

export type MavenSearchResponse = {
    response: {
        numFound: number;
        start: number;
        docs: MavenArtifact[];
    };
};
