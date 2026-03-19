import { Navigate, Outlet, useLocation } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/app/providers/auth-provider";
import { ROUTES } from "@/lib/constants";

export function AuthGuard() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-4 p-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    const returnUrl = encodeURIComponent(
      location.pathname + location.search,
    );
    return <Navigate to={`${ROUTES.login}?returnUrl=${returnUrl}`} replace />;
  }

  return <Outlet />;
}
