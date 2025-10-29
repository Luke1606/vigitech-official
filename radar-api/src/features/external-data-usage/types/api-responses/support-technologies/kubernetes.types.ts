export interface KubernetesAPIResource {
    name: string;
    singularName?: string;
    namespaced?: boolean;
    kind?: string;
    verbs?: string[];
}

export interface KubernetesDiscoveryGroup {
    name: string;
    versions: Array<{ groupVersion: string; version: string }>;
}
