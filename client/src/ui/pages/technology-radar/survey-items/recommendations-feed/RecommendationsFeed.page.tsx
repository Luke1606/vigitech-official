import { useSurveyItemsWithStore } from '@/hooks';
import { Trash2, Plus } from 'lucide-react';
import { 
    Card, 
    CardHeader, 
    CardTitle, 
    CardDescription, 
    CardFooter 
} from '@/ui/components/shared/shadcn-ui/card';
import { Button } from '@/ui/components/shared/shadcn-ui/button';
import type { SurveyItemDto } from '@/infrastructure';

export const RecommendationsFeed: React.FC = () => {
    const { 
        recommendations, 
        subscribe, 
        remove, 
        isLoading 
    } = useSurveyItemsWithStore();

    if (recommendations.isLoading) {
        return <div>Loading recommendations...</div>;
    }

    if (recommendations.error) {
        return <div>Error loading recommendations: {recommendations.error.message}</div>;
    }

    return (
        <div className="space-y-4">
        <h2 className="text-2xl font-bold">Recommendations</h2>
        {recommendations.data?.length === 0 ? (
            <p>No recommendations available.</p>
        ) : (
            recommendations.data?.map((item: SurveyItemDto) => (
            <Card key={item.id}>
                <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.summary}</CardDescription>
                </CardHeader>
                <CardFooter>
                <Button
                    onClick={() => subscribe(item.id)}
                    disabled={isLoading.subscribe}
                    className="mr-2"
                >
                    <Plus className="w-4 h-4 mr-2" /> Subscribe
                </Button>
                <Button
                    variant="destructive"
                    onClick={() => remove(item.id)}
                    disabled={isLoading.remove}
                >
                    <Trash2 className="w-4 h-4 mr-2" /> Remove
                </Button>
                </CardFooter>
            </Card>
            ))
        )}
        </div>
    );
};