import { useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import keycloak from '../keycloak';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
    const { isAuthenticated, isAdmin } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            keycloak.login();
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return null;
    }

    if (requiredRole === 'admin' && !isAdmin) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <h2>⛔ Доступ запрещен</h2>
                <p>У вас нет прав администратора для просмотра этой страницы.</p>
            </div>
        );
    }

    return <>{children}</>;
};

export const AdminRoute = ({ children }: { children: React.ReactNode }) => (
    <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
);