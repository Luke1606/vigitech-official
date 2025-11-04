/**
 * @file Defines the types for the raw data collected from the Stack Overflow Developer Survey.
 * @description This file contains the type definitions for raw Stack Overflow Developer Survey data,
 *              ensuring type safety and clarity throughout the collection and processing pipeline.
 *              Note: Survey data is typically provided as CSVs, so these types represent the structure
 *              after parsing the CSV into a more usable format (e.g., array of objects).
 */

/**
 * Represents a single record/row from the Stack Overflow Developer Survey data.
 * The actual fields will vary significantly by year and survey version.
 * This is a generic example and should be updated based on the specific survey data schema.
 */
export type StackOverflowSurveyRecord = {
    ResponseId: number;
    Q120: string; // Example: "What is your current employment status?"
    MainBranch: string; // Example: "I am a developer by profession"
    Age: string; // Example: "25-34 years old"
    Employment: string; // Example: "Employed, full-time"
    RemoteWork: string; // Example: "Hybrid (some remote, some in-person)"
    EdLevel: string; // Example: "Bachelor’s degree (B.A., B.S., B.Eng., etc.)"
    YearsCodePro: string; // Example: "10-14 years"
    DevType: string; // Example: "Developer, full-stack;Developer, back-end"
    // ... many other fields representing various survey questions
    LanguageHaveWorkedWith: string; // Example: "JavaScript;Python;TypeScript"
    LanguageWantToWorkWith: string; // Example: "Rust;Go"
    DatabaseHaveWorkedWith: string; // Example: "PostgreSQL;MongoDB"
    DatabaseWantToWorkWith: string; // Example: "Redis"
    PlatformHaveWorkedWith: string; // Example: "AWS;Docker"
    PlatformWantToWorkWith: string; // Example: "Kubernetes"
    WebframeHaveWorkedWith: string; // Example: "React;Node.js"
    WebframeWantToWorkWith: string; // Example: "Next.js"
    MiscTechHaveWorkedWith: string; // Example: "Apache Kafka;Terraform"
    MiscTechWantToWorkWith: string; // Example: "WebAssembly"
    ToolsTechHaveWorkedWith: string; // Example: "Docker;Git"
    ToolsTechWantToWorkWith: string; // Example: "Pulumi"
    // ... and so on for other categories like AI/ML, cloud, etc.
    Country: string;
    // ... other demographic and opinion-based questions
};
