import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox } from '@novu/react';
import { useUser } from "@clerk/clerk-react";
import { getEnv } from '../../../infrastructure/config/env';

export const NotificationCenter: React.FC = () => {
    const navigate = useNavigate();
    
    const appId: string = getEnv().VITE_NOVU_APPLICATION_ID;

    
    const { isLoaded, isSignedIn, user } = useUser();

    if (!isLoaded) return <div>Loading...</div>;

    if (!isSignedIn) return null;

    return (
        <Inbox
            applicationIdentifier={appId}
            subscriber={user.id as string}
            routerPush={(path: string) => navigate(path)}
            appearance={{
                variables: {
                    colorPrimary: "#DD2450",
                    colorForeground: "#FFF"
                }
            }}
            />
    );
}