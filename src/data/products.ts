export type ProductCategory = "ELECTRONICS" | "CLOTHING" | "FOOD" | "HOME";

export type ProductStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";

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

export const productCategoryOptions: { label: string; value: ProductCategory }[] = [
  { label: "Electronics", value: "ELECTRONICS" },
  { label: "Clothing", value: "CLOTHING" },
  { label: "Food", value: "FOOD" },
  { label: "Home", value: "HOME" },
];

export const productStatusOptions: { label: string; value: ProductStatus }[] = [
  { label: "Active", value: "ACTIVE" },
  { label: "Draft", value: "DRAFT" },
  { label: "Archived", value: "ARCHIVED" },
];

export function productCategoryLabel(category: ProductCategory) {
  return productCategoryOptions.find((option) => option.value === category)?.label ?? category;
}

export function productStatusLabel(status: ProductStatus) {
  return productStatusOptions.find((option) => option.value === status)?.label ?? status;
}
