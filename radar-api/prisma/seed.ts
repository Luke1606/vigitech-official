import * as fs from 'fs';
import * as path from 'path';
import { Prisma, PrismaClient, RawDataSource, RawDataType } from '@prisma/client';
import { CreateKnowledgeFragment } from '@/modules/data-hub/processing/types/create-knowledge-fragment.type';

const prisma = new PrismaClient();

// --- CONFIGURACIÓN DE DATOS MOCK ---

// Fuentes y Tipos (Basados en el schema)
const DATA_SOURCES: RawDataSource[] = [
    'ARXIV_ORG',
    'DEV_TO',
    'GITHUB',
    'HACKER_NEWS',
    'NPM',
    'REDDIT',
    'STACK_EXCHANGE',
    'CROSS_REF',
] as RawDataSource[];

const DATA_TYPES: RawDataType[] = [
    'CODE_ASSET',
    'TEXT_CONTENT',
    'ACADEMIC_PAPER',
    'REPORT_OR_PRODUCT',
    'COMMUNITY_POST',
    'DATASET',
] as RawDataType[];

const NUM_RAW_DATA = 50; // Requisito: 50 entradas de RawData
const RAW_DATA_IDS: string[] = []; // Almacenará los IDs generados

/**
 * Genera 50 RawData únicos y los inserta (o actualiza) en la base de datos.
 * Esto asegura que los KnowledgeFragments tengan una fuente trazable y diversa.
 */
async function ensureRawDataExists() {
    console.log(`\nGenerando ${NUM_RAW_DATA} entradas de RawData diversas...`);
    const rawDataToCreate = [];

    for (let i = 0; i < NUM_RAW_DATA; i++) {
        const source = DATA_SOURCES[i % DATA_SOURCES.length];
        const dataType = DATA_TYPES[i % DATA_TYPES.length];
        const id = `RD-SEED-${(i + 1).toString().padStart(2, '0')}`;
        RAW_DATA_IDS.push(id);

        rawDataToCreate.push({
            id,
            source,
            dataType,
            content: { title: `Generic Source Data: ${source}/${dataType} Entry ${i + 1}` },
        });
    }

    // Usamos $transaction para asegurar que todas las operaciones se completen o fallen juntas
    await prisma.$transaction(
        rawDataToCreate.map((data) =>
            prisma.rawData.upsert({
                where: { id: data.id },
                update: {},
                create: data,
            }),
        ),
    );

    console.log(`✅ ${NUM_RAW_DATA} RawData Sources verificados/creados.`);
}

/**
 * Script de siembra para poblar fragmentos de conocimiento en etapas.
 */
async function main() {
    const stageArgument = process.argv[2];
    const stageNumber = parseInt(stageArgument, 10);

    if (![1, 2, 3].includes(stageNumber)) {
        console.error('ERROR: Debe especificar la etapa de siembra (1, 2 o 3) como argumento de la línea de comandos.');
        process.exit(1);
    }

    const jsonFileName = `knowledge-fragments-stage${stageNumber}.json`;
    console.log(`\n--- INICIANDO SIEMBRA (ETAPA ${stageNumber}): Leyendo ${jsonFileName} ---`);

    // Asegurar que las 50 fuentes RawData existen antes de insertar los fragmentos
    await ensureRawDataExists();

    const mockKnowledgeFragmentsPath = path.resolve(`${__dirname}/mock-data`, jsonFileName);
    if (!fs.existsSync(mockKnowledgeFragmentsPath)) {
        console.error(`ERROR: Archivo ${jsonFileName} no encontrado en ${__dirname}`);
        process.exit(1);
    }

    const knowledgeFragmentsString = fs.readFileSync(mockKnowledgeFragmentsPath, 'utf-8');
    const mockKnowledgeFragments = JSON.parse(knowledgeFragmentsString);

    // Asignar RawDataId de forma aleatoria a los fragmentos cargados para trazabilidad
    const fragmentsWithTraceability: CreateKnowledgeFragment[] = mockKnowledgeFragments.map(
        (fragment: object, index: number) => {
            return {
                ...fragment,
                // Asigna un ID de RawData ciclicamente entre los 50 disponibles
                sourceRawDataId: RAW_DATA_IDS[index % RAW_DATA_IDS.length],
            };
        },
    );

    const values = fragmentsWithTraceability.map(
        (fragment) =>
            Prisma.sql`(gen_random_uuid(), ${fragment.textSnippet}, ${Prisma.join(fragment.embedding)}::vector, ${fragment.associatedKPIs}::jsonb, ${fragment.sourceRawDataId}::uuid, NOW())`,
    );

    // Insertar los KnowledgeFragments
    await prisma.$executeRaw(
        Prisma.sql`
            INSERT INTO "tech_survey"."KnowledgeFragment" ("id", "textSnippet", "embedding", "associatedKPIs", "sourceRawDataId", "createdAt")
            VALUES ${Prisma.join(values, ', ')};
        `,
    );

    console.log(`\n✅ Siembra Exitosa: nuevos KnowledgeFragments insertados en la ETAPA ${stageNumber}.`);
    console.log(`TOTAL DE FRAGMENTOS ACUMULADOS EN BD: ${await prisma.knowledgeFragment.count()}`);
    console.log('------------------------------------------------------------------');
}

main()
    .catch((e) => {
        console.error('FALLO EN LA SIEMBRA:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
