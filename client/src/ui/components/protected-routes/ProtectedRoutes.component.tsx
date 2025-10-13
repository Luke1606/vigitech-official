import { Outlet } from 'react-router-dom';
import { RedirectToSignIn, useUser } from '@clerk/clerk-react';

export const ProtectedRoutes = () => {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded)
    return <div>Cargando...</div>;

  return isSignedIn ? <Outlet /> : <RedirectToSignIn />;
};