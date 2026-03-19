import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/app/providers/auth-provider";
import { useCart } from "@/app/providers/cart-provider";
import { supabase } from "@/lib/supabase/client";
import { ROUTES } from "@/lib/constants";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().min(7, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  notes: z.string().optional(),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { user, profile } = useAuth();
  const { items, clearCart, itemCount } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
    },
  });

  async function onSubmit(data: CheckoutValues) {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!user) {
      toast.error("You must be logged in to place an order");
      return;
    }
    setSubmitting(true);
    try {
      // First, sync the local cart to the database so the place_order RPC can read it
      let { data: cart } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!cart) {
        const { data: newCart, error: cartError } = await supabase
          .from("carts")
          .insert({ user_id: user.id })
          .select("id")
          .single();
        if (cartError) throw new Error("Failed to create cart");
        cart = newCart;
      }

      // Delete existing cart items in DB
      await supabase.from("cart_items").delete().eq("cart_id", cart.id);

      // Insert new cart items from local state
      const { error: itemsError } = await supabase.from("cart_items").insert(
        items.map((i) => ({
          cart_id: cart.id,
          product_id: i.product_id,
          quantity: i.quantity,
        }))
      );
      if (itemsError) throw new Error("Failed to sync cart items");

      const shippingAddress = {
        full_name: data.fullName,
        address: data.address,
        city: data.city,
      };

      const { data: result, error } = await supabase.rpc("place_order", {
        p_shipping_address: shippingAddress,
        p_phone: data.phone,
        p_notes: data.notes ?? undefined,
        p_shipping_fee: 0,
      });

      if (error) throw error;

      setOrderId(result as string);
      clearCart();
      toast.success("Order placed successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to place order";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (orderId) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <CheckCircle className="mx-auto size-16 text-green-500" />
        <h1 className="mt-4 text-2xl font-bold">Order Placed!</h1>
        <p className="mt-2 text-muted-foreground">
          Your order has been placed successfully. You will pay on delivery.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Button onClick={() => navigate(ROUTES.orderDetail(orderId))}>
            View Order
          </Button>
          <Button variant="outline" onClick={() => navigate(ROUTES.products)}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-lg text-muted-foreground">Your cart is empty</p>
        <Button className="mt-4" onClick={() => navigate(ROUTES.products)}>
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
      <div className="grid gap-8 md:grid-cols-5">
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                id="checkout-form"
                onSubmit={(e) => void handleSubmit(onSubmit)(e)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" {...register("fullName")} />
                  {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" {...register("phone")} />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" rows={3} {...register("address")} />
                  {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...register("city")} />
                  {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Order Notes (optional)</Label>
                  <Textarea id="notes" rows={2} {...register("notes")} placeholder="Any special instructions..." />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{itemCount} item(s)</p>
              <Separator className="my-4" />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment</span>
                  <span>Cash on Delivery</span>
                </div>
              </div>
              <Separator className="my-4" />
              <Button
                type="submit"
                form="checkout-form"
                className="w-full"
                size="lg"
                disabled={submitting}
              >
                {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                {submitting ? "Placing Order..." : "Place Order (COD)"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
