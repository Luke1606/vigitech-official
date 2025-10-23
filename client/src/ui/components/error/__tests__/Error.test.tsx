import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Error as ErrorComponent } from '../Error';

describe('Error component', () => {
  it('renders title, description and button', async () => {
    const user = userEvent.setup();
    render(<ErrorComponent errorTitle="Oops" errorDescription="Something went wrong" />);

    expect(screen.getByText('Oops')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    const button = screen.getByRole('button', { name: /volver/i });
    expect(button).toBeInTheDocument();

    // clicking changes location — assert the handler exists (mock window.location)
    const original = window.location.href;
    Object.defineProperty(window, 'location', { value: { href: '' }, writable: true });
    await user.click(button);
    expect(window.location.href).toBe('/');
    Object.defineProperty(window, 'location', { value: { href: original } });
  });
});
