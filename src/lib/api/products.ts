import type { Product, ProductCategory, ProductStatus } from "@/data/products";
import { apiRequest } from "@/lib/api/client";

export type ProductListParams = {
  name?: string;
  sku?: string;
  category?: ProductCategory | ProductCategory[];
  status?: ProductStatus;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

export type ProductListResponse = {
  items: Product[];
  total: number;
  limit: number;
  offset: number;
};

export type ProductCreateBody = {
  name: string;
  sku: string;
  category: ProductCategory;
  status: ProductStatus;
  price: number;
  description?: string;
};

export type ProductUpdateBody = Partial<ProductCreateBody>;

function toQueryString(params: ProductListParams) {
  const search = new URLSearchParams();
  if (params.name) search.set("name", params.name);
  if (params.sku) search.set("sku", params.sku);
  if (params.category) {
    const categories = Array.isArray(params.category) ? params.category : [params.category];
    if (categories.length > 0) search.set("category", categories.join(","));
  }
  if (params.status) search.set("status", params.status);
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const productsApi = {
  list(params: ProductListParams = {}) {
    return apiRequest<ProductListResponse>(`/api/v1/products${toQueryString(params)}`);
  },

  getById(id: string) {
    return apiRequest<Product>(`/api/v1/products/${id}`);
  },

  create(body: ProductCreateBody) {
    return apiRequest<Product>("/api/v1/products", {
      method: "POST",
      body,
    });
  },

  update(id: string, body: ProductUpdateBody) {
    return apiRequest<Product>(`/api/v1/products/${id}`, {
      method: "PUT",
      body,
    });
  },

  delete(id: string) {
    return apiRequest<void>(`/api/v1/products/${id}`, {
      method: "DELETE",
    });
  },
};
