"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { Loader2, Package, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ProductForm } from "@/app/(main)/dashboard/example/products/_components/product-form";
import { Can, RequirePermission, useApiErrorHandler, usePermission } from "@/components/auth/permission-guards";
import { ConfirmDialog } from "@/components/crud/confirm-dialog";
import { CrudFormPage } from "@/components/crud/crud-form-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Product } from "@/data/products";
import { formatApiError } from "@/lib/api/client";
import { productsApi } from "@/lib/api/products";
import { PERMISSIONS } from "@/lib/auth/constants";
import { useProductLabels } from "@/lib/i18n/product-labels";
import { type emptyProductForm, productFormToBody, productToForm } from "@/lib/product-form";
import { useTranslation } from "@/stores/locale/locale-provider";

const FORM_ID = "edit-product-form";

function EditProductContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { statusLabel } = useProductLabels();
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
        toast.error(formatApiError(error, t("example.products.edit.loadError")));
        router.replace("/dashboard/example/products");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [handleApiError, params.id, router, t]);

  async function submit(values: typeof emptyProductForm) {
    if (!product || !canWrite) return;
    setSaving(true);
    try {
      const updated = await productsApi.update(product.id, productFormToBody(values));
      setProduct(updated);
      toast.success(t("example.products.edit.updated"));
    } catch (error) {
      handleApiError(error);
      toast.error(formatApiError(error, t("example.products.edit.updateError")));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!product || !canWrite) return;
    setDeleting(true);
    try {
      await productsApi.delete(product.id);
      toast.success(t("example.products.edit.deleted"));
      router.push("/dashboard/example/products");
    } catch (error) {
      handleApiError(error);
      toast.error(formatApiError(error, t("example.products.edit.deleteError")));
      setDeleting(false);
    }
  }

  const busy = saving || deleting;
  const readOnly = !canWrite;

  return (
    <>
      <CrudFormPage
        backHref="/dashboard/example/products"
        backLabel={t("example.products.back")}
        icon={Package}
        wrapInCard={false}
        title={
          loading ? (
            <span className="inline-block h-8 w-48 animate-pulse rounded-md bg-muted" />
          ) : (
            <span className="inline-flex flex-wrap items-center gap-2.5">
              {product?.name ?? t("example.products.title")}
              {product ? (
                <Badge
                  variant={product.status === "ACTIVE" ? "default" : product.status === "DRAFT" ? "secondary" : "outline"}
                  className={cn("align-middle text-xs font-normal", product.status === "ARCHIVED" && "text-muted-foreground")}
                >
                  {statusLabel(product.status)}
                </Badge>
              ) : null}
            </span>
          )
        }
        description={
          loading ? (
            <span className="inline-block h-4 w-64 animate-pulse rounded-md bg-muted" />
          ) : (
            `${readOnly ? t("example.products.edit.viewDescription") : t("example.products.edit.editDescription")} · ${product?.sku ?? ""}`
          )
        }
        actions={
          <Can permission={PERMISSIONS.productsWrite}>
            <Button type="button" variant="outline" disabled={busy || loading || !product} onClick={() => setDeleteOpen(true)}>
              {deleting ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <Trash2 data-icon="inline-start" />
              )}
              {t("common.delete")}
            </Button>
            <Button type="submit" form={FORM_ID} disabled={busy || loading || !product}>
              {saving ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Save data-icon="inline-start" />}
              {t("common.save")}
            </Button>
          </Can>
        }
      >
        {loading || !product ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
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
        title={t("example.products.edit.deleteTitle")}
        description={product ? t("example.products.edit.deleteDescription", { name: product.name }) : undefined}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
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
