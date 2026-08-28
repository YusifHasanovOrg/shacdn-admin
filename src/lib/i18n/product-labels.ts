"use client";

import { useCallback, useMemo } from "react";

import type { ProductCategory, ProductStatus } from "@/data/products";
import { PRODUCT_CATEGORIES, PRODUCT_STATUSES } from "@/data/products";
import type { TranslateFn } from "@/lib/i18n";
import { useTranslation } from "@/stores/locale/locale-provider";

export function useProductLabels() {
  const { t, locale } = useTranslation();

  const categoryOptions = useMemo(
    () =>
      PRODUCT_CATEGORIES.map((value) => ({
        value,
        label: t(`product.category.${value}`),
      })),
    [t],
  );

  const statusOptions = useMemo(
    () =>
      PRODUCT_STATUSES.map((value) => ({
        value,
        label: t(`product.status.${value}`),
      })),
    [t],
  );

  const categoryLabel = useCallback(
    (category: ProductCategory) => t(`product.category.${category}`),
    [t],
  );

  const statusLabel = useCallback(
    (status: ProductStatus) => t(`product.status.${status}`),
    [t],
  );

  return {
    locale,
    t,
    categoryOptions,
    statusOptions,
    categoryLabel,
    statusLabel,
  };
}

export function productCategoryLabelWith(t: TranslateFn, category: ProductCategory) {
  return t(`product.category.${category}`);
}

export function productStatusLabelWith(t: TranslateFn, status: ProductStatus) {
  return t(`product.status.${status}`);
}
