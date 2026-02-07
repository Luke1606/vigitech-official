import { RadarQuadrant, RadarRing, SurveyItem } from '../../infrastructure';

export const blips: SurveyItem[] = [
    // CUADRANTE: LANGUAGES_AND_FRAMEWORKS (8 items - 2 por anillo)
    {
        createdAt: "2024-01-15T10:30:00Z",
        id: 'e7b1f8f0-3c4a-4b1a-9d2e-1a2b3c4d5e01',
        insertedById: 'user-123',
        itemField: RadarQuadrant.LANGUAGES_AND_FRAMEWORKS,
        latestClassification: {
            id: '58502ac0-2146-4a92-923b-cd49e019eee5',
            analyzedAt: '2024-01-15T10:30:00Z',
            itemId: 'e7b1f8f0-3c4a-4b1a-9d2e-1a2b3c4d5e01',
            classification: RadarRing.ADOPT,
            insightsValues: {
                citedFragmentIds: [
                    'e900139f-2488-476d-b98e-f45d22e19d0f',
                    '66473fb0-beda-4566-bfd5-742bd84c864c'
                ],
                insight: 'TypeScript continúa siendo el estándar para desarrollo frontend y backend con Node.js.',
                reasoningMetrics: {
                    typescript_adoption_q3: 0.85,
                    javascript_error_reduction: 0.65
                }
            }
        },
        latestClassificationId: '58502ac0-2146-4a92-923b-cd49e019eee5',
        summary: 'Superconjunto tipado de JavaScript que compila a JavaScript plano.',
        title: 'TypeScript',
        updatedAt: '2024-01-15T10:30:00Z'
    },
    {
        createdAt: "2024-01-19T13:30:00Z",
        id: '9234507f-3b28-4d6e-9f9b-7b6c5d4e8c17',
        insertedById: 'user-789',
        itemField: RadarQuadrant.LANGUAGES_AND_FRAMEWORKS,
        latestClassification: {
            id: '98545eg4-6580-8ed6-d67f-gb8d4e54e49',
            analyzedAt: '2024-01-19T13:30:00Z',
            itemId: '9234507f-3b28-4d6e-9f9b-7b6c5d4e8c17',
            classification: RadarRing.ADOPT,
            insightsValues: {
                citedFragmentIds: [
                    'j23457d3-68cc-8ba1-fdc2-k90i77i6e46k',
                    '997a6ie5-ehid-7899-eig8-a75eg17fb97f'
                ],
                insight: 'Go se consolida como la opción preferida para microservicios.',
                reasoningMetrics: {
                    go_microservices_adoption: 0.72,
                    cli_tools_market_share: 0.68
                }
            }
        },
        latestClassificationId: '98545eg4-6580-8ed6-d67f-gb8d4e54e49',
        summary: 'Lenguaje de programación compilado, concurrente, con recolector de basura.',
        title: 'Go',
        updatedAt: '2024-01-19T13:30:00Z'
    },
    {
        createdAt: "2024-01-16T14:20:00Z",
        id: 'a3f2d9c8-9b2a-4e5f-8a1b-2c3d4e5f6a02',
        insertedById: null,
        itemField: RadarQuadrant.LANGUAGES_AND_FRAMEWORKS,
        latestClassification: {
            id: '68512bd1-3257-5ba3-a34c-de5af1b21b16',
            analyzedAt: '2024-01-16T14:20:00Z',
            itemId: 'a3f2d9c8-9b2a-4e5f-8a1b-2c3d4e5f6a02',
            classification: RadarRing.TEST,
            insightsValues: {
                citedFragmentIds: [
                    'f90124a0-3599-587e-ca9f-g56e33e2a02g',
                    '77584gc1-cfeb-5677-cge6-853ce95d975d'
                ],
                insight: 'Rust muestra crecimiento en proyectos donde la seguridad de memoria es crítica.',
                reasoningMetrics: {
                    rust_adoption_q3: 0.12,
                    memory_safety_incidents: 0.05
                }
            }
        },
        latestClassificationId: '68512bd1-3257-5ba3-a34c-de5af1b21b16',
        summary: 'Lenguaje de programación multiparadigma con seguridad de memoria.',
        title: 'Rust',
        updatedAt: '2024-01-16T14:20:00Z'
    },
    {
        createdAt: "2024-01-20T16:10:00Z",
        id: 'a3456180-2c17-4e5f-8a0b-8c7d6e5f9d18',
        insertedById: null,
        itemField: RadarQuadrant.LANGUAGES_AND_FRAMEWORKS,
        latestClassification: {
            id: '08556fh5-7691-9fe7-e78g-hc9e5f65f5a',
            analyzedAt: '2024-01-20T16:10:00Z',
            itemId: 'a3456180-2c17-4e5f-8a0b-8c7d6e5f9d18',
            classification: RadarRing.TEST,
            insightsValues: {
                citedFragmentIds: [
                    'l34568e4-79dd-9cb2-ged4-m12k99k8g68m',
                    'm9456dh5-9c1h-9c55-ged5-n23l00l9h79n'
                ],
                insight: 'Elm mantiene nicho en aplicaciones frontend con seguridad de tipos.',
                reasoningMetrics: {
                    elm_frontend_reliability: 0.95,
                    runtime_errors_reduction: 0.88
                }
            }
        },
        latestClassificationId: '08556fh5-7691-9fe7-e78g-hc9e5f65f5a',
        summary: 'Lenguaje de programación funcional para construir aplicaciones web.',
        title: 'Elm',
        updatedAt: '2024-01-20T16:10:00Z'
    },
    {
        createdAt: "2024-01-17T09:15:00Z",
        id: 'b4c3d2e1-7f6a-4b5c-9d8e-3f2a1b0c4d03',
        insertedById: 'user-456',
        itemField: RadarQuadrant.LANGUAGES_AND_FRAMEWORKS,
        latestClassification: {
            id: '78523ce2-4368-6cb4-b45d-ef6b2c32c27',
            analyzedAt: '2024-01-17T09:15:00Z',
            itemId: 'b4c3d2e1-7f6a-4b5c-9d8e-3f2a1b0c4d03',
            classification: RadarRing.SUSTAIN,
            insightsValues: {
                citedFragmentIds: [
                    'g01235b1-46aa-698f-dba0-h67f44f3b13h',
                    '88695hd2-dgfc-6788-dhf7-964df06ea86e'
                ],
                insight: 'Kotlin mantiene posición dominante en desarrollo Android.',
                reasoningMetrics: {
                    kotlin_android_market_share: 0.78,
                    spring_boot_adoption: 0.45
                }
            }
        },
        latestClassificationId: '78523ce2-4368-6cb4-b45d-ef6b2c32c27',
        summary: 'Lenguaje de programación multiplataforma que se ejecuta en la JVM.',
        title: 'Kotlin',
        updatedAt: '2024-01-17T09:15:00Z'
    },
    {
        createdAt: "2024-01-24T11:20:00Z",
        id: 'add1-new2-0000-0000-000000000002',
        insertedById: 'user-303',
        itemField: RadarQuadrant.LANGUAGES_AND_FRAMEWORKS,
        latestClassification: {
            id: '48590jl9-bad5-d3ib-ibkc-lg3i9j09j9e',
            analyzedAt: '2024-01-24T11:20:00Z',
            itemId: 'add1-new2-0000-0000-000000000002',
            classification: RadarRing.SUSTAIN,
            insightsValues: {
                citedFragmentIds: [
                    't78902i8-bd11-egf6-lji1-u90s77s6o46u',
                    'u2789gk8-cf4k-cf88-lji2-v01t88t7p57v'
                ],
                insight: 'Java mantiene posición en aplicaciones empresariales.',
                reasoningMetrics: {
                    enterprise_adoption: 0.75,
                    spring_framework_usage: 0.68
                }
            }
        },
        latestClassificationId: '48590jl9-bad5-d3ib-ibkc-lg3i9j09j9e',
        summary: 'Lenguaje de programación orientado a objetos de propósito general.',
        title: 'Java',
        updatedAt: '2024-01-24T11:20:00Z'
    },
    {
        createdAt: "2024-01-18T11:45:00Z",
        id: 'c5d4e3f2-6a5b-4c3d-8e7f-4a3b2c1d5e04',
        insertedById: null,
        itemField: RadarQuadrant.LANGUAGES_AND_FRAMEWORKS,
        latestClassification: {
            id: '88534df3-5479-7dc5-c56e-fa7c3d43d38',
            analyzedAt: '2024-01-18T11:45:00Z',
            itemId: 'c5d4e3f2-6a5b-4c3d-8e7f-4a3b2c1d5e04',
            classification: RadarRing.HOLD,
            insightsValues: {
                citedFragmentIds: [
                    'i12346c2-57bb-7a90-ecb1-j89h66h5d35j'
                ],
                insight: 'Perl continúa su declive en adopción.',
                reasoningMetrics: {
                    perl_legacy_systems: 0.92,
                    new_projects_adoption: 0.03
                }
            }
        },
        latestClassificationId: '88534df3-5479-7dc5-c56e-fa7c3d43d38',
        summary: 'Lenguaje de programación de alto nivel para manipulación de texto.',
        title: 'Perl',
        updatedAt: '2024-01-18T11:45:00Z'
    },
    {
        createdAt: "2024-01-22T14:45:00Z",
        id: 'c56783a2-0e15-4e39-8c2d-0e9f8a7b1f20',
        insertedById: null,
        itemField: RadarQuadrant.LANGUAGES_AND_FRAMEWORKS,
        latestClassification: {
            id: '28578hj7-98b3-b1g9-g9ai-je1g7h87h7c',
            analyzedAt: '2024-01-22T14:45:00Z',
            itemId: 'c56783a2-0e15-4e39-8c2d-0e9f8a7b1f20',
            classification: RadarRing.HOLD,
            insightsValues: {
                citedFragmentIds: [
                    'p56780g6-9bff-bed4-igf8-q56o33o2k02q'
                ],
                insight: 'Visual Basic .NET se mantiene en aplicaciones legacy de Windows.',
                reasoningMetrics: {
                    legacy_windows_apps: 0.87,
                    new_development_adoption: 0.02
                }
            }
        },
        latestClassificationId: '28578hj7-98b3-b1g9-g9ai-je1g7h87h7c',
        summary: 'Lenguaje de programación orientado a objetos desarrollado por Microsoft.',
        title: 'Visual Basic',
        updatedAt: '2024-01-22T14:45:00Z'
    },

    // CUADRANTE: BUSSINESS_INTEL (8 items - 2 por anillo)
    {
        createdAt: "2024-02-01T09:00:00Z",
        id: 'd1e2f3a4-b5c6-4d7e-8f9a-0b1c2d3e4f5a',
        insertedById: 'user-404',
        itemField: RadarQuadrant.BUSSINESS_INTEL,
        latestClassification: {
            id: '5950aac1-2246-4b92-a23b-cd49e029eee6',
            analyzedAt: '2024-02-01T09:00:00Z',
            itemId: 'd1e2f3a4-b5c6-4d7e-8f9a-0b1c2d3e4f5a',
            classification: RadarRing.ADOPT,
            insightsValues: {
                citedFragmentIds: [
                    'v89013af-2588-486e-ca8f-g45d22e29d0g',
                    '77484hc1-cfdb-4667-cge7-852ce95d875e'
                ],
                insight: 'Tableau se consolida como herramienta líder en visualización de datos.',
                reasoningMetrics: {
                    tableau_adoption_rate: 0.68,
                    data_visualization_efficiency: 0.75
                }
            }
        },
        latestClassificationId: '5950aac1-2246-4b92-a23b-cd49e029eee6',
        summary: 'Plataforma de visualización de datos interactiva para business intelligence.',
        title: 'Tableau',
        updatedAt: '2024-02-01T09:00:00Z'
    },
    {
        createdAt: "2024-02-25T14:20:00Z",
        id: 'd5e6f7a8-b9c0-4d1e-2f3a-4b5c6d7e8f9a',
        insertedById: 'user-1818',
        itemField: RadarQuadrant.BUSSINESS_INTEL,
        latestClassification: {
            id: '9x8oyyzo-qqr0-s9xq-y7rz-aw9yozfpz5u',
            analyzedAt: '2024-02-25T14:20:00Z',
            itemId: 'd5e6f7a8-b9c0-4d1e-2f3a-4b5c6d7e8f9a',
            classification: RadarRing.ADOPT,
            insightsValues: {
                citedFragmentIds: [
                    'b01246gl-xc44-afb0-igf5-q12p00p9l80q'
                ],
                insight: 'Git se consolida como estándar absoluto para control de versiones.',
                reasoningMetrics: {
                    version_control_market_share: 0.98,
                    distributed_version_control: 0.95
                }
            }
        },
        latestClassificationId: '9x8oyyzo-qqr0-s9xq-y7rz-aw9yozfpz5u',
        summary: 'Sistema de control de versiones distribuido, estándar de la industria.',
        title: 'Git',
        updatedAt: '2024-02-25T14:20:00Z'
    },
    {
        createdAt: "2024-02-02T11:30:00Z",
        id: 'e2f3a4b5-c6d7-4e8f-9a0b-1c2d3e4f5a6b',
        insertedById: null,
        itemField: RadarQuadrant.BUSSINESS_INTEL,
        latestClassification: {
            id: '6a51bbd2-3357-5ca3-b44c-de5bf1c21b17',
            analyzedAt: '2024-02-02T11:30:00Z',
            itemId: 'e2f3a4b5-c6d7-4e8f-9a0b-1c2d3e4f5a6b',
            classification: RadarRing.TEST,
            insightsValues: {
                citedFragmentIds: [
                    'w90135bg-3699-598f-dba1-h67g44f4b14h'
                ],
                insight: 'Looker Studio muestra crecimiento en integración con Google Cloud.',
                reasoningMetrics: {
                    google_cloud_integration: 0.82,
                    free_tier_adoption: 0.65
                }
            }
        },
        latestClassificationId: '6a51bbd2-3357-5ca3-b44c-de5bf1c21b17',
        summary: 'Herramienta de BI de Google para crear dashboards y reportes interactivos.',
        title: 'Looker Studio',
        updatedAt: '2024-02-02T11:30:00Z'
    },
    {
        createdAt: "2024-02-26T16:35:00Z",
        id: 'e6f7a8b9-c0d1-4e2f-3a4b-5c6d7e8f9a0b',
        insertedById: null,
        itemField: RadarQuadrant.BUSSINESS_INTEL,
        latestClassification: {
            id: '0y9pzzap-rrs1-t0yr-z8sa-bx0zpagqa6v',
            analyzedAt: '2024-02-26T16:35:00Z',
            itemId: 'e6f7a8b9-c0d1-4e2f-3a4b-5c6d7e8f9a0b',
            classification: RadarRing.TEST,
            insightsValues: {
                citedFragmentIds: [
                    'c12357hm-yd55-bgc1-jhg6-r23q11q0m91r'
                ],
                insight: 'GitHub Actions crece como solución de CI/CD integrada.',
                reasoningMetrics: {
                    integrated_ci_cd_adoption: 0.72,
                    github_ecosystem: 0.88
                }
            }
        },
        latestClassificationId: '0y9pzzap-rrs1-t0yr-z8sa-bx0zpagqa6v',
        summary: 'Plataforma de automatización de CI/CD integrada con GitHub.',
        title: 'GitHub Actions',
        updatedAt: '2024-02-26T16:35:00Z'
    },
    {
        createdAt: "2024-02-03T14:45:00Z",
        id: 'f3a4b5c6-d7e8-4f9a-0b1c-2d3e4f5a6b7c',
        insertedById: 'user-505',
        itemField: RadarQuadrant.BUSSINESS_INTEL,
        latestClassification: {
            id: '7b62cce3-4468-6db4-c55d-ef6c2d33c28',
            analyzedAt: '2024-02-03T14:45:00Z',
            itemId: 'f3a4b5c6-d7e8-4f9a-0b1c-2d3e4f5a6b7c',
            classification: RadarRing.SUSTAIN,
            insightsValues: {
                citedFragmentIds: [
                    'x01246ch-47aa-6a90-ecb2-j89h77h6d36j',
                    'y12357di-58bb-7ba1-fdc3-k90i88i7e47k'
                ],
                insight: 'Power BI mantiene fuerte presencia en entornos corporativos Microsoft.',
                reasoningMetrics: {
                    enterprise_microsoft_adoption: 0.78,
                    office_365_integration: 0.85
                }
            }
        },
        latestClassificationId: '7b62cce3-4468-6db4-c55d-ef6c2d33c28',
        summary: 'Suite de business analytics de Microsoft para visualización de datos.',
        title: 'Power BI',
        updatedAt: '2024-02-03T14:45:00Z'
    },
    {
        createdAt: "2024-02-27T10:10:00Z",
        id: 'f7a8b9c0-d1e2-4f3a-4b5c-6d7e8f9a0b1c',
        insertedById: 'user-1919',
        itemField: RadarQuadrant.BUSSINESS_INTEL,
        latestClassification: {
            id: '1z0qaaqb-sst2-u1zs-a9tb-cy1aqbhrb7w',
            analyzedAt: '2024-02-27T10:10:00Z',
            itemId: 'f7a8b9c0-d1e2-4f3a-4b5c-6d7e8f9a0b1c',
            classification: RadarRing.SUSTAIN,
            insightsValues: {
                citedFragmentIds: [
                    'd23468in-ze66-chd2-kih7-s34r22r1n02s',
                    'e34579jo-af77-die3-lji8-t45s33s2o13t'
                ],
                insight: 'Ansible simplifica la automatización de infraestructura.',
                reasoningMetrics: {
                    infrastructure_as_code: 0.75,
                    configuration_management: 0.82
                }
            }
        },
        latestClassificationId: '1z0qaaqb-sst2-u1zs-a9tb-cy1aqbhrb7w',
        summary: 'Herramienta de automatización de TI para gestión de configuración.',
        title: 'Ansible',
        updatedAt: '2024-02-27T10:10:00Z'
    },
    {
        createdAt: "2024-02-04T10:15:00Z",
        id: 'a4b5c6d7-e8f9-4a0b-1c2d-3e4f5a6b7c8d',
        insertedById: null,
        itemField: RadarQuadrant.BUSSINESS_INTEL,
        latestClassification: {
            id: '8c73ddf4-5579-7ec5-d66e-fa8d3e54d39',
            analyzedAt: '2024-02-04T10:15:00Z',
            itemId: 'a4b5c6d7-e8f9-4a0b-1c2d-3e4f5a6b7c8d',
            classification: RadarRing.HOLD,
            insightsValues: {
                citedFragmentIds: [
                    'z23468ej-69cc-8cb2-ged5-m12l99l9h79m'
                ],
                insight: 'Crystal Reports muestra declive frente a soluciones modernas de BI.',
                reasoningMetrics: {
                    legacy_system_usage: 0.45,
                    modern_bi_replacement: 0.90
                }
            }
        },
        latestClassificationId: '8c73ddf4-5579-7ec5-d66e-fa8d3e54d39',
        summary: 'Herramienta de reporting empresarial de SAP.',
        title: 'Crystal Reports',
        updatedAt: '2024-02-04T10:15:00Z'
    },
    {
        createdAt: "2024-02-28T12:25:00Z",
        id: 'a8b9c0d1-e2f3-4a4b-5c6d-7e8f9a0b1c2d',
        insertedById: null,
        itemField: RadarQuadrant.BUSSINESS_INTEL,
        latestClassification: {
            id: '2a1rbbrc-ttu3-v2at-b0uc-dz2brcisc8x',
            analyzedAt: '2024-02-28T12:25:00Z',
            itemId: 'a8b9c0d1-e2f3-4a4b-5c6d-7e8f9a0b1c2d',
            classification: RadarRing.HOLD,
            insightsValues: {
                citedFragmentIds: [
                    'f45680kp-bg88-ejf4-mkj9-u56t44t3p24u'
                ],
                insight: 'Puppet muestra declive frente a soluciones de automatización más modernas.',
                reasoningMetrics: {
                    legacy_configuration_tool: 0.35,
                    modern_alternatives_adoption: 0.82
                }
            }
        },
        latestClassificationId: '2a1rbbrc-ttu3-v2at-b0uc-dz2brcisc8x',
        summary: 'Herramienta de gestión de configuración y automatización de infraestructura.',
        title: 'Puppet',
        updatedAt: '2024-02-28T12:25:00Z'
    },

    // CUADRANTE: SCIENTIFIC_STAGE (8 items - 2 por anillo)
    {
        createdAt: "2024-02-11T08:30:00Z",
        id: 'b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e',
        insertedById: 'user-1010',
        itemField: RadarQuadrant.SCIENTIFIC_STAGE,
        latestClassification: {
            id: '5j4akkla-ccd6-e5jc-k3dl-mi5kal1bl1g',
            analyzedAt: '2024-02-11T08:30:00Z',
            itemId: 'b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e',
            classification: RadarRing.ADOPT,
            insightsValues: {
                citedFragmentIds: [
                    'i12357ns-ei55-hlk1-pnm6-x23w11w0s91x',
                    'j23468ot-fj66-iml2-qon7-y34x22x1t02y'
                ],
                insight: 'TensorFlow lidera en proyectos de machine learning y deep learning.',
                reasoningMetrics: {
                    ml_research_adoption: 0.85,
                    production_deployment: 0.72
                }
            }
        },
        latestClassificationId: '5j4akkla-ccd6-e5jc-k3dl-mi5kal1bl1g',
        summary: 'Framework open source de machine learning desarrollado por Google.',
        title: 'TensorFlow',
        updatedAt: '2024-02-11T08:30:00Z'
    },
    {
        createdAt: "2024-02-15T09:15:00Z",
        id: 'f5a6b7c8-d9e0-4f1a-2b3c-4d5e6f7a8b9c',
        insertedById: 'user-1212',
        itemField: RadarQuadrant.SCIENTIFIC_STAGE,
        latestClassification: {
            id: '9n8eooqe-ggh0-i9ng-o7hp-qm9oep5fp5k',
            analyzedAt: '2024-02-15T09:15:00Z',
            itemId: 'f5a6b7c8-d9e0-4f1a-2b3c-4d5e6f7a8b9c',
            classification: RadarRing.ADOPT,
            insightsValues: {
                citedFragmentIds: [
                    'o78913ty-kp11-nrq7-vts2-d89c77c6y57d'
                ],
                insight: 'Jupyter Notebooks se convierte en estándar para data science y educación.',
                reasoningMetrics: {
                    data_science_education: 0.92,
                    interactive_computing: 0.88
                }
            }
        },
        latestClassificationId: '9n8eooqe-ggh0-i9ng-o7hp-qm9oep5fp5k',
        summary: 'Aplicación web para crear y compartir documentos con código y visualizaciones.',
        title: 'Jupyter Notebooks',
        updatedAt: '2024-02-15T09:15:00Z'
    },
    {
        createdAt: "2024-02-12T10:45:00Z",
        id: 'c2d3e4f5-a6b7-4c8d-9e0f-1a2b3c4d5e6f',
        insertedById: null,
        itemField: RadarQuadrant.SCIENTIFIC_STAGE,
        latestClassification: {
            id: '6k5bllmb-dde7-f6kd-l4em-nj6lbm2cm2h',
            analyzedAt: '2024-02-12T10:45:00Z',
            itemId: 'c2d3e4f5-a6b7-4c8d-9e0f-1a2b3c4d5e6f',
            classification: RadarRing.TEST,
            insightsValues: {
                citedFragmentIds: [
                    'k34579pu-gk77-jnm3-rpo8-z45y33y2u13z'
                ],
                insight: 'PyTorch gana terreno en investigación académica por su flexibilidad.',
                reasoningMetrics: {
                    academic_research_usage: 0.88,
                    dynamic_graph_adoption: 0.65
                }
            }
        },
        latestClassificationId: '6k5bllmb-dde7-f6kd-l4em-nj6lbm2cm2h',
        summary: 'Framework de machine learning de Facebook con enfoque en investigación.',
        title: 'PyTorch',
        updatedAt: '2024-02-12T10:45:00Z'
    },
    {
        createdAt: "2024-02-16T11:30:00Z",
        id: 'a6b7c8d9-e0f1-4a2b-3c4d-5e6f7a8b9c0d',
        insertedById: null,
        itemField: RadarQuadrant.SCIENTIFIC_STAGE,
        latestClassification: {
            id: '0o9fpprf-hhi1-j0oh-p8iq-rn0pfq6gq6l',
            analyzedAt: '2024-02-16T11:30:00Z',
            itemId: 'a6b7c8d9-e0f1-4a2b-3c4d-5e6f7a8b9c0d',
            classification: RadarRing.TEST,
            insightsValues: {
                citedFragmentIds: [
                    'p89024uz-lq22-ost8-wut3-e90d88d7z68e'
                ],
                insight: 'Apache Spark escala en procesamiento de big data para ciencia de datos.',
                reasoningMetrics: {
                    big_data_processing: 0.85,
                    distributed_computing: 0.78
                }
            }
        },
        latestClassificationId: '0o9fpprf-hhi1-j0oh-p8iq-rn0pfq6gq6l',
        summary: 'Motor de procesamiento de datos unificado para big data.',
        title: 'Apache Spark',
        updatedAt: '2024-02-16T11:30:00Z'
    },
    {
        createdAt: "2024-02-13T13:20:00Z",
        id: 'd3e4f5a6-b7c8-4d9e-0f1a-2b3c4d5e6f7a',
        insertedById: 'user-1111',
        itemField: RadarQuadrant.SCIENTIFIC_STAGE,
        latestClassification: {
            id: '7l6cmmnc-eef8-g7le-m5fn-ok7mcn3dn3i',
            analyzedAt: '2024-02-13T13:20:00Z',
            itemId: 'd3e4f5a6-b7c8-4d9e-0f1a-2b3c4d5e6f7a',
            classification: RadarRing.SUSTAIN,
            insightsValues: {
                citedFragmentIds: [
                    'l45680qv-hl88-kon4-sqp9-a56z44z3v24a',
                    'm56791rw-im99-lpo5-trq0-b67a55a4w35b'
                ],
                insight: 'R mantiene dominio en análisis estadístico y visualización científica.',
                reasoningMetrics: {
                    statistical_analysis_market: 0.82,
                    academic_publications: 0.78
                }
            }
        },
        latestClassificationId: '7l6cmmnc-eef8-g7le-m5fn-ok7mcn3dn3i',
        summary: 'Lenguaje y entorno para computación estadística y gráficos.',
        title: 'R',
        updatedAt: '2024-02-13T13:20:00Z'
    },
    {
        createdAt: "2024-02-17T14:45:00Z",
        id: 'b7c8d9e0-f1a2-4b3c-4d5e-6f7a8b9c0d1e',
        insertedById: 'user-1313',
        itemField: RadarQuadrant.SCIENTIFIC_STAGE,
        latestClassification: {
            id: '1p0gqqsg-iij2-k1pi-q9jr-so1qgr7hr7m',
            analyzedAt: '2024-02-17T14:45:00Z',
            itemId: 'b7c8d9e0-f1a2-4b3c-4d5e-6f7a8b9c0d1e',
            classification: RadarRing.SUSTAIN,
            insightsValues: {
                citedFragmentIds: [
                    'q90135va-mr33-ptu9-xvu4-f01e99e8a79f',
                    'r01246wb-ns44-quv0-ywv5-g12f00f9b80g'
                ],
                insight: 'SciPy/NumPy mantienen base fundamental para computación científica en Python.',
                reasoningMetrics: {
                    scientific_computing_base: 0.95,
                    python_ecosystem_integration: 0.90
                }
            }
        },
        latestClassificationId: '1p0gqqsg-iij2-k1pi-q9jr-so1qgr7hr7m',
        summary: 'Bibliotecas fundamentales para computación científica en Python.',
        title: 'SciPy/NumPy',
        updatedAt: '2024-02-17T14:45:00Z'
    },
    {
        createdAt: "2024-02-14T16:00:00Z",
        id: 'e4f5a6b7-c8d9-4e0f-1a2b-3c4d5e6f7a8b',
        insertedById: null,
        itemField: RadarQuadrant.SCIENTIFIC_STAGE,
        latestClassification: {
            id: '8m7dnnod-ffg9-h8mf-n6go-pl8ndo4eo4j',
            analyzedAt: '2024-02-14T16:00:00Z',
            itemId: 'e4f5a6b7-c8d9-4e0f-1a2b-3c4d5e6f7a8b',
            classification: RadarRing.HOLD,
            insightsValues: {
                citedFragmentIds: [
                    'n67802sx-jo00-mqp6-usr1-c78b66b5x46c'
                ],
                insight: 'MATLAB enfrenta competencia de alternativas open source en investigación.',
                reasoningMetrics: {
                    license_cost_concerns: 0.75,
                    open_source_migration: 0.60
                }
            }
        },
        latestClassificationId: '8m7dnnod-ffg9-h8mf-n6go-pl8ndo4eo4j',
        summary: 'Plataforma de computación numérica y lenguaje de programación.',
        title: 'MATLAB',
        updatedAt: '2024-02-14T16:00:00Z'
    },
    {
        createdAt: "2024-02-18T17:10:00Z",
        id: 'c8d9e0f1-a2b3-4c4d-5e6f-7a8b9c0d1e2f',
        insertedById: null,
        itemField: RadarQuadrant.SCIENTIFIC_STAGE,
        latestClassification: {
            id: '2q1hrrth-jjk3-l2qj-r0ks-tp2rhs8is8n',
            analyzedAt: '2024-02-18T17:10:00Z',
            itemId: 'c8d9e0f1-a2b3-4c4d-5e6f-7a8b9c0d1e2f',
            classification: RadarRing.HOLD,
            insightsValues: {
                citedFragmentIds: [
                    's12357xc-ot55-rvw1-zxw6-h23g11g0c91h'
                ],
                insight: 'SAS enfrenta migración a herramientas open source en estadística.',
                reasoningMetrics: {
                    license_cost_barrier: 0.80,
                    open_source_migration_trend: 0.70
                }
            }
        },
        latestClassificationId: '2q1hrrth-jjk3-l2qj-r0ks-tp2rhs8is8n',
        summary: 'Suite de software para análisis estadístico avanzado.',
        title: 'SAS',
        updatedAt: '2024-02-18T17:10:00Z'
    },

    // CUADRANTE: SUPPORT_PLATTFORMS_AND_TECHNOLOGIES (8 items - 2 por anillo)
    {
        createdAt: "2024-02-21T09:50:00Z",
        id: 'f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
        insertedById: 'user-1616',
        itemField: RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES,
        latestClassification: {
            id: '5t4kuuvk-mmn6-o5tm-u3nv-ws5ukvblv1q',
            analyzedAt: '2024-02-21T09:50:00Z',
            itemId: 'f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
            classification: RadarRing.ADOPT,
            insightsValues: {
                citedFragmentIds: [
                    'v45680af-rw88-uzv4-caz9-k56j44j3f24k',
                    'w56791bg-sx99-vaw5-dba0-l67k55k4g35l'
                ],
                insight: 'Docker revoluciona el desarrollo y despliegue de aplicaciones con contenedores.',
                reasoningMetrics: {
                    container_adoption_rate: 0.88,
                    development_consistency: 0.82
                }
            }
        },
        latestClassificationId: '5t4kuuvk-mmn6-o5tm-u3nv-ws5ukvblv1q',
        summary: 'Plataforma para desarrollar, enviar y ejecutar aplicaciones en contenedores.',
        title: 'Docker',
        updatedAt: '2024-02-21T09:50:00Z'
    },
    {
        createdAt: "2024-02-29T15:40:00Z",
        id: 'b9c0d1e2-f3a4-4b5c-6d7e-8f9a0b1c2d3e',
        insertedById: 'user-2020',
        itemField: RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES,
        latestClassification: {
            id: '3b2sccsd-uuv4-w3bu-c1vd-ea3csdjtd9y',
            analyzedAt: '2024-02-29T15:40:00Z',
            itemId: 'b9c0d1e2-f3a4-4b5c-6d7e-8f9a0b1c2d3e',
            classification: RadarRing.ADOPT,
            insightsValues: {
                citedFragmentIds: [
                    'g56791lq-ch99-fkg5-nlk0-v67u55u4q35v'
                ],
                insight: 'Terraform establece estándar para Infrastructure as Code.',
                reasoningMetrics: {
                    infrastructure_as_code_adoption: 0.88,
                    multi_cloud_management: 0.75
                }
            }
        },
        latestClassificationId: '3b2sccsd-uuv4-w3bu-c1vd-ea3csdjtd9y',
        summary: 'Herramienta de Infrastructure as Code para construir y versionar infraestructura.',
        title: 'Terraform',
        updatedAt: '2024-02-29T15:40:00Z'
    },
    {
        createdAt: "2024-02-22T13:15:00Z",
        id: 'a2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d',
        insertedById: null,
        itemField: RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES,
        latestClassification: {
            id: '6u5lvvwl-nno7-p6un-v4ow-xt6vlwcmw2r',
            analyzedAt: '2024-02-22T13:15:00Z',
            itemId: 'a2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d',
            classification: RadarRing.TEST,
            insightsValues: {
                citedFragmentIds: [
                    'x67802ch-ty00-wbx6-ecb1-m78l66l5h46m'
                ],
                insight: 'Kubernetes establece estándar para orquestación de contenedores.',
                reasoningMetrics: {
                    container_orchestration: 0.85,
                    cloud_native_adoption: 0.78
                }
            }
        },
        latestClassificationId: '6u5lvvwl-nno7-p6un-v4ow-xt6vlwcmw2r',
        summary: 'Sistema de orquestación de contenedores open source.',
        title: 'Kubernetes',
        updatedAt: '2024-02-22T13:15:00Z'
    },
    {
        createdAt: "2024-03-01T09:55:00Z",
        id: 'c0d1e2f3-a4b5-4c6d-7e8f-9a0b1c2d3e4f',
        insertedById: 'user-2121',
        itemField: RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES,
        latestClassification: {
            id: '4c3tddte-vvw5-x4cv-d2we-fb4dtekue0z',
            analyzedAt: '2024-03-01T09:55:00Z',
            itemId: 'c0d1e2f3-a4b5-4c6d-7e8f-9a0b1c2d3e4f',
            classification: RadarRing.TEST,
            insightsValues: {
                citedFragmentIds: [
                    'h67802mr-di00-glh6-oml1-w78v66v5r46w'
                ],
                insight: 'Prometheus se establece como estándar para monitoreo en cloud native.',
                reasoningMetrics: {
                    cloud_native_monitoring: 0.82,
                    time_series_database: 0.78
                }
            }
        },
        latestClassificationId: '4c3tddte-vvw5-x4cv-d2we-fb4dtekue0z',
        summary: 'Sistema de monitoreo y alerta de código abierto para aplicaciones y servicios.',
        title: 'Prometheus',
        updatedAt: '2024-03-01T09:55:00Z'
    },
    {
        createdAt: "2024-02-23T15:30:00Z",
        id: 'b3c4d5e6-f7a8-4b9c-0d1e-2f3a4b5c6d7e',
        insertedById: 'user-1717',
        itemField: RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES,
        latestClassification: {
            id: '7v6mwwxm-oop8-q7vo-w5px-yu7wmxdnx3s',
            analyzedAt: '2024-02-23T15:30:00Z',
            itemId: 'b3c4d5e6-f7a8-4b9c-0d1e-2f3a4b5c6d7e',
            classification: RadarRing.SUSTAIN,
            insightsValues: {
                citedFragmentIds: [
                    'y78913di-uz11-xcy7-fdc2-n89m77m6i57n',
                    'z89024ej-va22-ydz8-ged3-o90n88n7j68o'
                ],
                insight: 'Jenkins mantiene liderazgo en integración continua aunque enfrenta competencia.',
                reasoningMetrics: {
                    ci_cd_market_share: 0.65,
                    plugin_ecosystem: 0.88
                }
            }
        },
        latestClassificationId: '7v6mwwxm-oop8-q7vo-w5px-yu7wmxdnx3s',
        summary: 'Servidor de automatización open source para integración continua.',
        title: 'Jenkins',
        updatedAt: '2024-02-23T15:30:00Z'
    },
    {
        createdAt: "2024-02-24T11:05:00Z",
        id: 'c4d5e6f7-a8b9-4c0d-1e2f-3a4b5c6d7e8f',
        insertedById: null,
        itemField: RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES,
        latestClassification: {
            id: '8w7nxxyn-ppq9-r8wp-x6qy-zv8xnyeoy4t',
            analyzedAt: '2024-02-24T11:05:00Z',
            itemId: 'c4d5e6f7-a8b9-4c0d-1e2f-3a4b5c6d7e8f',
            classification: RadarRing.HOLD,
            insightsValues: {
                citedFragmentIds: [
                    'a90135fk-wb33-zea9-hfe4-p01o99o8k79p'
                ],
                insight: 'CVS es reemplazado por sistemas de control de versiones modernos.',
                reasoningMetrics: {
                    legacy_version_control: 0.15,
                    git_migration_rate: 0.95
                }
            }
        },
        latestClassificationId: '8w7nxxyn-ppq9-r8wp-x6qy-zv8xnyeoy4t',
        summary: 'Sistema de control de versiones antiguo, ampliamente reemplazado.',
        title: 'CVS',
        updatedAt: '2024-02-24T11:05:00Z'
    },
    {
        createdAt: "2024-02-25T14:20:00Z",
        id: 'd5e6f7a8-b9c0-4d1e-2f3a-4b5c6d7e8f9a',
        insertedById: 'user-1818',
        itemField: RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES,
        latestClassification: {
            id: '9x8oyyzo-qqr0-s9xq-y7rz-aw9yozfpz5u',
            analyzedAt: '2024-02-25T14:20:00Z',
            itemId: 'd5e6f7a8-b9c0-4d1e-2f3a-4b5c6d7e8f9a',
            classification: RadarRing.SUSTAIN,
            insightsValues: {
                citedFragmentIds: [
                    'b01246gl-xc44-afb0-igf5-q12p00p9l80q'
                ],
                insight: 'Git se consolida como estándar absoluto para control de versiones.',
                reasoningMetrics: {
                    version_control_market_share: 0.98,
                    distributed_version_control: 0.95
                }
            }
        },
        latestClassificationId: '9x8oyyzo-qqr0-s9xq-y7rz-aw9yozfpz5u',
        summary: 'Sistema de control de versiones distribuido, estándar de la industria.',
        title: 'Git',
        updatedAt: '2024-02-25T14:20:00Z'
    },
    {
        createdAt: "2024-02-28T12:25:00Z",
        id: 'a8b9c0d1-e2f3-4a4b-5c6d-7e8f9a0b1c2d',
        insertedById: null,
        itemField: RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES,
        latestClassification: {
            id: '2a1rbbrc-ttu3-v2at-b0uc-dz2brcisc8x',
            analyzedAt: '2024-02-28T12:25:00Z',
            itemId: 'a8b9c0d1-e2f3-4a4b-5c6d-7e8f9a0b1c2d',
            classification: RadarRing.HOLD,
            insightsValues: {
                citedFragmentIds: [
                    'f45680kp-bg88-ejf4-mkj9-u56t44t3p24u'
                ],
                insight: 'Puppet muestra declive frente a soluciones de automatización más modernas.',
                reasoningMetrics: {
                    legacy_configuration_tool: 0.35,
                    modern_alternatives_adoption: 0.82
                }
            }
        },
        latestClassificationId: '2a1rbbrc-ttu3-v2at-b0uc-dz2brcisc8x',
        summary: 'Herramienta de gestión de configuración y automatización de infraestructura.',
        title: 'Puppet',
        updatedAt: '2024-02-28T12:25:00Z'
    }
];

export default blips;