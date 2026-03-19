export const APP_NAME = "Z-TECH-COMPUTER";

export const ITEMS_PER_PAGE = 12;

export const ROUTES = {
  home: "/",
  products: "/products",
  productDetail: (slug: string) => `/products/${slug}`,
  categories: "/categories",
  category: (slug: string) => `/categories/${slug}`,
  brand: (slug: string) => `/brands/${slug}`,
  search: "/search",
  cart: "/cart",
  checkout: "/checkout",
  login: "/auth/login",
  register: "/auth/register",
  account: "/account",
  orders: "/account/orders",
  orderDetail: (id: string) => `/account/orders/${id}`,
} as const;
