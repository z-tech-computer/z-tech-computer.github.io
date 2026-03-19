import { useParams, useSearchParams } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shared/product-card";
import { useProductsByBrand } from "@/features/products/hooks/use-products";
import { ITEMS_PER_PAGE } from "@/lib/constants";

function getPrimaryImage(product: Record<string, unknown>): string | null {
  const images = product.product_images as
    | { url: string; is_primary?: boolean }[]
    | undefined;
  if (!images?.length) return null;
  return images.find((i) => i.is_primary)?.url ?? images[0]?.url ?? null;
}

export default function BrandPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");

  const { data, isLoading } = useProductsByBrand(slug!, page);
  const totalPages = Math.ceil((data?.count ?? 0) / ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Skeleton className="mb-6 h-9 w-48" />
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
      <h1 className="mb-6 text-3xl font-bold">{data?.brandName ?? "Brand"}</h1>

      {!data?.data.length ? (
        <p className="py-20 text-center text-muted-foreground">
          No products from this brand yet.
        </p>
      ) : (
        <>
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
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setSearchParams({ page: String(page - 1) })}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setSearchParams({ page: String(page + 1) })}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
