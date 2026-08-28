"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { Loader2, Package, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ProductForm } from "@/app/(main)/dashboard/example/products/_components/product-form";
import { Can, RequirePermission, useApiErrorHandler, usePermission } from "@/components/auth/permission-guards";
import { ConfirmDialog } from "@/components/crud/confirm-dialog";
import { CrudFormPage } from "@/components/crud/crud-form-page";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/data/products";
import { formatApiError } from "@/lib/api/client";
import { productsApi } from "@/lib/api/products";
import { PERMISSIONS } from "@/lib/auth/constants";
import { type emptyProductForm, productFormToBody, productToForm } from "@/lib/product-form";

const FORM_ID = "edit-product-form";

function EditProductContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const canWrite = usePermission(PERMISSIONS.productsWrite);
  const handleApiError = useApiErrorHandler();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const result = await productsApi.getById(params.id);
        if (cancelled) return;
        setProduct(result);
      } catch (error) {
        if (cancelled) return;
        handleApiError(error);
        toast.error(formatApiError(error, "Failed to load product"));
        router.replace("/dashboard/example/products");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [handleApiError, params.id, router]);

  async function submit(values: typeof emptyProductForm) {
    if (!product || !canWrite) return;
    setSaving(true);
    try {
      const updated = await productsApi.update(product.id, productFormToBody(values));
      setProduct(updated);
      toast.success("Product updated");
    } catch (error) {
      handleApiError(error);
      toast.error(formatApiError(error, "Failed to update product"));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!product || !canWrite) return;
    setDeleting(true);
    try {
      await productsApi.delete(product.id);
      toast.success("Product deleted");
      router.push("/dashboard/example/products");
    } catch (error) {
      handleApiError(error);
      toast.error(formatApiError(error, "Failed to delete product"));
      setDeleting(false);
    }
  }

  const busy = saving || deleting;
  const readOnly = !canWrite;

  return (
    <>
      <CrudFormPage
        backHref="/dashboard/example/products"
        backLabel="Products"
        icon={Package}
        title={
          loading ? (
            <Skeleton className="h-9 w-48" />
          ) : (
            (product?.name ?? "Product")
          )
        }
        description={
          loading ? (
            <Skeleton className="h-4 w-64" />
          ) : (
            `${readOnly ? "View product" : "Edit product"} · ${product?.sku ?? ""}`
          )
        }
        cardTitle="Product details"
        cardDescription={
          readOnly ? "Read-only view (products:write required to edit)" : "Update the product information"
        }
        actions={
          <Can permission={PERMISSIONS.productsWrite}>
            <Button type="button" variant="outline" disabled={busy || loading || !product} onClick={() => setDeleteOpen(true)}>
              {deleting ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <Trash2 data-icon="inline-start" />
              )}
              Delete
            </Button>
            <Button type="submit" form={FORM_ID} disabled={busy || loading || !product}>
              {saving ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Save data-icon="inline-start" />}
              Save
            </Button>
          </Can>
        }
      >
        {loading || !product ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <ProductForm
            key={product.id}
            formId={FORM_ID}
            defaultValues={productToForm(product)}
            disabled={busy || readOnly}
            onSubmit={submit}
          />
        )}
      </CrudFormPage>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete product?"
        description={product ? `"${product.name}" will be soft-deleted.` : undefined}
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={remove}
      />
    </>
  );
}

export default function EditProductPage() {
  return (
    <RequirePermission permission={PERMISSIONS.productsRead}>
      <EditProductContent />
    </RequirePermission>
  );
}
