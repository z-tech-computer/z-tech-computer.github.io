import { Link } from "react-router";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { MapPin, Phone, Mail, User, Briefcase, Cpu } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 pb-8 pt-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Brand & Details */}
          <div className="flex flex-col gap-4">
            <h3 className="text-2xl font-bold tracking-tight">{APP_NAME}</h3>
            <p className="text-sm font-medium text-muted-foreground italic">
              "Your tech solutions"
            </p>
            <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
              <Briefcase className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Whole Seller & Retailer of all kinds of Laptop Accessories.</span>
            </div>
            <div className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
              <Cpu className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Partner Brands: Intel, HP, Dell, ASUS.</span>
            </div>
          </div>

          {/* Contact Person */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Contact</h4>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 shrink-0" />
                <span className="font-medium text-foreground">Md. Zahirul Islam</span>
                <span className="ml-1 rounded-md border px-1.5 py-0.5 text-xs">Proprietor</span>
              </div>
              <div className="mt-1 flex flex-col gap-2">
                <a href="tel:+8801676905456" className="flex items-center gap-2 transition-colors hover:text-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  +88 01676-905456
                </a>
                <a href="tel:+8801761886107" className="flex items-center gap-2 transition-colors hover:text-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  +88 01761-886107
                </a>
              </div>
              <a href="mailto:zahirjisanruhan@gmail.com" className="mt-1 flex items-center gap-2 transition-colors hover:text-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                zahirjisanruhan@gmail.com
              </a>
            </div>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Location</h4>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="leading-relaxed">
                Shop No. 727, Level-7,<br />
                Computer City Center (Multiplan),<br />
                69-71, New Elephant Road,<br />
                Dhaka-1205.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link to={ROUTES.products} className="w-fit transition-colors hover:text-foreground">
                All Products
              </Link>
              <Link to={ROUTES.search} className="w-fit transition-colors hover:text-foreground">
                Search
              </Link>
              <Link to={ROUTES.cart} className="w-fit transition-colors hover:text-foreground">
                Shopping Cart
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t pt-8 text-sm text-muted-foreground md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
