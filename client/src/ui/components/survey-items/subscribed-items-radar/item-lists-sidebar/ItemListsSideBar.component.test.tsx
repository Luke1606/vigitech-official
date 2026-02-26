import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemListsSideBar } from './ItemListsSideBar.component';
import { useUserItemListsAPI } from '../../../../../infrastructure/hooks/use-item-lists/api/useUserItemListsAPI.hook';
import { useSurveyItemsAPI } from '../../../../../infrastructure/hooks/use-survey-items/api/useSurveyItemsAPI.hook';
import { type UserItemList } from '../../../../../infrastructure';
import { UUID } from '../../../../../infrastructure';

// Mock the hooks
jest.mock('../../../../../infrastructure/hooks/use-item-lists/api/useUserItemListsAPI.hook');
jest.mock('../../../../../infrastructure/hooks/use-survey-items/api/useSurveyItemsAPI.hook');

jest.mock('../../../../../infrastructure/config/env', () => ({
    getEnv: jest.fn(() => ({
        VITE_SERVER_BASE_URL: 'http://localhost:3000',
        VITE_SITE_BASE_URL: 'http://localhost:5173',
        VITE_NOVU_APPLICATION_ID: 'mock-app-id',
        VITE_NOVU_SECRET_KEY: 'mock-secret',
        VITE_CLERK_PUBLISHABLE_KEY: 'mock-clerk-key',
    })),
}));

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

// Mock UI components
jest.mock('../../..', () => ({
    Button: ({ children, onClick, disabled, className, type, name, variant, size }: any) => (
        <button
            data-testid={`button-${name || 'unknown'}`}
            onClick={onClick}
            disabled={disabled}
            className={className}
            type={type}
            data-variant={variant}
            data-size={size}
        >
            {children}
        </button>
    ),
    Sidebar: ({ children, side, className }: any) => (
        <div data-testid="sidebar" data-side={side} className={className}>
            {children}
        </div>
    ),
    SidebarContent: ({ children }: any) => <div data-testid="sidebar-content">{children}</div>,
    SidebarGroup: ({ children }: any) => <div data-testid="sidebar-group">{children}</div>,
    SidebarGroupLabel: ({ children }: any) => <div data-testid="sidebar-group-label">{children}</div>,
    SidebarGroupContent: ({ children }: any) => <div data-testid="sidebar-group-content">{children}</div>,
    SidebarMenu: ({ children }: any) => <div data-testid="sidebar-menu">{children}</div>,
    SidebarMenuButton: ({ children }: any) => (
        <div data-testid="sidebar-menu-button">{children}</div>
    ),
    SidebarMenuItem: ({ children }: any) => <div data-testid="sidebar-menu-item">{children}</div>,
    Dialog: ({ open, children }: any) => (
        open ? <div data-testid="dialog" data-open={open}>{children}</div> : null
    ),
    DialogTrigger: ({ children }: any) => <div data-testid="dialog-trigger">{children}</div>,
    DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
    DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
    DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
    DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
    Input: (props: any) => <input data-testid="input" {...props} />,
}));

jest.mock('../../../sync-button', () => ({
    SyncButton: () => <div data-testid="sync-button">Sync</div>,
}));

jest.mock('./custom-item-list', () => ({
    CustomItemsList: ({ list, onRename, onAddItem, onDeleteList, onRemoveItem }: any) => (
        <div data-testid={`custom-list-${list.id}`}>
            <span data-testid="list-name">{list.name}</span>
            <button data-testid={`rename-${list.id}`} onClick={() => onRename(list.id, 'New Name')}>
                Rename
            </button>
            <button data-testid={`add-item-${list.id}`} onClick={() => onAddItem(list.id)}>
                Add Item
            </button>
            <button data-testid={`delete-${list.id}`} onClick={() => onDeleteList(list.id)}>
                Delete
            </button>
            <button data-testid={`remove-item-${list.id}`} onClick={() => onRemoveItem(list.id, ['item1', 'item2'])}>
                Remove Item
            </button>
        </div>
    ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
    EyeIcon: () => <div data-testid="eye-icon" />,
    EyeOff: () => <div data-testid="eye-off-icon" />,
    Loader2: () => <div data-testid="loader-icon" className="animate-spin" />,
    Plus: () => <div data-testid="plus-icon" />,
    List: () => <div data-testid="list-icon" />,
}));

// Helper to create mock data
const mockSurveyItem = (id: string, title: string, quadrant: string, ring: string) => ({
    id,
    title,
    itemField: quadrant,
    latestClassification: { classification: ring },
});

const mockUserItemList = (id: UUID, name: string, items: any[] = []): UserItemList => ({
    id,
    name,
    items,
});

describe('ItemListsSideBar', () => {
    const mockToggleVisible = jest.fn();
    const mockCreateList = jest.fn();
    const mockUpdateList = jest.fn();
    const mockDeleteList = jest.fn();
    const mockAppendAllItem = jest.fn();
    const mockRemoveAllItem = jest.fn();

    const mockUseUserItemListsAPI = {
        findAll: { data: [] },
        createList: mockCreateList,
        updateList: mockUpdateList,
        deleteList: mockDeleteList,
        appendAllItem: mockAppendAllItem,
        removeAllItem: mockRemoveAllItem,
        isPending: {
            createList: false,
            appendAllItem: false,
            removeAllItem: false,
        },
    };

    const mockSurveyItemsAPI = {
        subscribed: { data: null },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useUserItemListsAPI as jest.Mock).mockReturnValue(mockUseUserItemListsAPI);
        (useSurveyItemsAPI as jest.Mock).mockReturnValue(mockSurveyItemsAPI);
        global.innerWidth = 1024;
        global.dispatchEvent(new Event('resize'));
    });

    const renderComponent = (props = { visible: true, toggleVisible: mockToggleVisible }) => {
        return render(<ItemListsSideBar {...props} />);
    };

    test('renders nothing when visible false on desktop', () => {
        renderComponent({ visible: false, toggleVisible: mockToggleVisible });
        const sidebar = screen.getByTestId('sidebar');
        expect(sidebar.className).toContain('w-0');
    });

    test('renders sidebar when visible true', () => {
        renderComponent();
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('sync-button')).toBeInTheDocument();
        expect(screen.getByText('Listas personalizadas')).toBeInTheDocument();
    });

    test('shows "No hay listas" when lists empty', () => {
        renderComponent();
        expect(screen.getByText('No hay listas')).toBeInTheDocument();
    });

    test('renders list of CustomItemsList when lists present', () => {
        const mockLists = [
            mockUserItemList('list1' as UUID, 'List 1'),
            mockUserItemList('list2' as UUID, 'List 2'),
        ];
        (useUserItemListsAPI as jest.Mock).mockReturnValue({
            ...mockUseUserItemListsAPI,
            findAll: { data: mockLists },
        });

        renderComponent();

        expect(screen.getByTestId('custom-list-list1')).toBeInTheDocument();
        expect(screen.getByTestId('custom-list-list2')).toBeInTheDocument();
        expect(screen.queryByText('No hay listas')).not.toBeInTheDocument();
    });

    test('rename dialog opens and calls updateList', async () => {
        const mockLists = [mockUserItemList('list1' as UUID, 'List 1')];
        (useUserItemListsAPI as jest.Mock).mockReturnValue({
            ...mockUseUserItemListsAPI,
            findAll: { data: mockLists },
        });

        const user = userEvent.setup();
        renderComponent();

        const renameButton = screen.getByTestId('rename-list1');
        await user.click(renameButton);

        const dialog = screen.getAllByTestId('dialog')[0];
        expect(dialog).toBeInTheDocument();

        const input = within(dialog).getByTestId('input');
        expect(input).toHaveValue('New Name');

        const confirmButton = within(dialog).getByRole('button', { name: /renombrar/i });
        await user.click(confirmButton);

        expect(mockUpdateList).toHaveBeenCalledWith({ listId: 'list1', listNewName: 'New Name' });
    });

    test('delete dialog opens and calls deleteList', async () => {
        const mockLists = [mockUserItemList('list1' as UUID, 'List 1')];
        (useUserItemListsAPI as jest.Mock).mockReturnValue({
            ...mockUseUserItemListsAPI,
            findAll: { data: mockLists },
        });

        const user = userEvent.setup();
        renderComponent();

        const deleteButton = screen.getByTestId('delete-list1');
        await user.click(deleteButton);

        const dialog = screen.getAllByTestId('dialog')[0];
        expect(dialog).toBeInTheDocument();

        const confirmButton = within(dialog).getByRole('button', { name: /eliminar/i });
        await user.click(confirmButton);

        expect(mockDeleteList).toHaveBeenCalledWith('list1');
    });

    test('add item dialog opens and calls appendAllItem', async () => {
        const mockLists = [mockUserItemList('list1' as UUID, 'List 1')];
        const mockBlips = [
            mockSurveyItem('item1', 'Item 1', 'LANGUAGES_AND_FRAMEWORKS', 'ADOPT'),
            mockSurveyItem('item2', 'Item 2', 'BUSSINESS_INTEL', 'TEST'),
        ];
        (useUserItemListsAPI as jest.Mock).mockReturnValue({
            ...mockUseUserItemListsAPI,
            findAll: { data: mockLists },
        });
        (useSurveyItemsAPI as jest.Mock).mockReturnValue({
            subscribed: { data: mockBlips },
        });

        const user = userEvent.setup();
        renderComponent();

        const addItemButton = screen.getByTestId('add-item-list1');
        await user.click(addItemButton);

        const dialog = screen.getAllByTestId('dialog')[0];
        expect(dialog).toBeInTheDocument();

        const checkboxes = within(dialog).getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(2);

        await user.click(checkboxes[0]);

        const addButton = within(dialog).getByRole('button', { name: /agregar \(1\)/i });
        await user.click(addButton);

        expect(mockAppendAllItem).toHaveBeenCalledWith({
            listId: 'list1',
            itemIds: ['item1'],
        });
    });

    test('remove item dialog opens and calls removeAllItem', async () => {
        const mockLists = [mockUserItemList('list1' as UUID, 'List 1')];
        (useUserItemListsAPI as jest.Mock).mockReturnValue({
            ...mockUseUserItemListsAPI,
            findAll: { data: mockLists },
        });

        const user = userEvent.setup();
        renderComponent();

        const removeButton = screen.getByTestId('remove-item-list1');
        await user.click(removeButton);

        const dialog = screen.getAllByTestId('dialog')[0];
        expect(dialog).toBeInTheDocument();

        expect(within(dialog).getByText(/item1/)).toBeInTheDocument();
        expect(within(dialog).getByText(/item2/)).toBeInTheDocument();

        const confirmButton = within(dialog).getByRole('button', { name: /remover \(2\)/i });
        await user.click(confirmButton);

        expect(mockRemoveAllItem).toHaveBeenCalledWith({
            listId: 'list1',
            itemIds: ['item1', 'item2'],
        });
    });

    test('mobile detection shows floating button and dialog instead of sidebar', () => {
        global.innerWidth = 500;
        global.dispatchEvent(new Event('resize'));

        renderComponent();

        expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
        const mobileButton = screen.getByRole('button', { name: /listas/i });
        expect(mobileButton).toBeInTheDocument();
        expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    test('clicking mobile button opens dialog with sidebar content', async () => {
        global.innerWidth = 500;
        global.dispatchEvent(new Event('resize'));

        const user = userEvent.setup();
        renderComponent();

        const mobileButton = screen.getByRole('button', { name: /listas/i });
        await user.click(mobileButton);

        const dialog = screen.getByTestId('dialog');
        expect(dialog).toBeInTheDocument();
        expect(within(dialog).getByTestId('sidebar-content')).toBeInTheDocument();
    });

    test('toggle visibility button works on desktop', async () => {
        const user = userEvent.setup();
        renderComponent({ visible: true, toggleVisible: mockToggleVisible });

        const eyeOffIcon = screen.getByTestId('eye-off-icon');
        const toggleButton = eyeOffIcon.closest('button');
        expect(toggleButton).toBeInTheDocument();

        await user.click(toggleButton!);
        expect(mockToggleVisible).toHaveBeenCalled();
    });

    test('fetches and transforms survey items', async () => {
        const mockApiData = [
            {
                id: 'item1',
                title: 'Item 1',
                itemField: 'LANGUAGES_AND_FRAMEWORKS',
                latestClassification: { classification: 'ADOPT' },
            },
            {
                id: 'item2',
                title: 'Item 2',
                itemField: 'BUSSINESS_INTEL',
                latestClassification: { classification: 'TEST' },
            },
        ];
        (useSurveyItemsAPI as jest.Mock).mockReturnValue({
            subscribed: { data: mockApiData },
        });

        const mockLists = [mockUserItemList('list1' as UUID, 'List 1')];
        (useUserItemListsAPI as jest.Mock).mockReturnValue({
            ...mockUseUserItemListsAPI,
            findAll: { data: mockLists },
        });

        renderComponent();

        const addItemButton = screen.getByTestId('add-item-list1');
        await userEvent.click(addItemButton);

        const dialog = screen.getAllByTestId('dialog')[0];
        const items = within(dialog).getAllByRole('checkbox');
        expect(items).toHaveLength(2);
    });
});