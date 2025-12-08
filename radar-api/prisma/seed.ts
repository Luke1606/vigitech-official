import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Prisma, PrismaClient, RawDataSource, RawDataType } from '@prisma/client';
import { CreateKnowledgeFragment } from '@/modules/data-hub/processing/types/create-knowledge-fragment.type';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { GoogleGenerativeAI, Content, Part } from '@google/generative-ai';

dotenv.config();

export const EMBEDDING_API_KEY = process.env.EMBEDDING_API_KEY;
export const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL;

if (!EMBEDDING_API_KEY || !EMBEDDING_MODEL) {
    console.error('ERROR: EMBEDDING_API_KEY no está configurada en .env.');
    process.exit(1);
}

export const embeddingModel = new GoogleGenerativeAI(EMBEDDING_API_KEY).getGenerativeModel({ model: EMBEDDING_MODEL });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

/**
 * Genera embeddings para un array de textos utilizando el SDK de Gemini.
 * @param textArray Array de cadenas de texto.
 * @returns Una promesa que resuelve en un array de embeddings (number[][]).
 */
async function generateEmbeddings(textArray: string[]): Promise<number[][]> {
    console.log(`\n⚙️ Generando ${textArray.length} embeddings con el modelo: ${EMBEDDING_MODEL}`);

    // Mapeamos cada string de texto a la estructura Content esperada
    const requestsWithContent: { content: Content }[] = textArray.map((text) => {
        // 1. Crear el objeto Part
        const part: Part = { text: text };

        // 2. Crear el objeto Content (requiere role y parts)
        const content: Content = {
            role: 'user', // El rol es genérico, pero requerido por la interfaz
            parts: [part],
        };

        // 3. Crear el objeto EmbedContentRequest (requiere la propiedad 'content')
        return { content };
    });

    try {
        const result = await embeddingModel.batchEmbedContents({
            requests: requestsWithContent,
        });

        return result.embeddings.map((e: { values: number[] }) => e.values);
    } catch (error) {
        console.error('ERROR al generar embeddings con el SDK de Gemini.', error);
        throw new Error('Falló la generación de embeddings. Revisa tu clave y modelo.');
    }
}
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

const NUM_RAW_DATA = 30;
const RAW_DATA_IDS: string[] = [];

/**
 * Genera 30 RawData únicos y los inserta (o actualiza) en la base de datos.
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

    await ensureRawDataExists();

    const mockKnowledgeFragmentsPath = path.resolve(`${__dirname}/mock-data`, jsonFileName);
    if (!fs.existsSync(mockKnowledgeFragmentsPath)) {
        console.error(`ERROR: Archivo ${jsonFileName} no encontrado en ${__dirname}/mock-data`);
        process.exit(1);
    }

    const knowledgeFragmentsString = fs.readFileSync(mockKnowledgeFragmentsPath, 'utf-8');
    const mockKnowledgeFragments = JSON.parse(knowledgeFragmentsString);

    const textSnippets: string[] = mockKnowledgeFragments.map((f: CreateKnowledgeFragment) => f.textSnippet);
    const embeddings: number[][] = await generateEmbeddings(textSnippets);

    const fragments: CreateKnowledgeFragment[] = mockKnowledgeFragments.map(
        (fragment: CreateKnowledgeFragment, index: number) => {
            return {
                textSnippet: fragment.textSnippet,
                associatedKPIs: fragment.associatedKPIs,
                embedding: embeddings[index],

                // Asigna un ID de RawData ciclicamente entre los 30 disponibles
                sourceRawDataId: RAW_DATA_IDS[index % RAW_DATA_IDS.length],
            };
        },
    );

    const values = fragments.map((fragment) => {
        const vectorValues = fragment.embedding.join(', ');

        const vectorExpression = Prisma.raw(`'[${vectorValues}]'::vector`);

        return Prisma.sql`(gen_random_uuid(), ${fragment.textSnippet}, ${vectorExpression}, ${fragment.associatedKPIs}::jsonb, ${fragment.sourceRawDataId})`;
    });

    await prisma.$executeRaw(
        Prisma.sql`
            INSERT INTO "KnowledgeFragment" ("id", "textSnippet", "embedding", "associatedKPIs", "sourceRawDataId")
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
