import { render, screen, fireEvent } from '@testing-library/react';
import { SurveyItemCard } from './SurveyItemCard.component';
import type { SurveyItem, UUID } from '../../../../../infrastructure';

// Mock shared components
jest.mock('../../..', () => ({
    Card: ({ children, className, onClick }: any) => (
        <div data-testid="card" className={className} onClick={onClick}>
            {children}
        </div>
    ),
    CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
    CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
    CardDescription: ({ children }: any) => <div data-testid="card-description">{children}</div>,
    CardFooter: ({ children }: any) => <div data-testid="card-footer">{children}</div>,
    Button: ({ children, onClick, disabled, className }: any) => (
        <button onClick={onClick} disabled={disabled} className={className} data-testid="button">
            {children}
        </button>
    ),
}));

// Mock icons
jest.mock('lucide-react', () => ({
    Plus: () => <span data-testid="icon-plus">+</span>,
    Trash2: () => <span data-testid="icon-trash">trash</span>,
    View: () => <span data-testid="icon-view">view</span>,
}));

const mockUUID = '123e4567-e89b-12d3-a456-426614174000' as UUID;

const mockItem: SurveyItem = {
    id: mockUUID,
    title: 'Test Technology',
    summary: 'A summary',
} as unknown as SurveyItem;

describe('SurveyItemCard', () => {
    const defaultProps = {
        id: mockUUID,
        item: mockItem,
        selected: false,
        onSelect: jest.fn(),
        onUnselect: jest.fn(),
        onSubscribeOne: jest.fn(),
        onRemoveOne: jest.fn(),
        onViewDetails: jest.fn(),
        isLoading: {
            subscribeOne: false,
            removeOne: false,
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders item title and summary', () => {
        render(<SurveyItemCard {...defaultProps} />);
        expect(screen.getByText('Test Technology')).toBeInTheDocument();
        expect(screen.getByText('A summary')).toBeInTheDocument();
    });

    test('applies border-blue-400 when selected', () => {
        const { rerender } = render(<SurveyItemCard {...defaultProps} selected={true} />);
        expect(screen.getByTestId('card')).toHaveClass('border-blue-400');

        rerender(<SurveyItemCard {...defaultProps} selected={false} />);
        expect(screen.getByTestId('card')).toHaveClass('border-background');
    });

    test('clicking card calls onUnselect when selected, onSelect when not selected', () => {
        const onSelect = jest.fn();
        const onUnselect = jest.fn();

        const { rerender } = render(
            <SurveyItemCard {...defaultProps} selected={false} onSelect={onSelect} onUnselect={onUnselect} />
        );

        // Click when not selected
        fireEvent.click(screen.getByTestId('card'));
        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onUnselect).not.toHaveBeenCalled();

        // Rerender with selected=true
        rerender(<SurveyItemCard {...defaultProps} selected={true} onSelect={onSelect} onUnselect={onUnselect} />);
        fireEvent.click(screen.getByTestId('card'));
        expect(onUnselect).toHaveBeenCalledTimes(1);
        expect(onSelect).toHaveBeenCalledTimes(1); // Still 1 from before
    });

    test('clicking Detalles button calls onViewDetails', () => {
        const onViewDetails = jest.fn();
        render(<SurveyItemCard {...defaultProps} onViewDetails={onViewDetails} />);
        const buttons = screen.getAllByTestId('button');
        const detallesButton = buttons.find(btn => btn.textContent?.includes('Detalles'));
        fireEvent.click(detallesButton!);
        expect(onViewDetails).toHaveBeenCalledTimes(1);
    });

    test('clicking Suscribirse button calls onSubscribeOne with id', () => {
        const onSubscribeOne = jest.fn();
        render(<SurveyItemCard {...defaultProps} onSubscribeOne={onSubscribeOne} />);
        const buttons = screen.getAllByTestId('button');
        const suscribirseButton = buttons.find(btn => btn.textContent?.includes('Suscribirse'));
        fireEvent.click(suscribirseButton!);
        expect(onSubscribeOne).toHaveBeenCalledWith(mockUUID);
    });

    test('clicking Remover button calls onRemoveOne with id', () => {
        const onRemoveOne = jest.fn();
        render(<SurveyItemCard {...defaultProps} onRemoveOne={onRemoveOne} />);
        const buttons = screen.getAllByTestId('button');
        const removerButton = buttons.find(btn => btn.textContent?.includes('Remover'));
        fireEvent.click(removerButton!);
        expect(onRemoveOne).toHaveBeenCalledWith(mockUUID);
    });

    test('buttons are disabled based on isLoading props', () => {
        render(
            <SurveyItemCard
                {...defaultProps}
                isLoading={{ subscribeOne: true, removeOne: true }}
            />
        );
        const buttons = screen.getAllByTestId('button');
        const detallesButton = buttons.find(btn => btn.textContent?.includes('Detalles'));
        const suscribirseButton = buttons.find(btn => btn.textContent?.includes('Suscribirse'));
        const removerButton = buttons.find(btn => btn.textContent?.includes('Remover'));

        expect(detallesButton).toBeDisabled();
        expect(suscribirseButton).toBeDisabled();
        expect(removerButton).toBeDisabled();
    });
});