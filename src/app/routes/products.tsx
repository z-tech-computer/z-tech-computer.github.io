import { useSearchParams } from "react-router";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/shared/product-card";
import { useProducts, useCategories, useBrands } from "@/features/products/hooks/use-products";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { useState } from "react";

function getPrimaryImage(product: Record<string, unknown>): string | null {
  const images = product.product_images as { url: string; is_primary?: boolean }[] | undefined;
  if (!images || images.length === 0) return null;
  const primary = images.find((i) => i.is_primary);
  return primary?.url ?? images[0]?.url ?? null;
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");

  const page = Number(searchParams.get("page") ?? "1");
  const filters = {
    page,
    search: searchParams.get("q") || undefined,
    categorySlug: searchParams.get("category") || undefined,
    brandSlug: searchParams.get("brand") || undefined,
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    sortBy: searchParams.get("sort") || "newest",
  };

  const { data, isLoading } = useProducts(filters);
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  const totalPages = Math.ceil((data?.count ?? 0) / ITEMS_PER_PAGE);

  function updateParam(key: string, value: string | undefined) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      next.set("page", "1");
      return next;
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParam("q", searchInput || undefined);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Products</h1>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-56">
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <Select
              value={String(filters.categorySlug ?? "all")}
              onValueChange={(v) => updateParam("category", !v || v === "all" ? undefined : v)}
            >
              <SelectTrigger><SelectValue placeholder="All categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((c) => (
                  <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Brand</label>
            <Select
              value={String(filters.brandSlug ?? "all")}
              onValueChange={(v) => updateParam("brand", !v || v === "all" ? undefined : v)}
            >
              <SelectTrigger><SelectValue placeholder="All brands" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands?.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Sort By</label>
            <Select
              value={String(filters.sortBy)}
              onValueChange={(v) => updateParam("sort", v ?? "newest")}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="name-asc">Name: A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </aside>

        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
              ))}
            </div>
          ) : !data?.data.length ? (
            <div className="py-20 text-center text-muted-foreground">
              <p className="text-lg">No products found</p>
              <p className="mt-1 text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
                {data.data.map((p) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    slug={p.slug}
                    price={p.price}
                    compareAtPrice={p.compare_at_price}
                    imageUrl={getPrimaryImage(p as unknown as Record<string, unknown>)}
                    categoryName={(p as unknown as Record<string, unknown>).categories ? ((p as unknown as Record<string, unknown>).categories as { name: string }).name : undefined}
                    stockQuantity={p.stock_quantity}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.set("page", String(page - 1));
                      return next;
                    })}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.set("page", String(page + 1));
                      return next;
                    })}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
