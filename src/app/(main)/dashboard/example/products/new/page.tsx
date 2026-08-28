"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Loader2, PackagePlus, Save } from "lucide-react";
import { toast } from "sonner";

import { ProductForm } from "@/app/(main)/dashboard/example/products/_components/product-form";
import { RequirePermission, useApiErrorHandler } from "@/components/auth/permission-guards";
import { CrudFormPage } from "@/components/crud/crud-form-page";
import { Button } from "@/components/ui/button";
import { formatApiError } from "@/lib/api/client";
import { productsApi } from "@/lib/api/products";
import { PERMISSIONS } from "@/lib/auth/constants";
import { emptyProductForm, productFormToBody } from "@/lib/product-form";

const FORM_ID = "create-product-form";

function NewProductContent() {
  const router = useRouter();
  const handleApiError = useApiErrorHandler();
  const [saving, setSaving] = useState(false);

  async function submit(values: typeof emptyProductForm) {
    setSaving(true);
    try {
      const product = await productsApi.create(productFormToBody(values));
      toast.success("Product created");
      router.push(`/dashboard/example/products/${product.id}/edit`);
    } catch (error) {
      handleApiError(error);
      toast.error(formatApiError(error, "Failed to create product"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <CrudFormPage
      backHref="/dashboard/example/products"
      backLabel="Products"
      icon={PackagePlus}
      title="New product"
      description="Add a product to the example catalog"
      cardTitle="Product details"
      cardDescription="Fill in the basic product information"
      actions={
        <Button type="submit" form={FORM_ID} disabled={saving}>
          {saving ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Save data-icon="inline-start" />}
          Save
        </Button>
      }
    >
      <ProductForm formId={FORM_ID} defaultValues={emptyProductForm} disabled={saving} onSubmit={submit} />
    </CrudFormPage>
  );
}

export default function NewProductPage() {
  return (
    <RequirePermission permission={PERMISSIONS.productsWrite}>
      <NewProductContent />
    </RequirePermission>
  );
}
