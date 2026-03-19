import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils/format";
import { ROUTES } from "@/lib/constants";
import type { Order, OrderItem, OrderStatusHistory } from "@/types/database";

interface OrderDetail extends Order {
  items: OrderItem[];
  history: OrderStatusHistory[];
}

function useOrderDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["orders", "detail", id],
    queryFn: async () => {
      const { data: order, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;

      const [{ data: items }, { data: history }] = await Promise.all([
        supabase.from("order_items").select("*").eq("order_id", id!),
        supabase
          .from("order_status_history")
          .select("*")
          .eq("order_id", id!)
          .order("created_at", { ascending: true }),
      ]);

      return {
        ...(order as Order),
        items: (items ?? []) as OrderItem[],
        history: (history ?? []) as OrderStatusHistory[],
      } satisfies OrderDetail;
    },
    enabled: !!id,
  });
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrderDetail(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="mb-4 h-6 w-32" />
        <Skeleton className="mb-8 h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Order not found</p>
      </div>
    );
  }

  const addr = order.shipping_address as {
    full_name?: string;
    address?: string;
    city?: string;
  } | null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to={ROUTES.orders}>
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-2 size-4" /> Back to Orders
        </Button>
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
          <p className="text-sm text-muted-foreground">
            Placed on{" "}
            {new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Badge>{order.status}</Badge>
      </div>

      <Separator className="my-6" />

      <h2 className="mb-3 text-lg font-semibold">Items</h2>
      <div className="space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4">
            <div className="size-16 shrink-0 overflow-hidden rounded-md bg-muted">
              {item.product_image_url && (
                <img src={item.product_image_url} alt={item.product_name} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.product_name}</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(item.product_price)} x {item.quantity}
              </p>
            </div>
            <p className="font-medium">{formatCurrency(item.subtotal)}</p>
          </div>
        ))}
      </div>

      <Separator className="my-6" />

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold">Shipping</h2>
          <p className="text-sm">{addr?.full_name}</p>
          <p className="text-sm text-muted-foreground">{addr?.address}</p>
          <p className="text-sm text-muted-foreground">{addr?.city}</p>
          <p className="text-sm text-muted-foreground">Phone: {order.phone}</p>
          {order.notes && (
            <p className="mt-2 text-sm text-muted-foreground">
              Notes: {order.notes}
            </p>
          )}
        </div>
        <div>
          <h2 className="mb-3 text-lg font-semibold">Summary</h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatCurrency(order.shipping_fee)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
            <p className="text-muted-foreground">Cash on Delivery</p>
          </div>
        </div>
      </div>

      {order.history.length > 0 && (
        <>
          <Separator className="my-6" />
          <h2 className="mb-3 text-lg font-semibold">Status Timeline</h2>
          <div className="space-y-3">
            {order.history.map((h, i) => (
              <div key={h.id} className="flex items-start gap-3">
                {i === order.history.length - 1 ? (
                  <CheckCircle2 className="mt-0.5 size-5 text-green-500" />
                ) : (
                  <Clock className="mt-0.5 size-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium capitalize">{h.status}</p>
                  {h.note && <p className="text-xs text-muted-foreground">{h.note}</p>}
                  <p className="text-xs text-muted-foreground">
                    {new Date(h.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
