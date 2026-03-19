import { Link } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/features/products/hooks/use-products";
import { ROUTES } from "@/lib/constants";

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8">
          <Skeleton className="mb-4 h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="mx-auto h-5 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!categories?.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Shop by Category
        </h1>
        <div className="py-20 text-center text-muted-foreground">
          <p className="text-lg">No categories found.</p>
          <Link to={ROUTES.home} className="mt-4 inline-block text-primary hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Shop by Category
        </h1>
        <p className="text-lg text-muted-foreground">
          Explore our wide range of product categories and find exactly what you're looking for.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={ROUTES.category(cat.slug)}
            className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg"
          >
            <div className="aspect-[4/3] overflow-hidden bg-muted">
              {cat.image_url ? (
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted transition-transform duration-500 group-hover:scale-110">
                  <span className="text-muted-foreground/30 text-6xl font-bold">
                    {cat.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
              <h3 className="text-xl font-semibold tracking-tight transition-colors group-hover:text-primary">
                {cat.name}
              </h3>
              <span className="mt-2 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Browse &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
