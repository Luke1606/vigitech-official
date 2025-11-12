import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RadarQuadrant } from '@prisma/client';
import { BaseFetcher } from '../../base.fetcher';
import { PrismaService } from '../../../../../common/services/prisma.service';

@Injectable()
export class KubernetesFetcher extends BaseFetcher {
    readonly quadrants = [RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES];

    constructor(
        protected readonly prisma: PrismaService,
        private readonly httpService: HttpService,
    ) {
        super(prisma);
    }

    public async fetch(): Promise<void> {
        this.logger.log(`Collecting data for Kubernetes from various sources for quadrant ${this.quadrants.join()}...`);

        // Kubernetes no tiene una API pública centralizada para "tendencias" como GitHub o Docker Hub.
        // La recopilación de datos para Kubernetes podría implicar:
        // 1. APIs de proveedores de nube (GKE, EKS, AKS) para uso/adopción.
        // 2. APIs de proyectos relacionados (Helm, Prometheus, Grafana) para popularidad.
        // 3. Web scraping de blogs/noticias de la comunidad.
        // 4. APIs de encuestas de la industria (ej. CNCF Survey si fuera accesible).

        // Para este ejemplo, usaremos un placeholder o una API de noticias genérica
        // que pueda mencionar a Kubernetes. Esto es una simplificación.
        const newsApiUrl =
            'https://newsapi.org/v2/everything?q=kubernetes&sortBy=relevancy&pageSize=10&apiKey=YOUR_NEWS_API_KEY'; // Requiere API Key

        try {
            // Nota: Necesitarías una API Key válida para NewsAPI.org
            // Si no tienes una, esta llamada fallará.
            const response = await this.httpService.get(newsApiUrl).toPromise();
            const articles = response?.data?.articles;

            if (articles && articles.length > 0) {
                for (const article of articles) {
                    await this.saveRawData('NewsAPI', 'Article_Kubernetes', article);
                }
                this.logger.log(`Successfully collected ${articles.length} articles mentioning Kubernetes.`);
            } else {
                this.logger.warn('No articles found mentioning Kubernetes from NewsAPI.');
            }
        } catch (error) {
            this.logger.error('Failed to collect data for Kubernetes', error);
        }
    }
}
