/**
 * @file Tipos consolidados para Stack Exchange (Q/A) y Stack Overflow Developer Survey.
 */

/**
 * Representa un usuario superficial de Stack Exchange (Shallow User).
 */
export type StackExchangeShallowUser = {
    display_name: string;
    reputation: number;
    user_id: number;
    user_type: 'unregistered' | 'registered' | 'moderator' | 'team_admin' | 'does_not_exist';
    profile_image: string;
    link: string;
    accept_rate?: number; // Tasa de aceptación de respuestas (si aplica)
};

/**
 * Representa una Pregunta de Stack Overflow (Question).
 * El campo 'body' es crucial para RAG, por lo que el fetcher debe usar un filtro adecuado.
 */
export type StackExchangeQuestion = {
    question_id: number;
    title: string;
    link: string;
    owner: StackExchangeShallowUser;
    is_answered: boolean;
    view_count: number;
    answer_count: number;
    score: number;
    creation_date: number; // Unix timestamp
    last_activity_date: number; // Unix timestamp
    last_edit_date?: number; // Unix timestamp
    tags: string[];
    body: string; // Contenido completo de la pregunta (Requiere filtro API especial)
    accepted_answer_id?: number;
};

/**
 * Representa una Respuesta de Stack Overflow (Answer).
 */
export type StackExchangeAnswer = {
    answer_id: number;
    question_id: number;
    owner: StackExchangeShallowUser;
    is_accepted: boolean;
    score: number;
    creation_date: number; // Unix timestamp
    last_activity_date: number; // Unix timestamp
    body: string; // Contenido completo de la respuesta (Requiere filtro API especial)
};

/**
 * Wrapper estándar de la API de Stack Exchange.
 */
export type StackOverflowApiWrapper<T> = {
    items: T[];
    has_more: boolean;
    quota_max: number;
    quota_remaining: number;
};

/**
 * Representa un único registro/fila de los datos brutos de la Encuesta de Stack Overflow.
 * Estos campos cubren información demográfica, laboral y tecnológica, crucial para RAG.
 */
export type StackOverflowSurveyRecord = {
    ResponseId: number;
    MainBranch: string; // Ejemplo: "I am a developer by profession"
    Age: string; // Ejemplo: "25-34 years old"
    Employment: string; // Ejemplo: "Employed, full-time"
    EdLevel: string; // Nivel educativo
    YearsCodePro: string; // Años de experiencia profesional
    DevType: string; // Tipos de desarrollador

    // Campos de Preguntas Clave (de la estructura Q120, RemoteWork, etc.)
    Q120: string;
    RemoteWork: string;
    Country: string;

    // Tecnologías utilizadas (cruciales para RAG)
    LanguageHaveWorkedWith: string; // Separado por ';'
    LanguageWantToWorkWith: string;
    DatabaseHaveWorkedWith: string;
    DatabaseWantToWorkWith: string;
    PlatformHaveWorkedWith: string;
    PlatformWantToWorkWith: string;
    WebframeHaveWorkedWith: string;
    WebframeWantToWorkWith: string;
    MiscTechHaveWorkedWith: string;
    MiscTechWantToWorkWith: string;
    ToolsTechHaveWorkedWith: string;
    ToolsTechWantToWorkWith: string;

    [key: string]: any; // Permite campos variables del resto de la encuesta
};
