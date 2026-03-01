import { render, screen, fireEvent, within } from '@testing-library/react';
import { Header } from './Header.component';
import { PathOption } from '../../../../infrastructure';
import * as reactRouterDom from 'react-router-dom';
import * as clerkReact from '@clerk/clerk-react';

// Mock redux-persist and env (as before)
jest.mock('redux-persist', () => ({
    persistReducer: (reducer: any) => reducer,
    persistStore: () => ({}),
}));
jest.mock('redux-persist/es/persistReducer', () => (reducer: any) => reducer);
jest.mock('redux-persist/lib/storage', () => ({
    __esModule: true,
    default: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
    },
}));

jest.mock('../../../../infrastructure/config/env', () => ({
    getEnv: jest.fn(() => ({
        VITE_SERVER_BASE_URL: 'http://localhost:3000',
        VITE_SITE_BASE_URL: 'http://localhost:5173',
        VITE_NOVU_APPLICATION_ID: 'mock-app-id',
        VITE_NOVU_SECRET_KEY: 'mock-secret',
        VITE_CLERK_PUBLISHABLE_KEY: 'mock-clerk-key',
    })),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
    useLocation: jest.fn(),
    NavLink: jest.fn(({ to, children, className, onClick }: any) => (
        <a href={to} data-testid={`navlink-${to}`} className={className} onClick={onClick}>
            {children}
        </a>
    )),
}));

// Mock Clerk – using jest.fn components so we can change behavior per test
jest.mock('@clerk/clerk-react', () => ({
    SignedIn: jest.fn(({ children }) => <div data-testid="signed-in">{children}</div>),
    SignedOut: jest.fn(({ children }) => <div data-testid="signed-out">{children}</div>),
    SignInButton: jest.fn(({ children }) => <button data-testid="sign-in-button">{children}</button>),
    UserButton: jest.fn(() => <div data-testid="user-button" />),
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
    Menu: () => <svg data-testid="menu-icon" />,
}));

// Mock custom components
jest.mock('../../notification-center', () => ({
    NotificationCenter: () => <div data-testid="notification-center" />,
}));

jest.mock('./service-card', () => ({
    ServiceCard: ({ title, description }: any) => (
        <div data-testid="service-card">
            <div data-testid="service-title">{title}</div>
            <div data-testid="service-description">{description}</div>
        </div>
    ),
}));

// Mock shadcn components
jest.mock('../../shared/shadcn-ui/navigation-menu', () => {
    const React = require('react');
    const NavigationMenu = ({ children }: any) => (
        <nav data-testid="navigation-menu">{children}</nav>
    );
    const NavigationMenuList = ({ children }: any) => (
        <ul data-testid="navigation-menu-list">{children}</ul>
    );
    const NavigationMenuItem = ({ children }: any) => (
        <li data-testid="navigation-menu-item">{children}</li>
    );
    const NavigationMenuTrigger = ({ children, className }: any) => (
        <button data-testid="navigation-menu-trigger" className={className}>
            {children}
        </button>
    );
    const NavigationMenuContent = ({ children }: any) => (
        <div data-testid="navigation-menu-content">{children}</div>
    );
    const NavigationMenuLink = ({ asChild, className, children }: any) => {
        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children, { className });
        }
        return <a data-testid="navigation-menu-link" className={className}>{children}</a>;
    };
    return {
        NavigationMenu,
        NavigationMenuList,
        NavigationMenuItem,
        NavigationMenuTrigger,
        NavigationMenuContent,
        NavigationMenuLink,
    };
});

// Fixed sheet mock – no type argument on createContext
jest.mock('../../shared/shadcn-ui/sheet', () => {
    const React = require('react');
    const SheetContext = React.createContext(undefined);

    const Sheet = ({ children, open, onOpenChange }: any) => {
        return (
            <SheetContext.Provider value={{ open, onOpenChange }}>
                <div data-testid="sheet" data-open={open}>{children}</div>
            </SheetContext.Provider>
        );
    };

    const SheetTrigger = ({ children, asChild }: any) => {
        const context = React.useContext(SheetContext);
        if (!context) return null;
        const { open, onOpenChange } = context;
        const handleClick = (e: any) => {
            if (children.props.onClick) {
                children.props.onClick(e);
            }
            onOpenChange(!open);
        };
        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children, { onClick: handleClick });
        }
        return <div data-testid="sheet-trigger" onClick={handleClick}>{children}</div>;
    };

    const SheetContent = ({ children, side, className }: any) => {
        const context = React.useContext(SheetContext);
        if (!context) return null;
        return context.open ? <div data-testid="sheet-content" data-side={side} className={className}>{children}</div> : null;
    };

    const SheetTitle = ({ children, className }: any) => <h2 data-testid="sheet-title" className={className}>{children}</h2>;
    const SheetDescription = ({ children, className }: any) => <p data-testid="sheet-description" className={className}>{children}</p>;

    return { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription };
});

jest.mock('../../shared/shadcn-ui/button', () => ({
    Button: ({ children, onClick, className }: any) => (
        <button data-testid="button" onClick={onClick} className={className}>
            {children}
        </button>
    ),
}));

// Mock styles
jest.mock('./Header.styles', () => ({
    header: 'mock-header',
    separator: 'mock-separator',
    navigationMenuList: 'mock-nav-list',
    navigationMenuLink: 'mock-nav-link',
    navigationMenuLinkFocused: 'mock-focused',
    navigationMenuTrigger: 'mock-trigger',
    navigationMenuUl: 'mock-ul',
    secundaryNavigationMenuLink: 'mock-secondary',
}));

describe('Header', () => {
    const mockUseLocation = reactRouterDom.useLocation as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        });
        window.dispatchEvent(new Event('resize'));
        mockUseLocation.mockReturnValue({ pathname: PathOption.VIGITECH_PORTAL_HOME });

        // Default auth state: signed out
        (clerkReact.SignedIn as jest.Mock).mockImplementation(() => null);
        (clerkReact.SignedOut as jest.Mock).mockImplementation(({ children }) => (
            <div data-testid="signed-out">{children}</div>
        ));
    });

    const renderHeader = () => render(<Header />);

    describe('Desktop view (width >= 768)', () => {
        beforeEach(() => {
            window.innerWidth = 1024;
            window.dispatchEvent(new Event('resize'));
        });

        test('renders Vigitech view navigation correctly', () => {
            mockUseLocation.mockReturnValue({ pathname: PathOption.VIGITECH_PORTAL_HOME });
            renderHeader();

            expect(screen.getByTestId('navigation-menu')).toBeInTheDocument();

            const homeLink = screen.getByTestId(`navlink-${PathOption.VIGITECH_PORTAL_HOME}`);
            expect(homeLink).toHaveTextContent('Inicio');

            const faqLink = screen.getByTestId(`navlink-${PathOption.VIGITECH_PORTAL_FAQ}`);
            expect(faqLink).toHaveTextContent('FAQ');

            const aboutLink = screen.getByTestId(`navlink-${PathOption.VIGITECH_PORTAL_ABOUT}`);
            expect(aboutLink).toHaveTextContent('ACERCA DE');

            const servicesTrigger = screen.getByTestId('navigation-menu-trigger');
            expect(servicesTrigger).toHaveTextContent('SERVICIOS');

            expect(screen.queryByTestId('notification-center')).not.toBeInTheDocument();
        });

        test('highlights active link in Vigitech view', () => {
            mockUseLocation.mockReturnValue({ pathname: PathOption.VIGITECH_PORTAL_FAQ });
            renderHeader();

            const faqLink = screen.getByTestId(`navlink-${PathOption.VIGITECH_PORTAL_FAQ}`);
            expect(faqLink.className).toContain('mock-focused');
        });

        test('services dropdown shows ServiceCards', async () => {
            renderHeader();
            const servicesTrigger = screen.getByTestId('navigation-menu-trigger');
            fireEvent.click(servicesTrigger);

            const content = await screen.findByTestId('navigation-menu-content');
            expect(content).toBeInTheDocument();

            const serviceCards = screen.getAllByTestId('service-card');
            expect(serviceCards).toHaveLength(3);
            expect(screen.getByText('Radar Tecnológico')).toBeInTheDocument();
            expect(screen.getByText('Buscador de Tecnologías')).toBeInTheDocument();
            expect(screen.getByText('Gráficos Tecnológicos')).toBeInTheDocument();
        });

        test('renders Radar view navigation correctly', () => {
            mockUseLocation.mockReturnValue({ pathname: PathOption.TECHNOLOGY_RADAR_PORTAL });
            renderHeader();

            const vigitechLink = screen.getByTestId(`navlink-${PathOption.VIGITECH_PORTAL_HOME}`);
            expect(vigitechLink).toHaveTextContent('VIGITECH');

            const homeLink = screen.getByTestId(`navlink-${PathOption.TECHNOLOGY_RADAR_PORTAL}`);
            expect(homeLink).toHaveTextContent('Inicio');

            const recommendationsLink = screen.getByTestId(`navlink-${PathOption.TECHNOLOGY_RADAR_RECOMMENDATIONS_FEED}`);
            expect(recommendationsLink).toHaveTextContent('Recomendaciones');

            const radarLink = screen.getByTestId(`navlink-${PathOption.TECHNOLOGY_RADAR_SUBSCRIBED_ITEMS_RADAR}`);
            expect(radarLink).toHaveTextContent('Radar');

            expect(screen.getByTestId('notification-center')).toBeInTheDocument();
        });

        test('highlights active link in Radar view', () => {
            mockUseLocation.mockReturnValue({ pathname: PathOption.TECHNOLOGY_RADAR_RECOMMENDATIONS_FEED });
            renderHeader();

            const recLink = screen.getByTestId(`navlink-${PathOption.TECHNOLOGY_RADAR_RECOMMENDATIONS_FEED}`);
            expect(recLink.className).toContain('mock-focused');
        });

        test('shows SignIn button when signed out', () => {
            renderHeader();

            expect(screen.getByTestId('signed-out')).toBeInTheDocument();
            expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
            expect(screen.queryByTestId('user-button')).not.toBeInTheDocument();
        });

        test('shows UserButton when signed in', () => {
            (clerkReact.SignedIn as jest.Mock).mockImplementation(({ children }) => (
                <div data-testid="signed-in">{children}</div>
            ));
            (clerkReact.SignedOut as jest.Mock).mockImplementation(() => null);

            renderHeader();

            expect(screen.getByTestId('user-button')).toBeInTheDocument();
            expect(screen.queryByTestId('sign-in-button')).not.toBeInTheDocument();
        });
    });

    describe('Mobile view (width < 768)', () => {
        beforeEach(() => {
            window.innerWidth = 500;
            window.dispatchEvent(new Event('resize'));
        });

        test('renders mobile layout', () => {
            mockUseLocation.mockReturnValue({ pathname: PathOption.VIGITECH_PORTAL_HOME });
            renderHeader();

            expect(screen.queryByTestId('navigation-menu')).not.toBeInTheDocument();

            const menuButton = screen.getAllByTestId('button').find(btn =>
                btn.querySelector('[data-testid="menu-icon"]')
            );
            expect(menuButton).toBeInTheDocument();
            expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
        });

        test('opens sheet when menu button clicked', () => {
            renderHeader();

            const menuButton = screen.getAllByTestId('button').find(btn =>
                btn.querySelector('[data-testid="menu-icon"]')
            );
            expect(menuButton).toBeInTheDocument();
            fireEvent.click(menuButton!);

            const sheet = screen.getByTestId('sheet');
            expect(sheet.dataset.open).toBe('true');

            const sheetContent = screen.getByTestId('sheet-content');
            expect(sheetContent).toBeInTheDocument();

            // Use within to scope queries inside the sheet content
            expect(within(sheetContent).getByText('Vigitech Portal')).toBeInTheDocument();
            expect(within(sheetContent).getByTestId(`navlink-${PathOption.VIGITECH_PORTAL_HOME}`)).toHaveTextContent('Inicio');
            expect(within(sheetContent).getByTestId(`navlink-${PathOption.VIGITECH_PORTAL_FAQ}`)).toHaveTextContent('FAQ');
            expect(within(sheetContent).getByTestId(`navlink-${PathOption.VIGITECH_PORTAL_ABOUT}`)).toHaveTextContent('ACERCA DE');
            expect(within(sheetContent).getByText('SERVICIOS')).toBeInTheDocument();
            expect(within(sheetContent).getByText('Radar Tecnológico')).toBeInTheDocument();
            expect(within(sheetContent).getByText('Buscador de Tecnologías')).toBeInTheDocument();
            expect(within(sheetContent).getByText('Gráficos Tecnológicos')).toBeInTheDocument();
        });

        test('mobile radar view shows correct links in sheet', () => {
            mockUseLocation.mockReturnValue({ pathname: PathOption.TECHNOLOGY_RADAR_PORTAL });
            renderHeader();

            const menuButton = screen.getAllByTestId('button').find(btn =>
                btn.querySelector('[data-testid="menu-icon"]')
            );
            expect(menuButton).toBeInTheDocument();
            fireEvent.click(menuButton!);

            const sheetContent = screen.getByTestId('sheet-content');
            expect(within(sheetContent).getByText('Radar Tecnológico')).toBeInTheDocument();

            expect(within(sheetContent).getByTestId(`navlink-${PathOption.TECHNOLOGY_RADAR_PORTAL}`)).toHaveTextContent('Inicio del Radar');
            expect(within(sheetContent).getByTestId(`navlink-${PathOption.TECHNOLOGY_RADAR_RECOMMENDATIONS_FEED}`)).toHaveTextContent('Recomendaciones');
            expect(within(sheetContent).getByTestId(`navlink-${PathOption.TECHNOLOGY_RADAR_SUBSCRIBED_ITEMS_RADAR}`)).toHaveTextContent('Radar');
        });

        test('mobile Vigitech view has Services button that opens sheet', () => {
            mockUseLocation.mockReturnValue({ pathname: PathOption.VIGITECH_PORTAL_HOME });
            renderHeader();

            const servicesButton = screen.getAllByTestId('button').find(btn => btn.textContent === 'SERVICIOS');
            expect(servicesButton).toBeInTheDocument();

            fireEvent.click(servicesButton!);

            const sheet = screen.getByTestId('sheet');
            expect(sheet.dataset.open).toBe('true');
        });

        test('mobile shows auth buttons', () => {
            renderHeader();

            expect(screen.getByTestId('signed-out')).toBeInTheDocument();
            expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();

            (clerkReact.SignedIn as jest.Mock).mockImplementation(({ children }) => (
                <div data-testid="signed-in">{children}</div>
            ));
            (clerkReact.SignedOut as jest.Mock).mockImplementation(() => null);

            renderHeader();
            expect(screen.getByTestId('user-button')).toBeInTheDocument();
        });
    });
});