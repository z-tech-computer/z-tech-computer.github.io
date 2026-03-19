import { Toaster } from "sonner";
import { QueryProvider } from "@/app/providers/query-provider";
import { AuthProvider } from "@/app/providers/auth-provider";
import { CartProvider } from "@/app/providers/cart-provider";
import { AppRouter } from "@/app/router";

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <CartProvider>
          <AppRouter />
          <Toaster richColors position="top-right" />
        </CartProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
