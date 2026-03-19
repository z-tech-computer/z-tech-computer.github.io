import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import {
  ShoppingCart,
  Search,
  Menu,
  User,
  Package,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/app/providers/auth-provider";
import { useCart } from "@/app/providers/cart-provider";
import { APP_NAME, ROUTES } from "@/lib/constants";

const NAV_LINKS = [
  { label: "Home", to: ROUTES.home },
  { label: "Products", to: ROUTES.products },
  { label: "Categories", to: ROUTES.categories },
] as const;

function SearchForm({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`${ROUTES.search}?q=${encodeURIComponent(trimmed)}`);
      setQuery("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative">
        <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>
    </form>
  );
}

function CartButton() {
  const { itemCount } = useCart();

  return (
    <Button variant="ghost" size="icon" render={<Link to={ROUTES.cart} />} nativeButton={false}>
      <div className="relative">
        <ShoppingCart className="size-5" />
        {itemCount > 0 && (
          <Badge className="absolute -top-2 -right-2 size-4 justify-center p-0 text-[10px]">
            {itemCount}
          </Badge>
        )}
      </div>
    </Button>
  );
}

function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" render={<Link to={ROUTES.login} />} nativeButton={false}>
          Login
        </Button>
        <Button size="sm" render={<Link to={ROUTES.register} />} nativeButton={false}>
          Register
        </Button>
      </div>
    );
  }

  const initials = (profile?.full_name ?? user.email ?? "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar size="sm">
          <AvatarImage src={profile?.avatar_url ?? undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate(ROUTES.account)}>
          <User className="size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(ROUTES.orders)}>
          <Package className="size-4" />
          Orders
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="size-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" />}>
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>{APP_NAME}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 px-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 pt-4">
          <SearchForm />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <div className="flex md:hidden">
          <MobileMenu />
        </div>

        <Link to={ROUTES.home} className="text-lg font-bold tracking-tight">
          {APP_NAME}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Button
              key={link.to}
              variant="ghost"
              size="sm"
              render={<Link to={link.to} />}
              nativeButton={false}
            >
              {link.label}
            </Button>
          ))}
        </nav>

        <SearchForm className="hidden flex-1 md:block md:max-w-sm" />

        <div className="ml-auto flex items-center gap-2">
          <CartButton />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
