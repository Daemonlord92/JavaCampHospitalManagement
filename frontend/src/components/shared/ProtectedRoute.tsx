import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  children?: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = sessionStorage.getItem("jwt");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If used as a wrapper or as a route element
  return children ? <>{children}</> : <Outlet />;
}
