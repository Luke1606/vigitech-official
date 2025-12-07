import type { UUID } from "crypto";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
	InfoIcon,
	TrendingUp,
	TrendingDown,
	Minus,
	AlertTriangle,
	DollarSign,
	Lock,
	Globe,
	BarChart3,
	PieChart,
	Calendar,
	Users,
	Target,
	Download,
	BookOpen,
	Star,
	RefreshCw
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
	Button
} from "../../../../components/";
import {
	RadarQuadrant,
	RadarRing,
	Trending,
	AccesibilityLevel,
	type SurveyItem,
	type SurveyItemAnalysis,
	type AnalysisMetrics
} from "../../../../../infrastructure";

// Importaciones de Recharts para gráficos
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	PieChart as RechartsPieChart,
	Pie,
	Cell,
	RadarChart,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
	Radar,
} from 'recharts';

export const ItemDetails: React.FC = () => {
	// Obtener el id de los parámetros de la URL
	const { id } = useParams<{ id: UUID }>();

	const query = useSurveyItemsAPI();
	const [useExampleData, setUseExampleData] = useState(false);

	// Datos de ejemplo estáticos
	const exampleSurveyItem: SurveyItem = {
		id: '550e8400-e29b-41d4-a716-446655440000' as UUID,
		title: 'Machine Learning en Análisis Predictivo',
		summary: 'Implementación de modelos de ML para predecir tendencias del mercado utilizando algoritmos de aprendizaje supervisado y no supervisado.',
		radarQuadrant: RadarQuadrant.BUSSINESS_INTEL,
		radarRing: RadarRing.ADOPT,
		lastAnalysis: {
			obtainedMetrics: {
				citations: 245,
				downloads: 12500,
				relevance: 8.7,
				accesibilityLevel: AccesibilityLevel.FREE,
				trending: Trending.UP
			},
			searchedDate: new Date('2024-01-15')
		}
	};

	// Usar directamente el hook de React Query con el id de los params
	const {
		data: item,
		isLoading,
		error,
		refetch,
		isFetching
	} = query.findOne(id!);

	// Datos a mostrar (ejemplo o API)
	const itemToShow = useExampleData ? exampleSurveyItem : item;

	// Función para obtener el color del cuadrante
	const getQuadrantColor = (quadrant: RadarQuadrant): string => {
		const colors: Record<RadarQuadrant, string> = {
			[RadarQuadrant.BUSSINESS_INTEL]: '#3B82F6',
			[RadarQuadrant.SCIENTIFIC_STAGE]: '#10B981',
			[RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES]: '#F59E0B',
			[RadarQuadrant.LANGUAGES_AND_FRAMEWORKS]: '#8B5CF6',
		};
		return colors[quadrant] || '#6B7280';
	};

	// Función para obtener el color del anillo
	const getRingColor = (ring: RadarRing): string => {
		const colors: Record<RadarRing, string> = {
			[RadarRing.ADOPT]: '#10B981',
			[RadarRing.TEST]: '#F59E0B',
			[RadarRing.SUSTAIN]: '#3B82F6',
			[RadarRing.HOLD]: '#EF4444',
		};
		return colors[ring] || '#6B7280';
	};

	// Función para obtener el icono y color de trending
	const getTrendingConfig = (trending: Trending) => {
		switch (trending) {
			case Trending.UP:
				return { icon: TrendingUp, color: '#10B981', label: 'En aumento' };
			case Trending.DOWN:
				return { icon: TrendingDown, color: '#EF4444', label: 'En descenso' };
			case Trending.STABLE:
				return { icon: Minus, color: '#6B7280', label: 'Estable' };
			case Trending.UNSTABLE:
				return { icon: AlertTriangle, color: '#F59E0B', label: 'Inestable' };
			default:
				return { icon: Minus, color: '#6B7280', label: 'Desconocido' };
		}
	};

	// Función para obtener el icono y color de accesibilidad
	const getAccessibilityConfig = (level: AccesibilityLevel) => {
		switch (level) {
			case AccesibilityLevel.FREE:
				return { icon: Globe, color: '#10B981', label: 'Gratuito' };
			case AccesibilityLevel.PAID:
				return { icon: DollarSign, color: '#8B5CF6', label: 'De pago' };
			default:
				return { icon: Lock, color: '#6B7280', label: 'Desconocido' };
		}
	};

	// Preparar datos para gráficos
	const prepareMetricsData = (metrics?: AnalysisMetrics) => {
		if (!metrics) return null;

		return {
			barData: [
				{ name: 'Citas', value: metrics.citations, color: '#3B82F6' },
				{ name: 'Descargas', value: metrics.downloads, color: '#10B981' },
				{ name: 'Relevancia', value: metrics.relevance, color: '#8B5CF6' },
			],
			radarData: [
				{ metric: 'Citas', value: metrics.citations, fullMark: Math.max(metrics.citations * 2, 100) },
				{ metric: 'Descargas', value: metrics.downloads, fullMark: Math.max(metrics.downloads * 2, 100) },
				{ metric: 'Relevancia', value: metrics.relevance, fullMark: 10 },
				{ metric: 'Accesibilidad', value: metrics.accesibilityLevel === AccesibilityLevel.FREE ? 100 : 50, fullMark: 100 },
			],
			pieData: [
				{ name: 'Citas', value: metrics.citations, color: '#3B82F6' },
				{ name: 'Descargas', value: metrics.downloads, color: '#10B981' },
				{ name: 'Relevancia', value: metrics.relevance * 10, color: '#8B5CF6' },
			]
		};
	};

	// Función para manejar el retry
	const handleRetry = () => {
		setUseExampleData(false);
		refetch();
	};

	// Verificar si hay un ID en los parámetros
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

	if (isLoading && !useExampleData) {
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

	if (error && !useExampleData) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<div className="max-w-2xl w-full space-y-4">
					<Alert variant="destructive" className="flex gap-x-5">
						<InfoIcon className="h-4 w-4" />
						<AlertDescription>
							Error al cargar el elemento: {error.message || "El servidor no está disponible."}
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
									<li>Cuadrante: {exampleSurveyItem.radarQuadrant}</li>
									<li>Anillo: {exampleSurveyItem.radarRing}</li>
									<li>Métricas de análisis completas</li>
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

	const metricsData = prepareMetricsData(itemToShow.lastAnalysis?.obtainedMetrics);
	const trendingConfig = getTrendingConfig(itemToShow.lastAnalysis?.obtainedMetrics.trending || Trending.STABLE);
	const accessibilityConfig = getAccessibilityConfig(itemToShow.lastAnalysis?.obtainedMetrics.accesibilityLevel || AccesibilityLevel.FREE);

	return (
		<section className="w-full max-w-6xl mx-auto p-4 space-y-6 lg:mt-4 mt-16">
			{/* Banner informativo cuando se usan datos de ejemplo */}
			{useExampleData && (
				<Alert variant="destructive" className="flex md:flex-row flex-col md:items-stretch items-center md:gap-y-0 gap-y-3 md:gap-x-3 gap-x-0">
					<div className="flex justify-center items-center gap-x-2">
						<InfoIcon className="h-4 w-4" />
						<AlertDescription className="flex md:flex-row flex-col md:items-normal items-center">
							<strong>Mostrando datos de ejemplo</strong>
							<p>- El servidor no está disponible</p>
						</AlertDescription>
					</div>

					<Button
						size="sm"
						variant="outline"
						onClick={handleRetry}
						disabled={isFetching}
					>
						{isFetching ? (
							<RefreshCw className="h-3 w-3 animate-spin" />
						) : (
							'Reintentar conexión'
						)}
					</Button>
				</Alert>
			)}

			{/* Header con información básica */}
			<Card>
				<CardHeader>
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
						<div className="flex-1">
							<CardTitle className="text-2xl font-bold">{itemToShow.title}</CardTitle>
							<p className="text-gray-600 mt-2">{itemToShow.summary || "Sin descripción disponible"}</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<Badge
								className="px-3 py-1 text-white"
								style={{ backgroundColor: getQuadrantColor(itemToShow.radarQuadrant) }}
							>
								{itemToShow.radarQuadrant}
							</Badge>
							<Badge
								className="px-3 py-1 text-white"
								style={{ backgroundColor: getRingColor(itemToShow.radarRing) }}
							>
								{itemToShow.radarRing}
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

			{/* Resto del componente se mantiene igual, usando itemToShow en lugar de item */}
			<Tabs defaultValue="overview" className="w-full">
				<TabsList className="grid grid-cols-3 mb-6">
					<TabsTrigger value="overview">Vista General</TabsTrigger>
					<TabsTrigger value="metrics">Métricas Detalladas</TabsTrigger>
					<TabsTrigger value="analysis">Análisis</TabsTrigger>
				</TabsList>

				{/* Tab 1: Vista General */}
				<TabsContent value="overview" className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{/* Tarjeta de tendencia */}
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-lg flex items-center gap-2">
									<trendingConfig.icon className="h-5 w-5" style={{ color: trendingConfig.color }} />
									Tendencia
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-center">
									<div className="text-3xl font-bold" style={{ color: trendingConfig.color }}>
										{trendingConfig.label}
									</div>
									<p className="text-sm text-gray-500 mt-2">Estado actual del elemento en el mercado</p>
								</div>
							</CardContent>
						</Card>

						{/* Tarjeta de accesibilidad */}
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-lg flex items-center gap-2">
									<accessibilityConfig.icon className="h-5 w-5" style={{ color: accessibilityConfig.color }} />
									Accesibilidad
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-center">
									<div className="text-3xl font-bold" style={{ color: accessibilityConfig.color }}>
										{accessibilityConfig.label}
									</div>
									<p className="text-sm text-gray-500 mt-2">Nivel de acceso a la tecnología</p>
								</div>
							</CardContent>
						</Card>

						{/* Tarjeta de última actualización */}
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-lg flex items-center gap-2">
									<Calendar className="h-5 w-5" />
									Última Actualización
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-center">
									<div className="text-xl font-bold">
										{itemToShow.lastAnalysis
											? new Date(itemToShow.lastAnalysis.searchedDate).toLocaleDateString('es-ES', {
												year: 'numeric',
												month: 'long',
												day: 'numeric'
											})
											: 'No disponible'
										}
									</div>
									<p className="text-sm text-gray-500 mt-2">Fecha del último análisis</p>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Gráfico de métricas principales */}
					{metricsData && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<BarChart3 className="h-5 w-5" />
									Métricas Principales
								</CardTitle>
							</CardHeader>
							<CardContent>
								<ResponsiveContainer width="100%" height={300}>
									<BarChart data={metricsData.barData}>
										<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
										<XAxis dataKey="name" stroke="#6b7280" />
										<YAxis stroke="#6b7280" />
										<Tooltip
											contentStyle={{
												backgroundColor: 'white',
												border: '1px solid #e5e7eb',
												borderRadius: '0.375rem'
											}}
										/>
										<Bar dataKey="value" radius={[4, 4, 0, 0]}>
											{metricsData.barData.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={entry.color} />
											))}
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* Tab 2: Métricas Detalladas */}
				<TabsContent value="metrics" className="space-y-6">
					{metricsData ? (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Gráfico de radar para comparación multidimensional */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<Target className="h-5 w-5" />
										Análisis Multidimensional
									</CardTitle>
								</CardHeader>
								<CardContent>
									<ResponsiveContainer width="100%" height={300}>
										<RadarChart data={metricsData.radarData}>
											<PolarGrid stroke="#e5e7eb" />
											<PolarAngleAxis dataKey="metric" stroke="#6b7280" />
											<PolarRadiusAxis stroke="#6b7280" />
											<Radar
												name="Valores"
												dataKey="value"
												stroke="#3B82F6"
												fill="#3B82F6"
												fillOpacity={0.6}
											/>
										</RadarChart>
									</ResponsiveContainer>
								</CardContent>
							</Card>

							{/* Gráfico de pastel para distribución */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<PieChart className="h-5 w-5" />
										Distribución de Métricas
									</CardTitle>
								</CardHeader>
								<CardContent>
									<ResponsiveContainer width="100%" height={300}>
										<RechartsPieChart>
											<Pie
												data={metricsData.pieData}
												cx="50%"
												cy="50%"
												labelLine={false}
												label={(entry) => `${entry.name}: ${entry.value}`}
												outerRadius={80}
												fill="#8884d8"
												dataKey="value"
											>
												{metricsData.pieData.map((entry, index) => (
													<Cell key={`cell-${index}`} fill={entry.color} />
												))}
											</Pie>
											<Tooltip />
											<Legend />
										</RechartsPieChart>
									</ResponsiveContainer>
								</CardContent>
							</Card>

							{/* Tarjetas de métricas individuales */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:col-span-2">
								<Card>
									<CardContent className="pt-6">
										<div className="flex items-center gap-3">
											<div className="p-2 rounded-lg bg-blue-100">
												<BookOpen className="h-6 w-6 text-blue-600" />
											</div>
											<div>
												<p className="text-sm text-gray-500">Citas</p>
												<p className="text-2xl font-bold">{itemToShow.lastAnalysis?.obtainedMetrics.citations || 0}</p>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardContent className="pt-6">
										<div className="flex items-center gap-3">
											<div className="p-2 rounded-lg bg-green-100">
												<Download className="h-6 w-6 text-green-600" />
											</div>
											<div>
												<p className="text-sm text-gray-500">Descargas</p>
												<p className="text-2xl font-bold">{itemToShow.lastAnalysis?.obtainedMetrics.downloads || 0}</p>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardContent className="pt-6">
										<div className="flex items-center gap-3">
											<div className="p-2 rounded-lg bg-purple-100">
												<Star className="h-6 w-6 text-purple-600" />
											</div>
											<div>
												<p className="text-sm text-gray-500">Relevancia</p>
												<p className="text-2xl font-bold">{itemToShow.lastAnalysis?.obtainedMetrics.relevance || 0}</p>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						</div>
					) : (
						<Alert>
							<InfoIcon className="h-4 w-4" />
							<AlertDescription>
								No hay métricas disponibles para este elemento.
							</AlertDescription>
						</Alert>
					)}
				</TabsContent>

				{/* Tab 3: Análisis */}
				<TabsContent value="analysis" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg flex items-center gap-2">
								<Users className="h-5 w-5" />
								Contexto del Elemento
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div>
									<h4 className="font-semibold text-gray-700 mb-2">Posicionamiento en el Radar</h4>
									<div className="flex items-center gap-4">
										<div className="flex-1">
											<div className="text-sm text-gray-500 mb-1">Cuadrante</div>
											<div className="flex items-center gap-2">
												<div
													className="w-4 h-4 rounded"
													style={{ backgroundColor: getQuadrantColor(itemToShow.radarQuadrant) }}
												/>
												<span className="font-medium">{itemToShow.radarQuadrant}</span>
											</div>
										</div>
										<div className="flex-1">
											<div className="text-sm text-gray-500 mb-1">Anillo</div>
											<div className="flex items-center gap-2">
												<div
													className="w-4 h-4 rounded-full"
													style={{ backgroundColor: getRingColor(itemToShow.radarRing) }}
												/>
												<span className="font-medium">{itemToShow.radarRing}</span>
											</div>
										</div>
									</div>
								</div>

								<div>
									<h4 className="font-semibold text-gray-700 mb-2">Recomendación</h4>
									<div className="p-4 rounded-lg bg-gray-50">
										{itemToShow.radarRing === RadarRing.ADOPT && (
											<p className="text-green-700">
												<strong>Adoptar:</strong> Esta tecnología está madura y lista para ser adoptada en proyectos de producción.
											</p>
										)}
										{itemToShow.radarRing === RadarRing.TEST && (
											<p className="text-amber-700">
												<strong>Probar:</strong> Evaluar en proyectos piloto antes de adoptar en producción.
											</p>
										)}
										{itemToShow.radarRing === RadarRing.SUSTAIN && (
											<p className="text-blue-700">
												<strong>Evaluar:</strong> Mantener vigilancia activa sobre esta tecnología.
											</p>
										)}
										{itemToShow.radarRing === RadarRing.HOLD && (
											<p className="text-red-700">
												<strong>Detener:</strong> Considerar descontinuar el uso de esta tecnología.
											</p>
										)}
									</div>
								</div>

								{itemToShow.lastAnalysis && (
									<div>
										<h4 className="font-semibold text-gray-700 mb-2">Último Análisis</h4>
										<div className="space-y-2 text-sm">
											<div className="flex justify-between">
												<span className="text-gray-500">Fecha de análisis:</span>
												<span className="font-medium">
													{new Date(itemToShow.lastAnalysis.searchedDate).toLocaleString('es-ES')}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-500">Tendencia detectada:</span>
												<span className="font-medium flex items-center gap-1" style={{ color: trendingConfig.color }}>
													<trendingConfig.icon className="h-4 w-4" />
													{trendingConfig.label}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-500">Modelo de acceso:</span>
												<span className="font-medium flex items-center gap-1" style={{ color: accessibilityConfig.color }}>
													<accessibilityConfig.icon className="h-4 w-4" />
													{accessibilityConfig.label}
												</span>
											</div>
										</div>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Gráfico de evolución temporal */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Evolución Temporal</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-center py-8 text-gray-500">
								<BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
								<p>Historial de análisis no disponible</p>
								<p className="text-sm">Esta funcionalidad estará disponible próximamente</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</section>
	);
};