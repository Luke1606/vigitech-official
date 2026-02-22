# 🛡️ Vigitech | Core & Radar Service

## [ES]

Bienvenido al repositorio central de **Vigitech**, una plataforma avanzada de vigilancia tecnológica diseñada para fusionar visión estratégica e inteligencia de datos. Este repositorio alberga el punto de entrada (Portal) y el motor de monitoreo en tiempo real a través de nuestro servicio de Radar. Para ver más, vea el [video](https://www.cubadigital.ai/soluciones/radar) o lea el [artículo](https://www.juventudtecnica.cu/articulos/presentan-consorcio-de-inteligencia-artificial-en-cuba/) en la sección "Radar".

## [EN]

*Welcome to the **Vigitech** central repository, an advanced technology surveillance platform designed to merge strategic vision and data intelligence. This repository hosts the entry point (Portal) and the real-time monitoring engine through our Radar service.* For more info, watch the [video](https://www.cubadigital.ai/soluciones/radar) or read the [post](https://www.juventudtecnica.cu/articulos/presentan-consorcio-de-inteligencia-artificial-en-cuba/) in the "Radar" section.

> [!IMPORTANT]
> **Fase del Proyecto | Project Phase:** Actualmente en fase de pruebas (Alpha). El sistema se encuentra en proceso de escalado y modularización continua. / *Currently in testing phase (Alpha). The system is undergoing continuous scaling and modularization.*

---

## Propuesta de Valor | Value Proposition

Vigitech transforma datos complejos en visualizaciones accionables a través de tres pilares fundamentales:
*Vigitech transforms complex data into actionable visualizations through three fundamental pillars:*

* **Technology Radar:** Visualización dinámica de tecnologías emergentes y su evolución global. / *Dynamic visualization of emerging technologies and their global evolution.*
* **Smart Browser:** Índice inteligente con filtrado avanzado por sector y madurez. / *Intelligent index with advanced filtering by sector and maturity.*
* **Data Visualization:** Paneles interactivos que convierten métricas en insights claros. / *Interactive dashboards that convert metrics into clear insights.*

---

## Stack Tecnológico | Tech Stack

El núcleo del servicio está construido buscando alto rendimiento y escalabilidad:
*The core of the service is built for high performance and scalability:*

* **Frontend:** `React` + `TypeScript` (Robustez y tipado / *Robustness and typing*).
* **Styling:** `Tailwind CSS` (Gradientes y animaciones / *Gradients and animations*).
* **Backend:** `NestJS` (Arquitectura modular y escalable / *Modular and scalable architecture*).
* **Persistence:** `PostgreSQL` + `Prisma` (Gestión de datos eficiente / *Efficient data management*).
* **Architecture:** Enfoque orientado a microservicios. / *Microservices-oriented approach.*

---

## Manual de Ejecución | Execution Guide

### Tabla de Contenidos | Table of Contents

1. [Acceso al Backend y Menú | Backend Access & Menu](#backend-menu)
2. [Configuración Inicial | Initial Setup](#initial-setup)
3. [Referencia de Comandos del Menú | Menu Commands Reference](#menu-commands)
4. [Scripts de npm (Backend) | npm Scripts (Backend)](#npm-scripts)
5. [Ejecución del Frontend | Frontend Execution](#frontend)
6. [Credenciales y Acceso | Credentials and Access](#access)

---

<br id="backend-menu">

### 1. Acceso al Backend y Menú | Backend Access & Menu

Para administrar el servidor y la infraestructura, acceda a la carpeta del API y ejecute el menú interactivo.
*To manage the server and infrastructure, go to the API folder and run the interactive menu.*

```batch
cd radar-api
./menu
```

---

<br id="initial-setup">

### 2. Configuración Inicial | Initial Setup

Si es la primera vez que ejecuta el proyecto, siga estos pasos desde el menú.
*If this is the first time running the project, follow these steps from the menu.*

1. Ejecute **[9] Configuracion Inicial**: Este comando instalará dependencias, generará el cliente Prisma y levantará la base de datos con la carga de datos inicial.


2. Ejecute **[1] Desarrollo Completo**: Para iniciar el entorno de trabajo activo.

---

<br id="menu-commands">

### 3. Referencia de Comandos del Menú | Menu Commands Reference

El archivo `menu.bat` permite ejecutar las siguientes acciones:

* **[1] Desarrollo Completo:** Inicia la infraestructura de base de datos y arranca la API en modo desarrollo.
* **[2] Solo Base de Datos:** Levanta únicamente los contenedores de PostgreSQL y PGAdmin.
* **[3] Desarrollo Rapido:** Inicia la API asumiendo que la base de datos ya está activa.
* **[4] Ejecutar Tests:** Levanta una base de datos temporal, aplica migraciones y ejecuta las pruebas de cobertura.
* **[5] Siembra de Datos (Seeding):** Permite elegir entre tres niveles de carga de datos (Inicial, Medios, Completos).
* **[6] Gestionar Migraciones:** Menú para crear, aplicar o resetear el esquema de la base de datos mediante Prisma.
* **[7] Build Produccion:** Prepara el proyecto para despliegue instalando solo dependencias necesarias y creando la imagen Docker.
* **[8] Detener Todo:** Apaga los contenedores y libera recursos de memoria.

---

<br id="npm-scripts">

### 4. Scripts de npm (Backend) | npm Scripts (Backend)

Además del menú, puede ejecutar comandos específicos mediante `npm run` dentro de `radar-api/`:

| Comando | Acción | Description |
| --- | --- | --- |
| `db:up` | Levanta DB y PGAdmin via Docker | Starts DB and PGAdmin via Docker |
| `db:clean` | Elimina contenedores y volúmenes | Removes containers and volumes |
| `db:generate` | Genera cliente de Prisma | Generates Prisma client |
| `db:migrate:dev` | Crea y aplica migraciones de desarrollo | Creates and applies dev migrations |
| `db:seed1` | Ejecuta siembra etapa 1 | Runs stage 1 seed |
| `db:studio` | Abre interfaz gráfica de Prisma | Opens Prisma GUI |
| `test:cov` | Ejecuta tests con reporte de cobertura | Runs tests with coverage report |
| `docker:build` | Construye la imagen `radar-api:latest` | Builds `radar-api:latest` image |
| `health:db` | Verifica disponibilidad del puerto 4000 | Checks port 4000 availability |

---

<br id="frontend">

### 5. Ejecución del Frontend | Frontend Execution

Para el cliente, debe acceder a la carpeta correspondiente desde la raíz del repositorio.
*For the client, you must access the corresponding folder from the repository root.*

```bash
cd client
npm install   # Solo la primera vez | First time only
npm run dev   # Iniciar desarrollo | Start development

```

**Otros comandos disponibles en /client:**

* `npm run build`: Compila la aplicación para producción.
* `npm run ci`: Ejecuta linting, verificación de tipos y tests.
* `npm run test`: Ejecuta la suite de pruebas del frontend.

---

<br id="access">

### 6. Credenciales y Acceso | Credentials and Access

Información necesaria para la administración del entorno local:

* **PGAdmin:** [http://localhost:8080](http://localhost:8080) 
* **Usuario:** `superuser-admin@vigitech.com` 
* **Password:** `vigitech-dev-password-DO_NOT_TOUCH_4000` 
* **PostgreSQL:** `localhost:4000` 
* **API:** `localhost:3000`

---

*Just another step towards the future of technology intelligence.*
