import { z } from "zod";

import type { ProductCategory, ProductStatus } from "@/data/products";

export const productFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  sku: z.string().min(1, { message: "SKU is required." }),
  category: z.enum(["ELECTRONICS", "CLOTHING", "FOOD", "HOME"]),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]),
  price: z.number().min(0, { message: "Price must be zero or greater." }),
  description: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const emptyProductForm: ProductFormValues = {
  name: "",
  sku: "",
  category: "ELECTRONICS",
  status: "DRAFT",
  price: 0,
  description: "",
};

export function productToForm(product: {
  name: string;
  sku: string;
  category: ProductCategory;
  status: ProductStatus;
  price: number;
  description: string;
}): ProductFormValues {
  return {
    name: product.name,
    sku: product.sku,
    category: product.category,
    status: product.status,
    price: product.price,
    description: product.description,
  };
}

export function productFormToBody(values: ProductFormValues) {
  return {
    name: values.name.trim(),
    sku: values.sku.trim(),
    category: values.category,
    status: values.status,
    price: values.price,
    description: values.description?.trim() ?? "",
  };
}
