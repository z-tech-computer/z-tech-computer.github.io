import { supabase } from "@/lib/supabase/client";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import type { Product, Category, Brand, ProductImage, ProductSpecification } from "@/types/database";

export interface ProductListItem extends Product {
  primary_image: string | null;
  category_name: string;
}

export interface ProductFilters {
  page?: number;
  categorySlug?: string;
  brandSlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
}

export interface ProductDetail extends Product {
  category: Category;
  brand: Brand | null;
  images: ProductImage[];
  specifications: ProductSpecification[];
}

export async function getProducts(filters: ProductFilters) {
  const page = filters.page ?? 1;
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from("products")
    .select(
      "*, product_images!inner(url), categories!inner(name, slug)",
      { count: "exact" },
    )
    .eq("is_active", true);

  if (filters.search) {
    query = query.textSearch("search_vector", filters.search, {
      type: "websearch",
    });
  }
  if (filters.categorySlug) {
    query = query.eq("categories.slug" as never, filters.categorySlug);
  }
  if (filters.brandSlug) {
    query = query.eq("brand_id", filters.brandSlug);
  }
  if (filters.minPrice !== undefined) {
    query = query.gte("price", filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte("price", filters.maxPrice);
  }

  switch (filters.sortBy) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "name-asc":
      query = query.order("name", { ascending: true });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data, count, error } = await query.range(from, to);
  if (error) throw error;

  return { data: data ?? [], count: count ?? 0 };
}

export async function getProductsByCategory(categorySlug: string, page = 1) {
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data: cat } = await supabase
    .from("categories")
    .select("id, name")
    .eq("slug", categorySlug)
    .single();

  if (!cat) throw new Error("Category not found");

  const { data, count, error } = await supabase
    .from("products")
    .select("*, product_images(url, is_primary)", { count: "exact" })
    .eq("is_active", true)
    .eq("category_id", cat.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { data: data ?? [], count: count ?? 0, categoryName: cat.name };
}

export async function getProductsByBrand(brandSlug: string, page = 1) {
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data: brand } = await supabase
    .from("brands")
    .select("id, name")
    .eq("slug", brandSlug)
    .single();

  if (!brand) throw new Error("Brand not found");

  const { data, count, error } = await supabase
    .from("products")
    .select("*, product_images(url, is_primary)", { count: "exact" })
    .eq("is_active", true)
    .eq("brand_id", brand.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { data: data ?? [], count: count ?? 0, brandName: brand.name };
}

export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "*, categories(*), brands(*), product_images(*), product_specifications(*)",
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) throw error;

  const raw = data as Record<string, unknown>;
  return {
    ...data,
    category: raw.categories as Category,
    brand: (raw.brands as Brand) ?? null,
    images: ((raw.product_images as ProductImage[]) ?? []).sort(
      (a, b) => a.sort_order - b.sort_order,
    ),
    specifications: (
      (raw.product_specifications as ProductSpecification[]) ?? []
    ).sort((a, b) => a.sort_order - b.sort_order),
  } as ProductDetail;
}

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

export async function getBrands() {
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function getFeaturedProducts(limit = 8) {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(url, is_primary)")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getNewArrivals(limit = 8) {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(url, is_primary)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
