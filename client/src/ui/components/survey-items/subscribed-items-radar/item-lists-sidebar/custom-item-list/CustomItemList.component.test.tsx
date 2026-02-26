// Mocks de redux-persist deben ir primero para evitar que Jest intente importar los módulos reales
jest.mock('redux-persist', () => ({
    persistReducer: jest.fn((reducers: any) => reducers),
    persistStore: jest.fn(),
}));

jest.mock('redux-persist/es/persistReducer', () => ({
    __esModule: true,
    default: (reducers: any) => reducers,
}));

jest.mock('redux-persist/lib/storage', () => ({
    __esModule: true,
    default: jest.fn(),
}));

// Mock del archivo env para evitar errores con import.meta
jest.mock('../../../../../../infrastructure/config/env', () => ({
    getEnv: jest.fn(() => ({
        VITE_SERVER_BASE_URL: 'http://localhost:3000',
        VITE_SITE_BASE_URL: 'http://localhost:5173',
        VITE_NOVU_APPLICATION_ID: 'mock-app-id',
        VITE_NOVU_SECRET_KEY: 'mock-secret',
        VITE_CLERK_PUBLISHABLE_KEY: 'mock-clerk-key',
    })),
}));

// Mocks de componentes UI
jest.mock('../../../..', () => ({
    DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
    DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
    DropdownMenuContent: ({ children, className }: any) => (
        <div data-testid="dropdown-content" className={className}>{children}</div>
    ),
    DropdownMenuItem: ({ children, onClick }: any) => (
        <button data-testid="dropdown-item" onClick={onClick}>{children}</button>
    ),
    DropdownMenuLabel: ({ children }: any) => <div data-testid="dropdown-label">{children}</div>,
    DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
    Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
    TooltipTrigger: ({ children }: any) => <div data-testid="tooltip-trigger">{children}</div>,
    TooltipContent: ({ children }: any) => <div data-testid="tooltip-content">{children}</div>,
    Button: ({ children, onClick, variant, size, name, className }: any) => (
        <button
            data-testid={`button-${name || 'unknown'}`}
            onClick={onClick}
            data-variant={variant}
            data-size={size}
            className={className}
        >
            {children}
        </button>
    ),
}));

jest.mock('lucide-react', () => ({
    Trash2: () => <div data-testid="trash-icon" />,
}));

jest.mock('./CustomItemList.styles', () => ({
    expandButton: 'mock-expand-button-class',
}));

// Ahora imports
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CustomItemsList } from './CustomItemList.component';
import { RadarQuadrant, RadarRing, type UserItemList } from '../../../../../../infrastructure';
import { UUID } from '../../../../../../infrastructure';

describe('CustomItemsList', () => {
    const mockOnRename = jest.fn();
    const mockOnAddItem = jest.fn();
    const mockOnRemoveItem = jest.fn();
    const mockOnDeleteList = jest.fn();

    const mockList: UserItemList = {
        id: 'list-123' as UUID,
        name: 'Test List',
        items: [
            {
                id: 'item-1' as UUID,
                title: 'Item 1',
                itemField: RadarQuadrant.LANGUAGES_AND_FRAMEWORKS,
                latestClassification: {
                    classification: RadarRing.ADOPT,
                    id: 'class-1' as UUID,
                    analyzedAt: '2023-01-01',
                    itemId: 'item-1',
                    insightsValues: {
                        citedFragmentIds: [],
                        insight: '',
                        reasoningMetrics: undefined,
                    },
                },
            } as any,
            {
                id: 'item-2' as UUID,
                title: 'Item 2',
                itemField: RadarQuadrant.BUSSINESS_INTEL,
                latestClassification: {
                    classification: RadarRing.TEST,
                    id: 'class-2' as UUID,
                    analyzedAt: '2023-01-01',
                    itemId: 'item-2',
                    insightsValues: {
                        citedFragmentIds: [],
                        insight: '',
                        reasoningMetrics: undefined,
                    },
                },
            } as any,
        ],
    };

    const renderComponent = (props = {}) => {
        const defaultProps = {
            list: mockList,
            onRename: mockOnRename,
            onAddItem: mockOnAddItem,
            onRemoveItem: mockOnRemoveItem,
            onDeleteList: mockOnDeleteList,
        };
        return render(<CustomItemsList {...defaultProps} {...props} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders trigger button with list name', () => {
        renderComponent();
        const triggerButton = screen.getByRole('button', { name: /test list/i });
        expect(triggerButton).toBeInTheDocument();
        expect(triggerButton).toHaveClass('mock-expand-button-class');
    });

    test('opens dropdown when trigger clicked', async () => {
        renderComponent();
        expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
        expect(screen.getByTestId('dropdown-label')).toHaveTextContent('Test List');
    });

    test('displays list items when present', () => {
        renderComponent();
        const content = screen.getByTestId('dropdown-content');
        expect(within(content).getByText('Item 1')).toBeInTheDocument();
        expect(within(content).getByText('Item 2')).toBeInTheDocument();
        const trashIcons = within(content).getAllByTestId('trash-icon');
        expect(trashIcons).toHaveLength(2);
    });

    test('shows empty message when no items', () => {
        const emptyList = { ...mockList, items: [] };
        renderComponent({ list: emptyList });
        const content = screen.getByTestId('dropdown-content');
        expect(within(content).getByText('Sin elementos')).toBeInTheDocument();
        expect(within(content).queryByTestId('trash-icon')).not.toBeInTheDocument();
    });

    test('calls onRename when "Cambiar nombre" clicked', async () => {
        const user = userEvent.setup();
        renderComponent();
        const renameButton = screen.getAllByTestId('dropdown-item').find(btn =>
            btn.textContent?.includes('Cambiar nombre')
        );
        expect(renameButton).toBeDefined();
        await user.click(renameButton!);
        expect(mockOnRename).toHaveBeenCalledWith(mockList.id, mockList.name);
    });

    test('calls onAddItem when "Agregar elemento" clicked', async () => {
        const user = userEvent.setup();
        renderComponent();
        const addButton = screen.getAllByTestId('dropdown-item').find(btn =>
            btn.textContent?.includes('Agregar elemento')
        );
        expect(addButton).toBeDefined();
        await user.click(addButton!);
        expect(mockOnAddItem).toHaveBeenCalledWith(mockList.id);
    });

    test('calls onDeleteList when "Eliminar lista" clicked', async () => {
        const user = userEvent.setup();
        renderComponent();
        const deleteButton = screen.getAllByTestId('dropdown-item').find(btn =>
            btn.textContent?.includes('Eliminar lista')
        );
        expect(deleteButton).toBeDefined();
        await user.click(deleteButton!);
        expect(mockOnDeleteList).toHaveBeenCalledWith(mockList.id);
    });

    test('calls onRemoveItem when trash button clicked for an item', async () => {
        const user = userEvent.setup();
        renderComponent();
        const trashButtons = screen.getAllByTestId('button-cesto');
        expect(trashButtons).toHaveLength(2);

        await user.click(trashButtons[0]);
        expect(mockOnRemoveItem).toHaveBeenCalledWith(mockList.id, [mockList.items[0].id]);

        await user.click(trashButtons[1]);
        expect(mockOnRemoveItem).toHaveBeenCalledWith(mockList.id, [mockList.items[1].id]);
    });

    test('handles missing callbacks gracefully', () => {
        renderComponent({
            onRename: undefined,
            onAddItem: undefined,
            onRemoveItem: undefined,
            onDeleteList: undefined,
        });
        expect(screen.getByRole('button', { name: /test list/i })).toBeInTheDocument();
        const renameButton = screen.getAllByTestId('dropdown-item').find(btn =>
            btn.textContent?.includes('Cambiar nombre')
        );
        expect(() => renameButton?.click()).not.toThrow();
    });
});