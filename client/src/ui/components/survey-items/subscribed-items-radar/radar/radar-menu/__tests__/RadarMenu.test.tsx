import { render, screen, fireEvent } from '@testing-library/react';
import { RadarMenu } from '../RadarMenu.component';
import { SurveyItem, RadarQuadrant, RadarRing } from '../../../../../../../infrastructure';
import { UUID } from 'crypto';

const mockItem: SurveyItem = {
  id: '1' as UUID,
  title: 'Test Item',
  radarQuadrant: RadarQuadrant.BUSSINESS_INTEL,
  radarRing: RadarRing.ADOPT,
  summary: '',
};

describe('RadarMenu', () => {
  const defaultProps = {
    item: mockItem,
    position: { x: 100, y: 100 },
    onViewDetails: jest.fn(),
    onUnsubscribe: jest.fn(),
    onRemove: jest.fn(),
    onSelect: jest.fn(),
    onUnselect: jest.fn(),
    isSelected: false,
  };

  it('should render the menu with all buttons', () => {
    render(<RadarMenu {...defaultProps} />);
    expect(screen.getByText('Ver detalles')).toBeInTheDocument();
    expect(screen.getByText('Dejar de seguir')).toBeInTheDocument();
    expect(screen.getByText('Seleccionar')).toBeInTheDocument();
    expect(screen.getByText('Eliminar')).toBeInTheDocument();
  });

  it('should call onViewDetails when the "Ver detalles" button is clicked', () => {
    render(<RadarMenu {...defaultProps} />);
    fireEvent.click(screen.getByText('Ver detalles'));
    expect(defaultProps.onViewDetails).toHaveBeenCalledWith(mockItem);
  });

  it('should call onUnsubscribe when the "Dejar de seguir" button is clicked', () => {
    render(<RadarMenu {...defaultProps} />);
    fireEvent.click(screen.getByText('Dejar de seguir'));
    expect(defaultProps.onUnsubscribe).toHaveBeenCalledWith(mockItem);
  });

  it('should call onRemove when the "Eliminar" button is clicked', () => {
    render(<RadarMenu {...defaultProps} />);
    fireEvent.click(screen.getByText('Eliminar'));
    expect(defaultProps.onRemove).toHaveBeenCalledWith(mockItem);
  });

  it('should call onSelect when the "Seleccionar" button is clicked and isSelected is false', () => {
    render(<RadarMenu {...defaultProps} />);
    fireEvent.click(screen.getByText('Seleccionar'));
    expect(defaultProps.onSelect).toHaveBeenCalledWith(mockItem);
  });

  it('should call onUnselect when the "Deseleccionar" button is clicked and isSelected is true', () => {
    render(<RadarMenu {...defaultProps} isSelected={true} />);
    fireEvent.click(screen.getByText('Deseleccionar'));
    expect(defaultProps.onUnselect).toHaveBeenCalledWith(mockItem);
  });
});
