/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SurveyItemCard } from '../SurveyItemCard.component';

const mockItem = {
  id: '1',
  title: 'Test item',
  summary: 'A short summary',
  radarRing: 'ADOPT',
  radarQuadrant: 'BUSSINESS_INTEL'
};

describe('SurveyItemCard', () => {
  it('renders title and buttons and responds to clicks', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    const onUnselect = jest.fn();
    const onSubscribe = jest.fn();
    const onRemove = jest.fn();
    const onViewDetails = jest.fn();

    render(
      <SurveyItemCard
        key={'1'}
        item={mockItem as any}
        selected={false}
        onSelect={onSelect}
        onUnselect={onUnselect}
        onSubscribe={onSubscribe}
        onRemove={onRemove}
        onViewDetails={onViewDetails}
        isLoading={{ subscribeOne: false, removeOne: false }}
      />
    );

    expect(screen.getByText('Test item')).toBeInTheDocument();

    // Click the card root by finding the title and clicking its parent
    await user.click(screen.getByText('Test item'));
    expect(onSelect).toHaveBeenCalled();

    // Buttons
    await user.click(screen.getByRole('button', { name: /details/i }));
    expect(onViewDetails).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /subscribe/i }));
    expect(onSubscribe).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /remove/i }));
    expect(onRemove).toHaveBeenCalled();
  });
});
