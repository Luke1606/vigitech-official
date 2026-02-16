import type { UUID } from "crypto";
import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
	InfoIcon,
	Calendar,
	RefreshCw,
	Lightbulb,
	BarChart3,
} from "lucide-react";
import { useSurveyItemsAPI } from "../../../../../infrastructure/hooks/use-survey-items/api/useSurveyItemsAPI.hook";
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

// ---------- FUNCIONES DE NORMALIZACIÓN ----------
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
				console.warn(`Unknown quadrant: ${value}`);
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
				console.warn(`Unknown ring: ${value}`);
				return value as RadarRing;
		}
	}
	return value as RadarRing;
};
// ------------------------------------------------

// ---------- TRADUCCIONES DE MÉTRICAS ----------
const metricTranslations: Record<string, string> = {
	wasm_server_adoption_rate: 'Tasa de adopción WASM',
	isolation_score: 'Nivel de aislamiento',
	alternative_search_interest: 'Interés en alternativas',
	legacy_configuration_tool: 'Herramienta de configuración heredada',
	modern_alternatives_adoption: 'Adopción de alternativas modernas',
};

const translateMetricKey = (key: string): string => {
	if (metricTranslations[key]) return metricTranslations[key];
	return key
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (char) => char.toUpperCase());
};
// -------------------------------------------------

// Funciones de color
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
	const location = useLocation();
	const query = useSurveyItemsAPI();

	// Item pasado desde la navegación (lo normalizamos inmediatamente)
	const stateItem = location.state?.item as SurveyItem | undefined;

	// Inicializamos displayItem normalizando stateItem si existe
	const [displayItem, setDisplayItem] = useState<SurveyItem | null>(() => {
		if (!stateItem) return null;
		return {
			...stateItem,
			itemField: normalizeQuadrant(stateItem.itemField),
			latestClassification: stateItem.latestClassification
				? {
					...stateItem.latestClassification,
					classification: normalizeRing(stateItem.latestClassification.classification),
				}
				: undefined,
		} as SurveyItem;
	});

	const {
		data: rawItem,
		isLoading,
		error,
		refetch,
		isFetching,
	} = query.findOne(id!);

	// Cuando llegan datos de la API, los fusionamos con los existentes
	useEffect(() => {
		if (rawItem) {
			// Normalizamos los campos básicos del rawItem
			const normalizedBasic = {
				...rawItem,
				itemField: normalizeQuadrant(rawItem.itemField),
			};

			setDisplayItem(prev => {
				// Si rawItem tiene latestClassification, lo normalizamos y usamos
				const latestFromApi = rawItem.latestClassification
					? {
						...rawItem.latestClassification,
						classification: normalizeRing(rawItem.latestClassification.classification),
					}
					: undefined;

				// Priorizamos la clasificación de la API si existe; si no, conservamos la anterior
				const merged = {
					...normalizedBasic,
					latestClassification: latestFromApi || prev?.latestClassification,
				};
				return merged as SurveyItem;
			});
		}
	}, [rawItem]);

	const latestClassification = displayItem?.latestClassification;

	// Utilidades de formato
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
		refetch();
	};

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

	if (!displayItem && isLoading) {
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

	if ((error || !displayItem) && !isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<div className="max-w-2xl w-full space-y-4">
					<Alert variant="destructive" className="flex gap-x-5">
						<InfoIcon className="h-4 w-4" />
						<AlertDescription>
							Error al cargar el elemento:{' '}
							{error instanceof Error ? error.message : 'No se pudo obtener el elemento.'}
						</AlertDescription>
					</Alert>

					<Card>
						<CardHeader>
							<CardTitle>No se pudo cargar la información</CardTitle>
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
											Reintentar
										</>
									)}
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<section className="w-full min-h-screen max-w-6xl mx-auto p-4 space-y-6 lg:mt-4 mt-16">
			<Card>
				<CardHeader>
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
						<div className="flex-1">
							<CardTitle className="text-2xl font-bold">{displayItem!.title}</CardTitle>
							<p className="text-gray-600 mt-2">{displayItem!.summary || 'Sin descripción disponible'}</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<Badge
								className="px-3 py-1 text-white"
								style={{ backgroundColor: getQuadrantColor(displayItem!.itemField) }}
							>
								{displayItem!.itemField}
							</Badge>

							{latestClassification ? (
								<Badge
									className="px-3 py-1 text-white"
									style={{ backgroundColor: getRingColor(latestClassification.classification) }}
								>
									{latestClassification.classification}
								</Badge>
							) : isLoading ? (
								<Badge variant="outline" className="px-3 py-1 animate-pulse">
									Cargando...
								</Badge>
							) : (
								<Badge variant="outline" className="px-3 py-1">
									Sin clasificación
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

				<TabsContent value="overview" className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-lg flex items-center gap-2">
									<Calendar className="h-5 w-5" />
									Última Clasificación
								</CardTitle>
							</CardHeader>
							<CardContent>
								{latestClassification ? (
									<div className="text-center">
										<div className="text-xl font-bold">{formatDate(latestClassification.analyzedAt)}</div>
										<div className="mt-2 inline-flex items-center gap-2">
											<div
												className="w-3 h-3 rounded-full"
												style={{ backgroundColor: getRingColor(latestClassification.classification) }}
											/>
											<span
												className="font-medium"
												style={{ color: getRingColor(latestClassification.classification) }}
											>
												{latestClassification.classification}
											</span>
										</div>
										<p className="text-sm text-gray-500 mt-2">Anillo asignado en el último análisis</p>
									</div>
								) : (
									<p className="text-center text-gray-500">No hay clasificaciones previas</p>
								)}
							</CardContent>
						</Card>

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
										<span className="font-medium">{formatDate(displayItem!.createdAt)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-500">Actualizado:</span>
										<span className="font-medium">{formatDate(displayItem!.updatedAt)}</span>
									</div>
									{displayItem!.insertedById && (
										<div className="flex justify-between">
											<span className="text-gray-500">Insertado por:</span>
											<span className="font-medium">{displayItem!.insertedById}</span>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="analysis" className="space-y-6">
					{latestClassification ? (
						<>
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
												{Object.entries(latestClassification.insightsValues.reasoningMetrics).map(
													([key, value]) => (
														<div key={key} className="flex flex-col p-3 bg-gray-50 rounded-lg">
															<span className="text-sm text-gray-600">{translateMetricKey(key)}</span>
															<span className="text-lg font-semibold">
																{typeof value === 'number' ? (value * 100).toFixed(0) : String(value)}%
															</span>
														</div>
													)
												)}
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