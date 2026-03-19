import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/shared/product-card";
import {
  useFeaturedProducts,
  useNewArrivals,
  useCategories,
} from "@/features/products/hooks/use-products";
import { ROUTES } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { Banner } from "@/types/database";

function getPrimaryImage(product: Record<string, unknown>): string | null {
  const images = product.product_images as
    | { url: string; is_primary?: boolean }[]
    | undefined;
  if (!images?.length) return null;
  return images.find((i) => i.is_primary)?.url ?? images[0]?.url ?? null;
}

function useBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as Banner[];
    },
  });
}

function HeroBanner() {
  const { data: banners, isLoading } = useBanners();

  if (isLoading) return <Skeleton className="h-64 w-full rounded-lg md:h-96" />;
  if (!banners?.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 md:h-96">
        <div className="text-center">
          <h2 className="text-3xl font-bold md:text-5xl">Welcome to Z-TECH-COMPUTER</h2>
          <p className="mt-2 text-muted-foreground">
            Your destination for computer accessories
          </p>
          <Link to={ROUTES.products}>
            <Button className="mt-4" size="lg">Shop Now</Button>
          </Link>
        </div>
      </div>
    );
  }

  const banner = banners[0];
  return (
    <div className="relative h-64 overflow-hidden rounded-lg md:h-96">
      <img
        src={banner.image_url}
        alt={banner.title}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 flex items-center bg-black/30 px-8">
        <div className="text-white">
          <h2 className="text-3xl font-bold md:text-5xl">{banner.title}</h2>
          {banner.subtitle && (
            <p className="mt-2 text-lg md:text-xl">{banner.subtitle}</p>
          )}
          {banner.link_url && (
            <Link to={banner.link_url}>
              <Button className="mt-4" size="lg" variant="secondary">
                Shop Now
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryGrid() {
  const { data: categories } = useCategories();
  if (!categories?.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Shop by Category</h2>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {categories.slice(0, 6).map((cat) => (
          <Link
            key={cat.id}
            to={ROUTES.category(cat.slug)}
            className="group flex flex-col items-center rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            {cat.image_url ? (
              <img src={cat.image_url} alt={cat.name} className="size-16 rounded-md object-cover" />
            ) : (
              <div className="size-16 rounded-md bg-muted" />
            )}
            <span className="mt-2 text-center text-sm font-medium group-hover:underline">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductSection({
  title,
  products,
  isLoading,
  link,
}: {
  title: string;
  products: Record<string, unknown>[] | undefined;
  isLoading: boolean;
  link: string;
}) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link to={link} className="text-sm text-primary hover:underline flex items-center gap-1">
          View All <ArrowRight className="size-4" />
        </Link>
      </div>
      {isLoading ? (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products?.slice(0, 8).map((p: Record<string, unknown>) => (
            <ProductCard
              key={p.id as string}
              id={p.id as string}
              name={p.name as string}
              slug={p.slug as string}
              price={p.price as number}
              compareAtPrice={p.compare_at_price as number | null}
              imageUrl={getPrimaryImage(p)}
              stockQuantity={p.stock_quantity as number}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function HomePage() {
  const { data: featured, isLoading: featuredLoading } = useFeaturedProducts();
  const { data: arrivals, isLoading: arrivalsLoading } = useNewArrivals();

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-8">
      <HeroBanner />
      <CategoryGrid />
      <ProductSection
        title="Featured Products"
        products={featured as unknown as Record<string, unknown>[]}
        isLoading={featuredLoading}
        link={ROUTES.products}
      />
      <ProductSection
        title="New Arrivals"
        products={arrivals as unknown as Record<string, unknown>[]}
        isLoading={arrivalsLoading}
        link={ROUTES.products}
      />
    </div>
  );
}
