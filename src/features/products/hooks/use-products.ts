import { useQuery } from "@tanstack/react-query";
import { productKeys, categoryKeys, brandKeys } from "../queries/keys";
import {
  getProducts,
  getProductBySlug,
  getCategories,
  getBrands,
  getFeaturedProducts,
  getNewArrivals,
  getProductsByCategory,
  getProductsByBrand,
} from "../services/product-service";
import type { ProductFilters } from "../services/product-service";

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: productKeys.list(filters as Record<string, unknown>),
    queryFn: () => getProducts(filters),
    placeholderData: (prev) => prev,
  });
}

export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: productKeys.detail(slug ?? ""),
    queryFn: () => getProductBySlug(slug!),
    enabled: !!slug,
  });
}

export function useProductsByCategory(slug: string, page: number) {
  return useQuery({
    queryKey: [...categoryKeys.all, "products", slug, page] as const,
    queryFn: () => getProductsByCategory(slug, page),
    placeholderData: (prev) => prev,
  });
}

export function useProductsByBrand(slug: string, page: number) {
  return useQuery({
    queryKey: [...brandKeys.all, "products", slug, page] as const,
    queryFn: () => getProductsByBrand(slug, page),
    placeholderData: (prev) => prev,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000,
  });
}

export function useBrands() {
  return useQuery({
    queryKey: brandKeys.list(),
    queryFn: getBrands,
    staleTime: 10 * 60 * 1000,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: () => getFeaturedProducts(),
  });
}

export function useNewArrivals() {
  return useQuery({
    queryKey: productKeys.newArrivals(),
    queryFn: () => getNewArrivals(),
  });
}
