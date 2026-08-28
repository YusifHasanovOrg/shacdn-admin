export const PRODUCT_CATEGORIES = ["ELECTRONICS", "CLOTHING", "FOOD", "HOME"] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_STATUSES = ["ACTIVE", "DRAFT", "ARCHIVED"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  status: ProductStatus;
  price: number;
  description: string;
  created_at: string;
  updated_at?: string;
};

export const productCategoryOptions: { label: string; value: ProductCategory }[] = PRODUCT_CATEGORIES.map(
  (value) => ({ label: value, value }),
);

export const productStatusOptions: { label: string; value: ProductStatus }[] = PRODUCT_STATUSES.map((value) => ({
  label: value,
  value,
}));

export function productCategoryLabel(category: ProductCategory) {
  return productCategoryOptions.find((option) => option.value === category)?.label ?? category;
}

export function productStatusLabel(status: ProductStatus) {
  return productStatusOptions.find((option) => option.value === status)?.label ?? status;
}
