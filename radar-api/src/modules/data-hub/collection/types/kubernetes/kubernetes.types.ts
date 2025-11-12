// TODO: Define the specific types for Kubernetes data based on the APIs used (e.g., cloud provider APIs, CNCF projects).
// This file will hold interfaces/types for raw data fetched from Kubernetes-related sources.

export type KubernetesResource = {
    // Example fields, these will need to be refined based on actual API responses
    apiVersion: string;
    kind: string;
    metadata: {
        name: string;
        namespace?: string;
        uid: string;
        creationTimestamp: string;
        labels?: { [key: string]: string };
        annotations?: { [key: string]: string };
    };
    spec: object; // Varies greatly by resource kind
    status: object; // Varies greatly by resource kind
};

export type KubernetesDeployment = KubernetesResource & {
    kind: 'Deployment';
    spec: {
        replicas: number;
        selector: {
            matchLabels: { [key: string]: string };
        };
        template: {
            metadata: {
                labels: { [key: string]: string };
            };
            spec: {
                containers: Array<{
                    name: string;
                    image: string;
                    ports?: Array<{ containerPort: number }>;
                    resources?: object;
                }>;
            };
        };
    };
    status: {
        replicas: number;
        updatedReplicas: number;
        readyReplicas: number;
        availableReplicas: number;
    };
};

// Add more specific Kubernetes resource types as needed (e.g., Service, Pod, Ingress, etc.)
