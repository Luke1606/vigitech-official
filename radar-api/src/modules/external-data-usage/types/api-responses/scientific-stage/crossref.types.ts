export interface CrossrefWork {
  DOI?: string;
  title?: string[];
  publisher?: string;
  'published-print'?: { 'date-parts'?: number[][] };
  abstract?: string;
  author?: Array<{ given?: string; family?: string; sequence?: string }>;
  is_referenced_by_count?: number;
}

export interface CrossrefResponse {
  status: string;
  message: { items: CrossrefWork[] };
}
