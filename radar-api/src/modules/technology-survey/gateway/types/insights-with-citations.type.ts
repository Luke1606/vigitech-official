export type InsightsWithCitations = {
    insight: string;
    reasoningMetrics: { [key: string]: number | string };
    citedFragmentIds: string[];
};
