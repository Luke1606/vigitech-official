export type Quadrant = 'scientific' | 'business_intelligence' | 'platforms' | 'languages';

export interface TrendRecord {
  id: string;
  title: string;
  quadrant: Quadrant;
  source: string;
  externalId?: string;
  data?: any;
  metadata?: any;
}
