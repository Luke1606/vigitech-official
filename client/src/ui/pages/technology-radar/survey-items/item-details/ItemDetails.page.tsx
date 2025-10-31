import type { UUID } from "crypto";
import React from "react";
import { useParams } from "react-router-dom";
import { InfoIcon } from "lucide-react";
import { useSurveyItems } from "../../../../../infrastructure";
import {
	Alert,
	AlertDescription,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Skeleton
} from "../../../../components";

export const ItemDetails: React.FC = () => {
	const { id } = useParams<{ id: UUID }>();
	const { findOne } = useSurveyItems();
	const { data: item, isLoading, error } = findOne(id! as UUID);

	if (isLoading) {
		return (
			<Card className="w-full max-w-2xl mx-auto">
				<CardHeader>
					<Skeleton className="h-8 w-3/4" />
				</CardHeader>

				<CardContent>
					<Skeleton className="h-4 w-full mb-2" />
					<Skeleton className="h-4 w-2/3" />
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<InfoIcon className="h-4 w-4" />

				<AlertDescription>
					Ocurrió un error al cargar el elemento: {error.message}
				</AlertDescription>
			</Alert>
		);
	}

	if (!item) {
		return (
			<Alert variant="default" className="mt-5">
				<InfoIcon className="h-4 w-4" />

				<AlertDescription>
					Elemento no encontrado
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<Card className="w-full max-w-2xl">
			<CardHeader>
				<CardTitle>{item.title}</CardTitle>
			</CardHeader>

			<CardContent>
				<p>{item.summary}</p>

				<div className="mt-4">
					<p><strong>Categoría:</strong> {item.radarQuadrant}</p>
					<p><strong>Participantes:</strong> {item.radarRing}</p>
					<p><strong>Duración estimada:</strong> {item.lastAnalysis?.searchedDate.getTime()} minutos</p>
				</div>
			</CardContent>
		</Card>
	);
};