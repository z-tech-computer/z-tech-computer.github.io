import { Outlet } from "react-router";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

export function PublicLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
