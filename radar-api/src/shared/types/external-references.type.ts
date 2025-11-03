/**
 * Define un identificador de un item en una fuente externa específica.
 * Este objeto permite que cualquier API del mismo cuadrante pueda buscar el ítem.
 */
export interface IExternalReference {
    /** Nombre de la API/Fuente (ej: 'GitHub', 'GitLab', 'Kaggle'). */
    source: string;

    /** El identificador único de la API (ej: owner/repo, DOI, item ID). */
    externalId: string;

    /** La URL canónica de la fuente original. */
    url?: string;
}

/**
 * Tipo que se almacena en el campo 'externalReferences' del SurveyItem.
 * Es un array de objetos, uno por cada API que ha identificado o contribuido al item.
 */
export type ExternalReferences = IExternalReference[];
