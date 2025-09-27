import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox } from '@novu/react';
import { useUser } from '@/infrastructure';

export const NotificationCenter: React.FC = () => {
    const navigate = useNavigate();
    const appId: string = import.meta.env.VITE_NOVU_APPLICATION_ID as string;

    const { user, isLoading, isAuthenticated } = useUser();
    
    if (isLoading) return <div>Loading...</div>;

    if (!isAuthenticated || !user) return null;

    return (
        <Inbox
            applicationIdentifier={appId}
            subscriber={user.id as string}
            routerPush={(path: string) => navigate(path)}
            appearance={{
                variables: {
                    colorPrimary: "#DD2450",
                    colorForeground: "#0E121B"
                }
            }}
            />
    );
}