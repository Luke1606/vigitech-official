import { render, screen, fireEvent, within } from '@testing-library/react';
import { RadarMenu } from './RadarMenu.component';
import type { SurveyItem } from '../../../../../../infrastructure';

// Mock shared components
jest.mock('../../../../shared', () => ({
    DropdownMenu: ({ children, open }: any) => open ? <div data-testid="dropdown-menu">{children}</div> : null,
    DropdownMenuContent: ({ children, style, className }: any) => (
        <div data-testid="dropdown-content" style={style} className={className}>
            {children}
        </div>
    ),
    DropdownMenuItem: ({ children, onClick, className }: any) => (
        <div data-testid="dropdown-item" onClick={onClick} className={className}>
            {children}
        </div>
    ),
    DropdownMenuSeparator: () => <hr data-testid="separator" />,
    Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
    DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
    DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
    DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
    DialogDescription: ({ children }: any) => <div data-testid="dialog-description">{children}</div>,
}));

// Mock lucide icons
jest.mock('lucide-react', () => ({
    Maximize: () => <span data-testid="icon-maximize">Maximize</span>,
    Minus: () => <span data-testid="icon-minus">Minus</span>,
    CheckCircle: () => <span data-testid="icon-check">Check</span>,
    Trash2: () => <span data-testid="icon-trash">Trash</span>,
}));

// Helper to create a mock item with minimal required fields
const createMockItem = (id: string, title: string): SurveyItem => ({
    id,
    title,
    itemField: 'LANGUAGES_AND_FRAMEWORKS',
    latestClassification: { classification: 'ADOPT' },
} as unknown as SurveyItem);

describe('RadarMenu', () => {
    const mockItem = createMockItem('1', 'React');
    const mockViewDetails = jest.fn();
    const mockUnsubscribe = jest.fn();
    const mockRemove = jest.fn();
    const mockSelect = jest.fn();
    const mockUnselect = jest.fn();

    const defaultProps = {
        item: mockItem,
        position: { x: 100, y: 200 },
        onViewDetails: mockViewDetails,
        onUnsubscribe: mockUnsubscribe,
        onRemove: mockRemove,
        onSelect: mockSelect,
        onUnselect: mockUnselect,
        isSelected: false,
        selectedCount: 0,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        window.innerWidth = 1024;
        window.dispatchEvent(new Event('resize'));
    });

    const setMobile = () => {
        window.innerWidth = 500;
        window.dispatchEvent(new Event('resize'));
    };

    describe('Desktop version', () => {
        test('renders correctly with default props', () => {
            render(<RadarMenu {...defaultProps} />);

            expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
            // Hay 4 items: Ver detalles, Dejar de seguir, Seleccionar, Eliminar
            expect(screen.getAllByTestId('dropdown-item')).toHaveLength(4);
            expect(screen.getByText('Ver detalles')).toBeInTheDocument();
            expect(screen.getByText('Dejar de seguir (este)')).toBeInTheDocument();
            expect(screen.getByText('Seleccionar')).toBeInTheDocument();
            expect(screen.getByText('Eliminar')).toBeInTheDocument();
            expect(screen.getAllByTestId('icon-maximize')).toHaveLength(1);
            expect(screen.getAllByTestId('icon-minus')).toHaveLength(1);
            expect(screen.getAllByTestId('icon-trash')).toHaveLength(1);
            expect(screen.queryByTestId('icon-check')).not.toBeInTheDocument();
        });

        test('shows selected state when isSelected=true and selectedCount', () => {
            render(<RadarMenu {...defaultProps} isSelected={true} selectedCount={2} />);

            // Badge de selección
            expect(screen.getByText(/2 elementos seleccionados/)).toBeInTheDocument();

            // Hay dos iconos de check: uno en el badge y otro en el botón "Deseleccionar"
            const checkIcons = screen.getAllByTestId('icon-check');
            expect(checkIcons).toHaveLength(2);

            expect(screen.getByText('Deseleccionar')).toBeInTheDocument();
            expect(screen.getByText(/Dejar de seguir \(2 seleccionados\)/)).toBeInTheDocument();
            expect(screen.getByText(/Eliminar \(2 seleccionados\)/)).toBeInTheDocument();
        });

        test('calls onViewDetails when "Ver detalles" clicked', () => {
            render(<RadarMenu {...defaultProps} />);
            fireEvent.click(screen.getByText('Ver detalles'));
            expect(mockViewDetails).toHaveBeenCalledWith(mockItem);
        });

        test('calls onUnsubscribe when "Dejar de seguir" clicked', () => {
            render(<RadarMenu {...defaultProps} />);
            fireEvent.click(screen.getByText(/Dejar de seguir/));
            expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
            // No verificamos los argumentos porque el evento se pasa automáticamente
        });

        test('calls onRemove when "Eliminar" clicked', () => {
            render(<RadarMenu {...defaultProps} />);
            fireEvent.click(screen.getByText('Eliminar'));
            expect(mockRemove).toHaveBeenCalledTimes(1);
        });

        test('calls onSelect when "Seleccionar" clicked and not selected', () => {
            render(<RadarMenu {...defaultProps} isSelected={false} />);
            fireEvent.click(screen.getByText('Seleccionar'));
            expect(mockSelect).toHaveBeenCalledWith(mockItem);
            expect(mockUnselect).not.toHaveBeenCalled();
        });

        test('calls onUnselect when "Deseleccionar" clicked and selected', () => {
            render(<RadarMenu {...defaultProps} isSelected={true} />);
            fireEvent.click(screen.getByText('Deseleccionar'));
            expect(mockUnselect).toHaveBeenCalledWith(mockItem);
            expect(mockSelect).not.toHaveBeenCalled();
        });

        test('position style is applied', () => {
            render(<RadarMenu {...defaultProps} />);
            const content = screen.getByTestId('dropdown-content');
            expect(content).toHaveStyle({
                position: 'fixed',
                left: '100px',
                top: '200px',
            });
        });
    });

    describe('Mobile version', () => {
        beforeEach(() => {
            setMobile();
        });

        test('renders Dialog on mobile', () => {
            render(<RadarMenu {...defaultProps} />);

            expect(screen.getByTestId('dialog')).toBeInTheDocument();
            expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();

            expect(screen.getByTestId('dialog-title')).toHaveTextContent('Opciones del elemento');
            expect(screen.getByTestId('dialog-description')).toHaveTextContent(/React/);

            const buttons = screen.getAllByRole('button');
            expect(buttons).toHaveLength(4);

            expect(screen.getByText('Ver detalles')).toBeInTheDocument();
            expect(screen.getByText(/Dejar de seguir \(este\)/)).toBeInTheDocument();
            expect(screen.getByText('Seleccionar')).toBeInTheDocument();
            expect(screen.getByText('Eliminar')).toBeInTheDocument();

            expect(screen.getAllByTestId('icon-maximize')).toHaveLength(1);
            expect(screen.getAllByTestId('icon-minus')).toHaveLength(1);
            expect(screen.getAllByTestId('icon-trash')).toHaveLength(1);
        });

        test('shows selected state on mobile', () => {
            render(<RadarMenu {...defaultProps} isSelected={true} selectedCount={3} />);

            // Badge en la descripción
            expect(screen.getByTestId('dialog-description')).toHaveTextContent(/3 elementos seleccionados/);

            // El título contiene un icono de check
            const title = screen.getByTestId('dialog-title');
            const checkIconInTitle = within(title).getByTestId('icon-check');
            expect(checkIconInTitle).toBeInTheDocument();

            // El botón "Deseleccionar" también contiene un icono de check
            const deselectButton = screen.getByText('Deseleccionar');
            expect(within(deselectButton).getByTestId('icon-check')).toBeInTheDocument();

            expect(screen.getByText(/Dejar de seguir \(3 seleccionados\)/)).toBeInTheDocument();
            expect(screen.getByText(/Eliminar \(3 seleccionados\)/)).toBeInTheDocument();
        });

        test('calls onViewDetails and closes', () => {
            render(<RadarMenu {...defaultProps} />);
            fireEvent.click(screen.getByText('Ver detalles'));
            expect(mockViewDetails).toHaveBeenCalledWith(mockItem);
        });

        test('calls onUnsubscribe', () => {
            render(<RadarMenu {...defaultProps} />);
            fireEvent.click(screen.getByText(/Dejar de seguir/));
            expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
        });

        test('calls onRemove', () => {
            render(<RadarMenu {...defaultProps} />);
            fireEvent.click(screen.getByText('Eliminar'));
            expect(mockRemove).toHaveBeenCalledTimes(1);
        });

        test('calls onSelect when "Seleccionar" clicked and not selected', () => {
            render(<RadarMenu {...defaultProps} isSelected={false} />);
            fireEvent.click(screen.getByText('Seleccionar'));
            expect(mockSelect).toHaveBeenCalledWith(mockItem);
        });

        test('calls onUnselect when "Deseleccionar" clicked and selected', () => {
            render(<RadarMenu {...defaultProps} isSelected={true} />);
            fireEvent.click(screen.getByText('Deseleccionar'));
            expect(mockUnselect).toHaveBeenCalledWith(mockItem);
        });
    });

    describe('Responsive behavior', () => {
        test('switches from desktop to mobile on resize', () => {
            const { rerender } = render(<RadarMenu {...defaultProps} />);
            expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();

            setMobile();
            rerender(<RadarMenu {...defaultProps} />);
            expect(screen.getByTestId('dialog')).toBeInTheDocument();
            expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
        });
    });
});