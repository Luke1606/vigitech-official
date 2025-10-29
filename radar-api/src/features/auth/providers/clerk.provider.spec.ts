import { ClerkClientProvider } from './clerk.provider';
import { createClerkClient } from '@clerk/backend';

jest.mock('@clerk/backend', () => ({
    createClerkClient: jest.fn(),
}));

describe('ClerkClientProvider', () => {
    it('should create a Clerk client with the correct keys', () => {
        const mockConfigService = {
            get: jest.fn((key: string) => {
                if (key === 'CLERK_PUBLISHABLE_KEY') return 'test_publishable_key';
                if (key === 'CLERK_SECRET_KEY') return 'test_secret_key';
                return null;
            }),
        };

        ClerkClientProvider.useFactory(mockConfigService as any);

        expect(createClerkClient).toHaveBeenCalledWith({
            publishableKey: 'test_publishable_key',
            secretKey: 'test_secret_key',
        });
    });
});
