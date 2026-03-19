import { Link } from "react-router";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/app/providers/cart-provider";
import { supabase } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils/format";
import { ROUTES } from "@/lib/constants";
import type { Product } from "@/types/database";

interface CartProduct {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  slug: string;
  image_url: string | null;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, itemCount } = useCart();
  const [products, setProducts] = useState<Map<string, CartProduct>>(new Map());

  useEffect(() => {
    if (items.length === 0) {
      setProducts(new Map());
      return;
    }

    const ids = items.map((i) => i.product_id);
    supabase
      .from("products")
      .select("id, name, price, stock_quantity, slug, product_images(url, is_primary)")
      .in("id", ids)
      .then(({ data }) => {
        const map = new Map<string, CartProduct>();
        for (const p of data ?? []) {
          const raw = p as unknown as Product & { product_images: { url: string; is_primary: boolean }[] };
          const img = raw.product_images?.find((i) => i.is_primary)?.url ?? raw.product_images?.[0]?.url ?? null;
          map.set(p.id, { id: p.id, name: p.name, price: p.price, stock_quantity: p.stock_quantity, slug: p.slug, image_url: img });
        }
        setProducts(map);
      });
  }, [items]);

  const subtotal = items.reduce((sum, item) => {
    const product = products.get(item.product_id);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <ShoppingBag className="mx-auto size-16 text-muted-foreground/50" />
        <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add some products to get started</p>
        <Link to={ROUTES.products}>
          <Button className="mt-6">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <Button variant="ghost" size="sm" onClick={clearCart}>
          Clear Cart
        </Button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => {
            const product = products.get(item.product_id);
            if (!product) return null;
            return (
              <div key={item.product_id} className="flex gap-4 rounded-lg border p-4">
                <div className="size-20 shrink-0 overflow-hidden rounded-md bg-muted">
                  {product.image_url && (
                    <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link to={ROUTES.productDetail(product.slug)} className="font-medium hover:underline">
                      {product.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">{formatCurrency(product.price)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-md border">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => updateQuantity(item.product_id, item.quantity + 1)} disabled={item.quantity >= product.stock_quantity}>
                        <Plus className="size-3" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => removeItem(item.product_id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-right font-medium">
                  {formatCurrency(product.price * item.quantity)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <Separator className="my-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items ({itemCount})</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>Free</span>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <Link to={ROUTES.checkout}>
            <Button className="mt-6 w-full" size="lg">
              Proceed to Checkout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
