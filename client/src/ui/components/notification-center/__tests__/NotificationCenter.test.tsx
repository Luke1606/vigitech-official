import React from 'react';
import { render, screen } from '@testing-library/react';
import { NotificationCenter } from '../NotificationCenter.component';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

jest.mock('@novu/react', () => ({
  Inbox: jest.fn(() => <div data-testid="novu-inbox">Novu Inbox</div>),
}));

jest.mock('@clerk/clerk-react');
jest.mock('react-router-dom');

describe('NotificationCenter', () => {
  it('should render loading state', () => {
    (useUser as jest.Mock).mockReturnValue({ isLoaded: false });
    render(<NotificationCenter />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render null when not signed in', () => {
    (useUser as jest.Mock).mockReturnValue({ isLoaded: true, isSignedIn: false });
    const { container } = render(<NotificationCenter />);
    expect(container.firstChild).toBeNull();
  });

  it('should render Novu Inbox when signed in', () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: { id: 'user-123' },
    });
    (useNavigate as jest.Mock).mockReturnValue(jest.fn());
    render(<NotificationCenter />);
    expect(screen.getByTestId('novu-inbox')).toBeInTheDocument();
  });
});
