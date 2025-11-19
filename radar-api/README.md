# 🚀 Radar-API: Vigilancia Tecnológica Asistida por IA

Bienvenido al *backend* de **Radar-API**, un sistema robusto diseñado para la **Vigilancia Tecnológica** continua y la generación automatizada de un **Technology Radar**. Este proyecto combina la gestión de datos relacionales (PostgreSQL/Prisma) con capacidades de procesamiento de lenguaje natural de última generación (**RAG** y **CAG**) y búsqueda vectorial (**pgvector**).

## 💡 Visión del Proyecto

El objetivo principal es transformar datos crudos provenientes de múltiples fuentes técnicas (GitHub, ArXiv, NPM, etc.) en **conocimiento estructurado** y clasificable. Esto se logra mediante un *pipeline* de procesamiento impulsado por IA que culmina en la clasificación automática de tecnologías según la metodología de un Technology Radar (Adopt, Test, Sustain, Hold).

## 🛠️ Stack Tecnológico

| Componente | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Backend** | NestJS (TypeScript) | Framework modular para la lógica de negocio y API REST. |
| **Base de Datos** | PostgreSQL | Persistencia de datos relacionales y gestión de esquemas. |
| **ORM/Migraciones** | Prisma | Cliente de base de datos y herramienta de migración robusta. |
| **Búsqueda Vectorial** | `pgvector` | Habilitación de índices vectoriales para **RAG**. |
| **Contenedores** | Docker & Docker Compose | Entorno de desarrollo aislado y reproducible. |
| **Modelos de IA** | Agentes LLM (via Centralized Agent) | **RAG** (Retrieval Augmented Generation) y **CAG** (Cache Augmented Generation) para análisis complejo. |

## 🏗️ Arquitectura de Módulos (Flujo de Datos)

La arquitectura sigue un flujo de datos lógico que garantiza que los ítems clasificados sean rastreables hasta su fuente original.

### 1\. **`Data-Hub` (Ingesta & Preparación) 📥**

Encargado de la limpieza, estandarización y vectorización de datos.

* **`Collection`:** Implementación de *fetchers* para la recolección de datos crudos (`RawData`) desde fuentes externas (GitHub, ArXiv, etc.).
* **`Processing`:** Fase **crítica** donde, asistido por el **`Centralized-AI-Agent`**, el texto crudo es sometido a **Chunking Semántico** y **Extracción de KPIs**. El resultado se transforma en el modelo **`KnowledgeFragment`** con su respectivo *embedding* (`vector`).
* **`Vectorizing`:** Generación de los *embeddings* (vectores numéricos) a partir de los *Knowledge Fragments*.

### 2\. **`Technology-Survey` (Análisis & Clasificación) 🧠**

Utiliza el conocimiento vectorial para tomar decisiones de clasificación.

* **`Items-Identifying`:** Usa la **búsqueda vectorial (RAG)** para agrupar *Knowledge Fragments* relacionados y consolidarlos en un **`Item`** tecnológico único.
* **`Items-Classification`:** Asigna la clasificación del radar (`ADOPT`, `TEST`, etc.) utilizando la **generación aumentada por caché (CAG)** y los *insights* extraídos de los *fragments*.

### 3\. **`Centralized-AI-Agent` (Servicio Compartido) 🤖**

Módulo desacoplado que unifica el contacto con todos los proveedores de LLMs (OpenAI, Gemini, etc.). Todos los demás módulos inyectan y consumen este servicio para cualquier tarea de IA.

### 4\. **`User-Data` y `Auth` (Usuarios) 👤**

Módulos para la gestión de usuarios, autenticación externa (Clerk), preferencias personalizadas y listas de ítems (esconder, suscribir, reportes).

-----

## ⚙️ Configuración del Entorno de Desarrollo

El proyecto utiliza Docker Compose para simplificar la configuración de la base de datos, incluyendo la extensión `pgvector`.

### Requisitos Previos

1. **Node.js** (v18+)
2. **Docker** & **Docker Compose**
3. Configurar las variables de entorno (`.env` file)

### Pasos de Inicio Rápido

Ejecute este comando para levantar la base de datos (`radar-db`) y la interfaz de administración (PgAdmin):

```bash
docker-compose up -d radar-db pgadmin
```

Una vez que los contenedores estén en marcha:

### 1\. Ejecutar las Migraciones de Prisma

Debido a la naturaleza de la extensión `pgvector`, las migraciones se realizan en dos pasos:

1. **Aplicar la migración de la extensión:**

    ```bash
    npx prisma migrate deploy
    ```

    > **Nota:** Este comando ejecuta el SQL manual `CREATE EXTENSION IF NOT EXISTS vector;` y es crucial que se ejecute primero.

2. **Generar y aplicar la migración del esquema:**

    ```bash
    npx prisma migrate dev
    ```

### 2\. Ejecutar la Aplicación NestJS

```bash
npm install
npm run start:dev
```

La API estará disponible en `http://localhost:3000` (o el puerto configurado en el archivo `.env`).

-----

## ⚠️ Nota Importante sobre `pgvector`

Si alguna vez encuentra un error sobre que el tipo `vector` no existe (`P3006`), esto se debe a que la **base de datos de sombra** de Prisma no pudo inicializarse.

**Solución:** Asegúrese de que sus servicios de Docker utilicen la imagen `ankane/pgvector:latest` y que los *scripts* de inicialización en `docker-entrypoint-initdb.d/` se hayan ejecutado. Luego, limpie y reinicie Docker:

```bash
docker-compose down -v
docker-compose up -d
```
