import { changelogSlice, addChangeLog, clearChangeLog, type ChangelogState } from './slice';
import type { ChangeLogEntry } from "../../../domain";
import { RadarRing } from "../../../domain";

jest.mock('../../../config/env', () => ({
    getEnv: jest.fn(() => ({
        VITE_SERVER_BASE_URL: 'http://localhost:3000',
        VITE_SITE_BASE_URL: 'http://localhost:5173',
        VITE_NOVU_APPLICATION_ID: 'mock-app-id',
        VITE_NOVU_SECRET_KEY: 'mock-secret',
        VITE_CLERK_PUBLISHABLE_KEY: 'mock-clerk-key',
    })),
}));

describe('changelogSlice', () => {
    const initialState: ChangelogState = {
        changelogs: [],
    };

    it('should return the initial state', () => {
        expect(changelogSlice.reducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    describe('addChangeLog', () => {
        it('should add a new changelog entry to the state', () => {
            const previousState: ChangelogState = {
                changelogs: [],
            };

            const newEntry: ChangeLogEntry = {
                itemTitle: 'Test Item',
                oldRing: RadarRing.ADOPT,
                newRing: RadarRing.HOLD,
                timestamp: '123456789',
            };

            const expectedState: ChangelogState = {
                changelogs: [newEntry],
            };

            expect(changelogSlice.reducer(previousState, addChangeLog(newEntry))).toEqual(expectedState);
        });

        it('should append a new changelog entry to existing ones', () => {
            const existingEntry: ChangeLogEntry = {
                itemTitle: 'Existing Item',
                oldRing: RadarRing.TEST,
                newRing: RadarRing.ADOPT,
                timestamp: '123456789',
            };

            const previousState: ChangelogState = {
                changelogs: [existingEntry],
            };

            const newEntry: ChangeLogEntry = {
                itemTitle: 'New Item',
                oldRing: RadarRing.HOLD,
                newRing: RadarRing.TEST,
                timestamp: '987654321',
            };

            const expectedState: ChangelogState = {
                changelogs: [existingEntry, newEntry],
            };

            expect(changelogSlice.reducer(previousState, addChangeLog(newEntry))).toEqual(expectedState);
        });
    });

    describe('clearChangeLog', () => {
        it('should clear all changelogs from the state', () => {
            const previousState: ChangelogState = {
                changelogs: [
                    { itemTitle: 'Item 1', oldRing: RadarRing.ADOPT, newRing: RadarRing.HOLD, timestamp: '1' },
                    { itemTitle: 'Item 2', oldRing: RadarRing.TEST, newRing: RadarRing.ADOPT, timestamp: '2' },
                ],
            };

            const expectedState: ChangelogState = {
                changelogs: [],
            };

            expect(changelogSlice.reducer(previousState, clearChangeLog())).toEqual(expectedState);
        });

        it('should do nothing if the changelog is already empty', () => {
            const previousState: ChangelogState = {
                changelogs: [],
            };

            expect(changelogSlice.reducer(previousState, clearChangeLog())).toEqual(previousState);
        });
    });
});