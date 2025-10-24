/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Error as ErrorComponent } from '../Error';
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

describe('Error component', () => {
  it('renders title, description and button', async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(navigate);

    render(<ErrorComponent errorTitle="Oops" errorDescription="Something went wrong" />);

    expect(screen.getByText('Oops')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    const button = screen.getByRole('button', { name: /volver/i });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(navigate).toHaveBeenCalledWith('/');
  });
});
