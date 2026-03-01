import { renderHook } from '@testing-library/react';
import { useChangelog } from './useChangelog.hook';
import { useDispatch, useSelector } from 'react-redux';
import { addChangeLog, clearChangeLog } from '../../redux';
import type { ChangeLogEntry } from '../../domain';
import { RadarRing } from '../../domain';

// Mocks de react-redux
jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
    useSelector: jest.fn(),
}));

// Mocks de las acciones
jest.mock('../../redux', () => ({
    addChangeLog: jest.fn(),
    clearChangeLog: jest.fn(),
}));

jest.mock('../../config/env', () => ({
    getEnv: jest.fn(() => ({
        VITE_SERVER_BASE_URL: 'http://localhost:3000',
        VITE_SITE_BASE_URL: 'http://localhost:5173',
        VITE_NOVU_APPLICATION_ID: 'mock-app-id',
        VITE_NOVU_SECRET_KEY: 'mock-secret',
        VITE_CLERK_PUBLISHABLE_KEY: 'mock-clerk-key',
    })),
}));

describe('useChangelog', () => {
    const mockDispatch = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    });

    it('should return changelogs from useSelector', () => {
        const mockChangelogs: ChangeLogEntry[] = [
            { itemTitle: 'Item 1', oldRing: RadarRing.ADOPT, newRing: RadarRing.HOLD, timestamp: '123' },
            { itemTitle: 'Item 2', oldRing: RadarRing.TEST, newRing: RadarRing.ADOPT, timestamp: '456' },
        ];

        (useSelector as unknown as jest.Mock).mockImplementation((selector) => {
            // Simulamos que el selector accede a state.changeLog.changelogs
            const state = { changeLog: { changelogs: mockChangelogs } };
            return selector(state);
        });

        const { result } = renderHook(() => useChangelog());

        expect(result.current.changelogs).toEqual(mockChangelogs);
    });

    it('should dispatch addChangeLog action with the provided entry', () => {
        const mockEntry: ChangeLogEntry = {
            itemTitle: 'New Item',
            oldRing: RadarRing.SUSTAIN,
            newRing: RadarRing.TEST,
            timestamp: '789',
        };

        // Simulamos que useSelector devuelve cualquier cosa, no importa para esta prueba
        (useSelector as unknown as jest.Mock).mockReturnValue([]);

        // Mockeamos que addChangeLog retorna un objeto de acción (simulado)
        const mockAction = { type: 'ADD_CHANGELOG' };
        (addChangeLog as unknown as jest.Mock).mockReturnValue(mockAction);

        const { result } = renderHook(() => useChangelog());

        // Llamamos a la función del hook
        result.current.addChangeLog(mockEntry);

        expect(addChangeLog).toHaveBeenCalledTimes(1);
        expect(addChangeLog).toHaveBeenCalledWith(mockEntry);
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith(mockAction);
    });

    it('should dispatch clearChangeLog action', () => {
        // Simulamos que useSelector devuelve cualquier cosa
        (useSelector as unknown as jest.Mock).mockReturnValue([]);

        const mockAction = { type: 'CLEAR_CHANGELOG' };
        (clearChangeLog as unknown as jest.Mock).mockReturnValue(mockAction);

        const { result } = renderHook(() => useChangelog());

        result.current.clearChangeLog();

        expect(clearChangeLog).toHaveBeenCalledTimes(1);
        expect(clearChangeLog).toHaveBeenCalledWith();
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith(mockAction);
    });
});