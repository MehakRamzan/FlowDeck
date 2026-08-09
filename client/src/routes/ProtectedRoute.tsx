import { Navigate } from "react-router";
import type { ReactNode } from "react";
import { useAuth } from "../context/useAuth";

type ProtectedRouteProps = {
  children: ReactNode;
  requireWorkspace?: boolean;
};

function ProtectedRoute({
  children,
  requireWorkspace = true,
}: ProtectedRouteProps) {
  const {
    user,
    isLoading,
    currentOrganization,
  } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireWorkspace && !currentOrganization) {
    return <Navigate to="/setup-workspace" replace />;
  }

  return children;
}

export default ProtectedRoute;