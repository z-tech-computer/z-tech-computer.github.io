import { useSearchParams } from "react-router";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/shared/product-card";
import { useProducts } from "@/features/products/hooks/use-products";

function getPrimaryImage(product: Record<string, unknown>): string | null {
  const images = product.product_images as
    | { url: string; is_primary?: boolean }[]
    | undefined;
  if (!images?.length) return null;
  return images.find((i) => i.is_primary)?.url ?? images[0]?.url ?? null;
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const { data, isLoading } = useProducts({
    search: query || undefined,
    page: 1,
  });

  if (!query) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <Search className="mx-auto size-12 text-muted-foreground/50" />
        <p className="mt-4 text-lg text-muted-foreground">
          Enter a search term to find products
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Skeleton className="mb-6 h-8 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">
        Search results for &ldquo;{query}&rdquo;
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {data?.count ?? 0} product{(data?.count ?? 0) !== 1 ? "s" : ""} found
      </p>

      {!data?.data.length ? (
        <div className="py-20 text-center">
          <Search className="mx-auto size-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg text-muted-foreground">
            No products found for &ldquo;{query}&rdquo;
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {data.data.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              slug={p.slug}
              price={p.price}
              compareAtPrice={p.compare_at_price}
              imageUrl={getPrimaryImage(p as unknown as Record<string, unknown>)}
              stockQuantity={p.stock_quantity}
            />
          ))}
        </div>
      )}
    </div>
  );
}
