import { useState } from "react";
import { useParams, Link } from "react-router";
import { ShoppingCart, Minus, Plus, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useProductBySlug } from "@/features/products/hooks/use-products";
import { useCart } from "@/app/providers/cart-provider";
import { formatCurrency } from "@/lib/utils/format";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";

function ImageGallery({ images }: { images: { url: string; alt_text: string | null }[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const [selectedIndex, setSelectedIndex] = useState(0);

  function scrollTo(index: number) {
    emblaApi?.scrollTo(index);
    setSelectedIndex(index);
  }

  if (images.length === 0) {
    return <div className="aspect-square rounded-lg bg-muted" />;
  }

  return (
    <div>
      <div ref={emblaRef} className="overflow-hidden rounded-lg">
        <div className="flex">
          {images.map((img, i) => (
            <div key={i} className="min-w-0 flex-[0_0_100%]">
              <img
                src={img.url}
                alt={img.alt_text ?? "Product image"}
                className="aspect-square w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`size-16 shrink-0 overflow-hidden rounded-md border-2 ${
                i === selectedIndex ? "border-primary" : "border-transparent"
              }`}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProductBySlug(slug);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Skeleton className="mb-4 h-4 w-64" />
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-muted-foreground">Product not found</p>
        <Link to={ROUTES.products} className="mt-2 text-primary underline">
          Back to products
        </Link>
      </div>
    );
  }

  function handleAddToCart() {
    if (!product) return;
    addItem(product.id, quantity);
    toast.success(`${product.name} added to cart`);
    setQuantity(1);
  }

  const inStock = product.stock_quantity > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link to={ROUTES.home} className="hover:text-foreground">Home</Link>
        <ChevronRight className="size-3" />
        <Link
          to={ROUTES.category(product.category.slug)}
          className="hover:text-foreground"
        >
          {product.category.name}
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <ImageGallery images={product.images} />

        <div>
          <div className="flex items-start gap-2">
            {product.brand && (
              <Badge variant="outline">{product.brand.name}</Badge>
            )}
            <Badge variant="secondary">{product.category.name}</Badge>
          </div>

          <h1 className="mt-3 text-2xl font-bold md:text-3xl">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatCurrency(product.price)}</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-lg text-muted-foreground line-through">
                {formatCurrency(product.compare_at_price)}
              </span>
            )}
          </div>

          {product.short_description && (
            <p className="mt-4 text-muted-foreground">{product.short_description}</p>
          )}

          <Separator className="my-6" />

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-md border">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                disabled={quantity >= product.stock_quantity}
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              <ShoppingCart className="mr-2 size-4" />
              {inStock ? "Add to Cart" : "Out of Stock"}
            </Button>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            {inStock ? `${product.stock_quantity} in stock` : "Currently unavailable"}
          </p>

          {product.specifications.length > 0 && (
            <>
              <Separator className="my-6" />
              <h2 className="mb-3 text-lg font-semibold">Specifications</h2>
              <dl className="space-y-2">
                {product.specifications.map((spec) => (
                  <div key={spec.id} className="flex justify-between text-sm">
                    <dt className="text-muted-foreground">{spec.key}</dt>
                    <dd className="font-medium">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>
      </div>

      {product.description && (
        <div className="mt-12">
          <h2 className="mb-4 text-xl font-semibold">Description</h2>
          <div className="prose max-w-none text-muted-foreground">
            <p className="whitespace-pre-wrap">{product.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
