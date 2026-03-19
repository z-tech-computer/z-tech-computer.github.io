import { lazy, Suspense } from "react";
import { createHashRouter, RouterProvider, useRouteError } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/shared/public-layout";
import { AuthGuard } from "@/features/auth/components/auth-guard";

const HomePage = lazy(() => import("@/app/routes/home"));
const ProductsPage = lazy(() => import("@/app/routes/products"));
const ProductDetailPage = lazy(() => import("@/app/routes/product-detail"));
const CategoriesPage = lazy(() => import("@/app/routes/categories"));
const CategoryPage = lazy(() => import("@/app/routes/category"));
const BrandPage = lazy(() => import("@/app/routes/brand"));
const SearchPage = lazy(() => import("@/app/routes/search"));
const CartPage = lazy(() => import("@/app/routes/cart-page"));
const LoginPage = lazy(() => import("@/app/routes/login"));
const RegisterPage = lazy(() => import("@/app/routes/register"));
const CheckoutPage = lazy(() => import("@/app/routes/checkout"));
const AccountPage = lazy(() => import("@/app/routes/account"));
const OrdersPage = lazy(() => import("@/app/routes/orders"));
const OrderDetailPage = lazy(() => import("@/app/routes/order-detail"));
const NotFoundPage = lazy(() => import("@/app/routes/not-found"));

function PageLoader() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 p-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function RouteErrorFallback() {
  const error = useRouteError();
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8 text-center">
      <div>
        <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
        <p className="mb-4 text-muted-foreground">
          {error instanceof Error ? error.message : "An unexpected error occurred."}
        </p>
        <Button onClick={() => window.location.reload()}>Reload</Button>
      </div>
    </div>
  );
}

function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

const router = createHashRouter([
  {
    element: <PublicLayout />,
    errorElement: <RouteErrorFallback />,
    children: [
      { index: true, element: withSuspense(HomePage) },
      { path: "products", element: withSuspense(ProductsPage) },
      { path: "products/:slug", element: withSuspense(ProductDetailPage) },
      { path: "categories", element: withSuspense(CategoriesPage) },
      { path: "categories/:slug", element: withSuspense(CategoryPage) },
      { path: "brands/:slug", element: withSuspense(BrandPage) },
      { path: "search", element: withSuspense(SearchPage) },
      { path: "cart", element: withSuspense(CartPage) },
      { path: "auth/login", element: withSuspense(LoginPage) },
      { path: "auth/register", element: withSuspense(RegisterPage) },
      {
        element: <AuthGuard />,
        children: [
          { path: "checkout", element: withSuspense(CheckoutPage) },
          { path: "account", element: withSuspense(AccountPage) },
          { path: "account/orders", element: withSuspense(OrdersPage) },
          {
            path: "account/orders/:id",
            element: withSuspense(OrderDetailPage),
          },
        ],
      },
      { path: "*", element: withSuspense(NotFoundPage) },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
