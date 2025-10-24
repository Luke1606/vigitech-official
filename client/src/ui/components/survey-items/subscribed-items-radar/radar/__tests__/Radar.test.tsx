import { render, screen, fireEvent } from '@testing-library/react';
import { Radar } from '../Radar.component';
import { Blip, RadarQuadrant, RadarRing } from '../../../../../../infrastructure';
import { blips } from '../../../../../../assets/data/radarMock';

const mockEntries: Blip[] = blips.slice(0, 2); // Use a subset of mock blips for testing

describe('Radar', () => {
  it('should render the radar with rings and quadrants', () => {
    render(<Radar entries={mockEntries} />);
    expect(screen.getByText(RadarRing.ADOPT)).toBeInTheDocument();
    expect(screen.getByText(RadarRing.TEST)).toBeInTheDocument();
    expect(screen.getByText(RadarQuadrant.SUPPORT_PLATTFORMS_AND_TECHNOLOGIES)).toBeInTheDocument();
  });

  it('should render the correct number of blips', () => {
    render(<Radar entries={mockEntries} />);
    // Each blip has a label and a list item, so we expect twice the number of blips
    expect(screen.getAllByText(new RegExp(mockEntries.map(b => b.title).join('|')))).toHaveLength(mockEntries.length * 2);
  });

  it('should call onBlipClick when a blip is clicked', () => {
    const onBlipClick = jest.fn();
    render(<Radar entries={mockEntries} onBlipClick={onBlipClick} />);
    fireEvent.click(screen.getAllByText('TypeScript')[0]);
    expect(onBlipClick).toHaveBeenCalledWith(mockEntries[0], expect.any(Object));
  });

  it('should call onBlipHover when a blip is hovered', () => {
    const onBlipHover = jest.fn();
    render(<Radar entries={mockEntries} onBlipHover={onBlipHover} />);
    fireEvent.mouseEnter(screen.getAllByText('TypeScript')[0]);
    expect(onBlipHover).toHaveBeenCalledWith(mockEntries[0]);
  });
});
