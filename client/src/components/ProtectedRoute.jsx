import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, operatorOnly = false, userOnly = false }) => {
  const { user, loading, isOperator, isUser } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="w-10 h-10 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  if (operatorOnly && !isOperator) {
    return <Navigate to="/" replace />;
  }

  if (userOnly && !isUser) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
