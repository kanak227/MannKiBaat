import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CoordinatorRoute = () => {
    const { role, token } = useAuth();

    if (!token) return <Navigate to="/login" replace />;
    if (role !== 'coordinator') return <Navigate to="/polls" replace />;

    return <Outlet />;
};

export default CoordinatorRoute;
