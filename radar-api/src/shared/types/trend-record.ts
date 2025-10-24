export type Quadrant =
    | 'scientific'
    | 'business_intelligence'
    | 'platforms'
    | 'languages';

export type TrendRecord = {
    id: string;
    title: string;
    quadrant: Quadrant;
    source: string;
    externalId?: string;
    data?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
};
