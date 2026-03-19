import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-6xl font-bold tracking-tight">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Page Not Found
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button className="mt-8" render={<Link to={ROUTES.home} />} nativeButton={false}>
        Back to Home
      </Button>
    </div>
  );
}
