"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { Loader2, Save, ShieldPlus } from "lucide-react";
import { toast } from "sonner";

import { RoleForm } from "@/app/(main)/dashboard/roles/_components/role-form";
import { RequirePermission, useApiErrorHandler } from "@/components/auth/permission-guards";
import { CrudFormPage } from "@/components/crud/crud-form-page";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { rbacApi, type PermissionResponse } from "@/lib/api/auth";
import { formatApiError } from "@/lib/api/client";
import { PERMISSIONS } from "@/lib/auth/constants";
import { emptyRoleForm, type RoleFormValues } from "@/lib/role-form";
import { useTranslation } from "@/stores/locale/locale-provider";

const FORM_ID = "create-role-form";

function NewRoleContent() {
  const router = useRouter();
  const { t } = useTranslation();
  const handleApiError = useApiErrorHandler();
  const [permissionsCatalog, setPermissionsCatalog] = useState<PermissionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const data = await rbacApi.listPermissions();
        if (cancelled) return;
        setPermissionsCatalog(data);
      } catch (error) {
        if (cancelled) return;
        handleApiError(error);
        toast.error(formatApiError(error, t("roles.form.permissionsLoadError")));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [handleApiError, t]);

  async function submit(values: RoleFormValues) {
    setSaving(true);
    try {
      const role = await rbacApi.createRole({
        code: values.code.trim().toLowerCase(),
        name: values.name.trim(),
        permissions: values.permissions,
      });
      toast.success(t("roles.new.created"));
      router.push(`/dashboard/roles/${encodeURIComponent(role.code)}/edit`);
    } catch (error) {
      handleApiError(error);
      toast.error(formatApiError(error, t("roles.new.createError")));
    } finally {
      setSaving(false);
    }
  }

  return (
    <CrudFormPage
      backHref="/dashboard/roles"
      backLabel={t("roles.back")}
      icon={ShieldPlus}
      title={t("roles.new.title")}
      description={t("roles.new.description")}
      wrapInCard={false}
      actions={
        <Button type="submit" form={FORM_ID} disabled={saving || loading}>
          {saving ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Save data-icon="inline-start" />}
          {t("common.save")}
        </Button>
      }
    >
      {loading ? (
        <div className="flex flex-col gap-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : (
        <RoleForm
          formId={FORM_ID}
          mode="create"
          defaultValues={emptyRoleForm}
          permissionsCatalog={permissionsCatalog}
          disabled={saving}
          onSubmit={submit}
          t={t}
        />
      )}
    </CrudFormPage>
  );
}

export default function NewRolePage() {
  return (
    <RequirePermission permission={PERMISSIONS.rolesWrite}>
      <NewRoleContent />
    </RequirePermission>
  );
}
