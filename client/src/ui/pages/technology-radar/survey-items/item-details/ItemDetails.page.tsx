import type { UUID } from "crypto";
import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
	InfoIcon,
	Calendar,
	RefreshCw,
	Lightbulb,
	BarChart3,
} from "lucide-react";
import { useSurveyItemsAPI } from "../../../../../infrastructure/hooks/use-survey-items/api/useSurveyItemsAPI.hook";
import { useSurveyItems } from "../../../../../infrastructure";
import {
	Alert,
	AlertDescription,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Skeleton,
	Badge,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
	Button,
} from "../../../../components/";
import {
	RadarQuadrant,
	RadarRing,
	type SurveyItem,
} from "../../../../../infrastructure";

// ---------- FUNCIONES DE NORMALIZACIÓN (copiadas de ItemListsSideBar) ----------
const normalizeQuadrant = (value: any): RadarQuadrant => {
	if (typeof value === 'string') {
		switch (value) {
			case 'LANGUAGES_AND_FRAMEWORKS':
			case RadarQuadrant.LANGUAGES_AND_FRAMEWORKS:
				return RadarQuadrant.LANGUAGES_AND_FRAMEWORKS;
			case 'BUSSINESS_INTEL':
			case RadarQuadrant.BUSSINESS_INTEL:
				return RadarQuadrant.BUSSINESS_INTEL;
			case 'SCIENTIFIC_STAGE':
			case RadarQuadrant.SCIENTIFIC_STAGE:
				return RadarQuadrant.SCIENTIFIC_STAGE;
			case 'SUPPORT_PLATTFORMS_AND_TECHNOLOGIES':
			case RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES:
				return RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES;
			default:
				return value as RadarQuadrant;
		}
	}
	return value as RadarQuadrant;
};

const normalizeRing = (value: any): RadarRing => {
	if (typeof value === 'string') {
		switch (value) {
			case 'ADOPT':
			case RadarRing.ADOPT:
				return RadarRing.ADOPT;
			case 'TEST':
			case RadarRing.TEST:
				return RadarRing.TEST;
			case 'SUSTAIN':
			case RadarRing.SUSTAIN:
				return RadarRing.SUSTAIN;
			case 'HOLD':
			case RadarRing.HOLD:
				return RadarRing.HOLD;
			default:
				return value as RadarRing;
		}
	}
	return value as RadarRing;
};
// --------------------------------------------------------------------------------

// ---------- TRADUCCIONES DE MÉTRICAS DE RAZONAMIENTO ----------
const metricTranslations: Record<string, string> = {
	wasm_server_adoption_rate: 'Tasa de adopción WASM',
	isolation_score: 'Nivel de aislamiento',
	alternative_search_interest: 'Interés en alternativas',
	legacy_configuration_tool: 'Herramienta de configuración heredada',
	modern_alternatives_adoption: 'Adopción de alternativas modernas',
	// Agrega más traducciones según los datos que recibas
};

const translateMetricKey = (key: string): string => {
	if (metricTranslations[key]) return metricTranslations[key];
	// Fallback: reemplazar guiones bajos por espacios y capitalizar
	return key
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (char) => char.toUpperCase());
};
// -------------------------------------------------------------

// Funciones de color (versión mejorada que acepta claves o valores)
const getQuadrantColor = (quadrant: RadarQuadrant | string): string => {
	const colors: Record<string, string> = {
		[RadarQuadrant.BUSSINESS_INTEL]: '#3B82F6',
		[RadarQuadrant.SCIENTIFIC_STAGE]: '#10B981',
		[RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES]: '#F59E0B',
		[RadarQuadrant.LANGUAGES_AND_FRAMEWORKS]: '#8B5CF6',
		BUSSINESS_INTEL: '#3B82F6',
		SCIENTIFIC_STAGE: '#10B981',
		SUPPORT_PLATTFORMS_AND_TECHNOLOGIES: '#F59E0B',
		LANGUAGES_AND_FRAMEWORKS: '#8B5CF6',
	};
	return colors[quadrant] || '#6B7280';
};

const getRingColor = (ring: RadarRing | string): string => {
	const colors: Record<string, string> = {
		[RadarRing.ADOPT]: '#10B981',
		[RadarRing.TEST]: '#F59E0B',
		[RadarRing.SUSTAIN]: '#3B82F6',
		[RadarRing.HOLD]: '#EF4444',
		ADOPT: '#10B981',
		TEST: '#F59E0B',
		SUSTAIN: '#3B82F6',
		HOLD: '#EF4444',
	};
	return colors[ring] || '#6B7280';
};

export const ItemDetails: React.FC = () => {
	const { id } = useParams<{ id: UUID }>();
	const query = useSurveyItemsAPI();
	const { surveyItems } = useSurveyItems(); // Datos ya normalizados del radar
	const [useExampleData, setUseExampleData] = useState(false);

	// ------------------------------------------------------------------
	// 1. Buscar el ítem en los datos globales (ya normalizados)
	// ------------------------------------------------------------------
	const itemFromContext = useMemo(() => {
		if (!id) return null;
		return surveyItems.find(item => item.id === id) || null;
	}, [id, surveyItems]);

	// ------------------------------------------------------------------
	// 2. Datos de ejemplo (usando CLAVES, como las envía el backend)
	// ------------------------------------------------------------------
	const exampleSurveyItemRaw: SurveyItem = {
		id: 'af8c6fc2-d5df-42b9-8687-6da6db6fd55e' as UUID,
		title: 'Server-side WebAssembly (WASM)',
		summary: 'WebAssembly (WASM) en el lado del servidor emerge como una alternativa ligera a los contenedores tradicionales y al modelo serverless, proporcionando un aislamiento superior y una ejecución de código eficiente para computación distribuida.',
		createdAt: '2026-02-06T05:58:51.498Z',
		updatedAt: '2026-02-06T05:58:51.600Z',
		insertedById: null,
		itemField: 'SUPPORT_PLATTFORMS_AND_TECHNOLOGIES' as any,
		latestClassificationId: '951cccc8-2bfc-4b29-a033-e2f16c3da512' as UUID,
		latestClassification: {
			id: '951cccc8-2bfc-4b29-a033-e2f16c3da512' as UUID,
			analyzedAt: '2026-02-06T05:58:51.524Z',
			itemId: 'af8c6fc2-d5df-42b9-8687-6da6db6fd55e',
			classification: RadarRing.TEST, // clave
			insightsValues: {
				citedFragmentIds: [
					'5978de73-ca44-41c2-889e-aad33910e10a' as UUID,
					'0ec602d7-35f7-48ef-998a-67ab33619bcd' as UUID,
					'b467b495-fa3c-495b-a78e-9d893c68c3e1' as UUID,
				],
				insight: 'Se observa un crecimiento en la adopción de WASM (15%) impulsado por la necesidad de resolver cuellos de botella en infraestructuras "serverless", como los altos costos y los tiempos de "cold start". Su alto puntaje de aislamiento (0.95) lo posiciona como una opción robusta frente a los contenedores tradicionales en casos de uso específicos.',
				reasoningMetrics: {
					wasm_server_adoption_rate: 0.15,
					isolation_score: 0.95,
					alternative_search_interest: 0.2,
				},
			},
		},
	};

	const exampleSurveyItem = useMemo(() => ({
		...exampleSurveyItemRaw,
		itemField: normalizeQuadrant(exampleSurveyItemRaw.itemField),
		latestClassification: exampleSurveyItemRaw.latestClassification ? {
			...exampleSurveyItemRaw.latestClassification,
			classification: normalizeRing(exampleSurveyItemRaw.latestClassification.classification)
		} : undefined,
	}), []);

	// ------------------------------------------------------------------
	// 3. Fallback: llamar a findOne SIEMPRE con el ID (no condicional)
	//    Si ya tenemos el ítem del contexto, ignoramos estos datos.
	// ------------------------------------------------------------------
	const {
		data: rawItem,
		isLoading: isFindOneLoading,
		error,
		refetch,
		isFetching,
	} = query.findOne(id!); // ✅ Siempre con UUID válido

	const normalizedFallbackItem = useMemo(() => {
		if (!rawItem) return null;
		return {
			...rawItem,
			itemField: normalizeQuadrant(rawItem.itemField),
			latestClassification: rawItem.latestClassification ? {
				...rawItem.latestClassification,
				classification: normalizeRing(rawItem.latestClassification.classification)
			} : undefined,
		};
	}, [rawItem]);

	// ------------------------------------------------------------------
	// 4. Ítem final: prioridad 1) ejemplo, 2) contexto, 3) fallback API
	// ------------------------------------------------------------------
	const itemToShow = useExampleData
		? exampleSurveyItem
		: itemFromContext || normalizedFallbackItem;

	const latestClassification = itemToShow?.latestClassification;
	const isLoading = isFindOneLoading && !itemFromContext && !useExampleData;

	// ------------------------------------------------------------------
	// Utilidades de formato
	// ------------------------------------------------------------------
	const formatDate = (dateString?: string): string => {
		if (!dateString) return 'No disponible';
		return new Date(dateString).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	const formatDateTime = (dateString?: string): string => {
		if (!dateString) return 'No disponible';
		return new Date(dateString).toLocaleString('es-ES');
	};

	const handleRetry = (): void => {
		setUseExampleData(false);
		refetch();
	};

	// ------------------------------------------------------------------
	// Validaciones de estado
	// ------------------------------------------------------------------
	if (!id) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<Alert variant="destructive" className="max-w-2xl w-full">
					<InfoIcon className="h-4 w-4" />
					<AlertDescription className="text-black">
						ID no proporcionado en la URL. Vuelve al radar y selecciona un elemento.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="w-full max-w-6xl mx-auto space-y-6 p-4 mt-4">
				<Skeleton className="h-12 w-3/4" />
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Skeleton className="h-64 w-full" />
					<Skeleton className="h-64 w-full" />
				</div>
				<Skeleton className="h-96 w-full" />
			</div>
		);
	}

	if (error && !itemFromContext && !useExampleData) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<div className="max-w-2xl w-full space-y-4">
					<Alert variant="destructive" className="flex gap-x-5">
						<InfoIcon className="h-4 w-4" />
						<AlertDescription>
							Error al cargar el elemento:{' '}
							{error instanceof Error ? error.message : 'El servidor no está disponible.'}
						</AlertDescription>
					</Alert>

					<Card>
						<CardHeader>
							<CardTitle>¿Qué quieres hacer?</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex flex-col sm:flex-row gap-3">
								<Button
									onClick={handleRetry}
									disabled={isFetching}
									className="flex-1"
									variant="default"
								>
									{isFetching ? (
										<>
											<RefreshCw className="h-4 w-4 animate-spin mr-2" />
											Reintentando...
										</>
									) : (
										<>
											<RefreshCw className="h-4 w-4 mr-2" />
											Reintentar conexión con API
										</>
									)}
								</Button>
								<Button
									onClick={() => setUseExampleData(true)}
									className="flex-1"
									variant="outline"
								>
									Ver datos de ejemplo
								</Button>
							</div>
							<div className="text-sm text-gray-500 pt-2">
								<p className="font-medium mb-1">Datos de ejemplo que verás:</p>
								<ul className="list-disc pl-5 space-y-1">
									<li>Elemento: {exampleSurveyItem.title}</li>
									<li>Cuadrante: {exampleSurveyItem.itemField}</li>
									<li>Anillo: {exampleSurveyItem.latestClassification?.classification}</li>
									<li>Insight generado por el análisis</li>
								</ul>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	if (!itemToShow) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<Alert variant="default" className="max-w-2xl w-full">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="flex items-start gap-3">
							<InfoIcon className="h-5 w-5 mt-0.5" />
							<div>
								<AlertDescription className="text-black font-medium">
									Elemento no encontrado
								</AlertDescription>
								<AlertDescription className="text-black text-sm mt-1">
									El elemento que buscas no existe o ha sido eliminado.
								</AlertDescription>
							</div>
						</div>
						<Button
							variant="outline"
							onClick={() => window.history.back()}
							className="border-gray-300 hover:bg-gray-50"
						>
							Volver al radar
						</Button>
					</div>
				</Alert>
			</div>
		);
	}

	return (
		<section className="w-full min-h-screen max-w-6xl mx-auto p-4 space-y-6 lg:mt-4 mt-16">
			{/* Banner de datos de ejemplo */}
			{useExampleData && (
				<Alert variant="destructive" className="flex md:flex-row flex-col md:items-stretch items-center md:gap-y-0 gap-y-3 md:gap-x-3 gap-x-0">
					<div className="flex justify-center items-center gap-x-2">
						<InfoIcon className="h-4 w-4" />
						<AlertDescription className="flex md:flex-row flex-col md:items-normal items-center">
							<strong>Mostrando datos de ejemplo</strong>
							<p>- El servidor no está disponible</p>
						</AlertDescription>
					</div>
					<Button size="sm" variant="outline" onClick={handleRetry} disabled={isFetching}>
						{isFetching ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Reintentar conexión'}
					</Button>
				</Alert>
			)}

			{/* Cabecera */}
			<Card>
				<CardHeader>
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
						<div className="flex-1">
							<CardTitle className="text-2xl font-bold">{itemToShow.title}</CardTitle>
							<p className="text-gray-600 mt-2">{itemToShow.summary || 'Sin descripción disponible'}</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<Badge
								className="px-3 py-1 text-white"
								style={{ backgroundColor: getQuadrantColor(itemToShow.itemField) }}
							>
								{itemToShow.itemField}
							</Badge>
							<Badge
								className="px-3 py-1 text-white"
								style={{ backgroundColor: getRingColor(latestClassification?.classification ?? RadarRing.HOLD) }}
							>
								{latestClassification?.classification ?? RadarRing.HOLD}
							</Badge>
							{useExampleData && (
								<Badge variant="outline" className="px-3 py-1">
									Ejemplo
								</Badge>
							)}
						</div>
					</div>
				</CardHeader>
			</Card>

			<Tabs defaultValue="overview" className="w-full">
				<TabsList className="grid grid-cols-2 mb-6">
					<TabsTrigger value="overview">Vista General</TabsTrigger>
					<TabsTrigger value="analysis">Análisis</TabsTrigger>
				</TabsList>

				{/* Vista General */}
				<TabsContent value="overview" className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Tarjeta de última clasificación */}
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-lg flex items-center gap-2">
									<Calendar className="h-5 w-5" />
									Última Clasificación
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-center">
									<div className="text-xl font-bold">
										{formatDate(latestClassification?.analyzedAt)}
									</div>
									<div className="mt-2 inline-flex items-center gap-2">
										<div
											className="w-3 h-3 rounded-full"
											style={{ backgroundColor: getRingColor(latestClassification?.classification ?? RadarRing.HOLD) }}
										/>
										<span
											className="font-medium"
											style={{ color: getRingColor(latestClassification?.classification ?? RadarRing.HOLD) }}
										>
											{latestClassification?.classification ?? RadarRing.HOLD}
										</span>
									</div>
									<p className="text-sm text-gray-500 mt-2">
										Anillo asignado en el último análisis
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Tarjeta de información del elemento */}
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-lg flex items-center gap-2">
									<InfoIcon className="h-5 w-5" />
									Detalles del Elemento
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-gray-500">Creado:</span>
										<span className="font-medium">{formatDate(itemToShow.createdAt)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-500">Actualizado:</span>
										<span className="font-medium">{formatDate(itemToShow.updatedAt)}</span>
									</div>
									{itemToShow.insertedById && (
										<div className="flex justify-between">
											<span className="text-gray-500">Insertado por:</span>
											<span className="font-medium">{itemToShow.insertedById}</span>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Pestaña de Análisis */}
				<TabsContent value="analysis" className="space-y-6">
					{latestClassification ? (
						<>
							{/* Insight principal */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<Lightbulb className="h-5 w-5" />
										Insight del Análisis
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
										{latestClassification.insightsValues?.insight || 'No hay insight disponible.'}
									</p>
									<div className="mt-4 text-xs text-gray-500">
										Análisis realizado: {formatDateTime(latestClassification.analyzedAt)}
									</div>
								</CardContent>
							</Card>

							{/* Métricas de razonamiento (traducidas al español) */}
							{latestClassification.insightsValues?.reasoningMetrics &&
								Object.keys(latestClassification.insightsValues.reasoningMetrics).length > 0 && (
									<Card>
										<CardHeader>
											<CardTitle className="text-lg flex items-center gap-2">
												<BarChart3 className="h-5 w-5" />
												Métricas de Razonamiento
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
												{Object.entries(
													latestClassification.insightsValues.reasoningMetrics
												).map(([key, value]) => (
													<div key={key} className="flex flex-col p-3 bg-gray-50 rounded-lg">
														<span className="text-sm text-gray-600">
															{translateMetricKey(key)}
														</span>
														<span className="text-lg font-semibold">
															{typeof value === 'number' ? (value * 100).toFixed(0) : String(value)}%
														</span>
													</div>
												))}
											</div>
										</CardContent>
									</Card>
								)}
						</>
					) : (
						<Alert>
							<InfoIcon className="h-4 w-4" />
							<AlertDescription>No hay análisis disponibles para este elemento.</AlertDescription>
						</Alert>
					)}
				</TabsContent>
			</Tabs>
		</section>
	);
};