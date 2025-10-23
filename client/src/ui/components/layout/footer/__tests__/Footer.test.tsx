// @ts-nocheck
/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer.component';

describe('Footer', () => {
  it('renders social links and copyright text', () => {
    render(<Footer />);
    expect(screen.getByText(/© 2025 Centro de Tecnologías Interactivas/)).toBeInTheDocument();
    // there should be several links rendered as anchor-like NavLinks
    const imgs = screen.getAllByRole('img');
    expect(imgs.length).toBeGreaterThanOrEqual(1);
  });
});
