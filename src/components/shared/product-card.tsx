import { Link } from "react-router";
import { ShoppingCart, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/app/providers/cart-provider";
import { formatCurrency } from "@/lib/utils/format";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  imageUrl?: string | null;
  categoryName?: string;
  stockQuantity: number;
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  imageUrl,
  categoryName,
  stockQuantity,
}: ProductCardProps) {
  const { addItem } = useCart();

  function handleAddToCart() {
    addItem(id);
    toast.success(`${name} added to cart`);
  }

  return (
    <Card className="group overflow-hidden">
      <Link to={ROUTES.productDetail(slug)}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="size-12 text-muted-foreground/50" />
            </div>
          )}
          {stockQuantity > 0 && stockQuantity < 5 && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Low Stock
            </Badge>
          )}
          {stockQuantity === 0 && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              Out of Stock
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        {categoryName && (
          <p className="mb-1 text-xs text-muted-foreground">{categoryName}</p>
        )}
        <Link to={ROUTES.productDetail(slug)}>
          <h3 className="line-clamp-2 font-medium leading-tight hover:underline">
            {name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold">{formatCurrency(price)}</span>
          {compareAtPrice && compareAtPrice > price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(compareAtPrice)}
            </span>
          )}
        </div>
        <Button
          size="sm"
          className="mt-3 w-full"
          onClick={handleAddToCart}
          disabled={stockQuantity === 0}
        >
          <ShoppingCart className="mr-2 size-4" />
          {stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardContent>
    </Card>
  );
}
