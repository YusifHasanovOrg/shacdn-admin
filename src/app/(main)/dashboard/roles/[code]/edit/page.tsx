"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { Loader2, Save, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { RoleForm } from "@/app/(main)/dashboard/roles/_components/role-form";
import { Can, RequirePermission, useApiErrorHandler, usePermission } from "@/components/auth/permission-guards";
import { ConfirmDialog } from "@/components/crud/confirm-dialog";
import { CrudFormPage } from "@/components/crud/crud-form-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { rbacApi, type PermissionResponse, type RoleResponse } from "@/lib/api/auth";
import { formatApiError } from "@/lib/api/client";
import { PERMISSIONS } from "@/lib/auth/constants";
import { type RoleFormValues, roleToForm } from "@/lib/role-form";
import { useTranslation } from "@/stores/locale/locale-provider";

const FORM_ID = "edit-role-form";

function EditRoleContent() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const canWrite = usePermission(PERMISSIONS.rolesWrite);
  const handleApiError = useApiErrorHandler();
  const roleCode = decodeURIComponent(params.code);
  const [role, setRole] = useState<RoleResponse | null>(null);
  const [permissionsCatalog, setPermissionsCatalog] = useState<PermissionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const [roles, permissions] = await Promise.all([rbacApi.listRoles(), rbacApi.listPermissions()]);
        if (cancelled) return;
        const match = roles.find((item) => item.code === roleCode);
        if (!match) {
          toast.error(t("roles.edit.loadError"));
          router.replace("/dashboard/roles");
          return;
        }
        setRole(match);
        setPermissionsCatalog(permissions);
      } catch (error) {
        if (cancelled) return;
        handleApiError(error);
        toast.error(formatApiError(error, t("roles.edit.loadError")));
        router.replace("/dashboard/roles");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [handleApiError, roleCode, router, t]);

  async function submit(values: RoleFormValues) {
    if (!role || !canWrite) return;
    setSaving(true);
    try {
      const updated = await rbacApi.updateRole(role.code, {
        name: values.name.trim(),
        permissions: values.permissions,
      });
      setRole(updated);
      toast.success(t("roles.edit.updated"));
    } catch (error) {
      handleApiError(error);
      toast.error(formatApiError(error, t("roles.edit.updateError")));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!role || !canWrite || role.system) return;
    setDeleting(true);
    try {
      await rbacApi.deleteRole(role.code);
      toast.success(t("roles.edit.deleted", { name: role.name }));
      router.push("/dashboard/roles");
    } catch (error) {
      handleApiError(error);
      toast.error(formatApiError(error, t("roles.edit.deleteError")));
      setDeleting(false);
    }
  }

  const busy = saving || deleting;
  const readOnly = !canWrite;

  return (
    <>
      <CrudFormPage
        backHref="/dashboard/roles"
        backLabel={t("roles.back")}
        icon={Shield}
        wrapInCard={false}
        title={
          loading ? (
            <span className="inline-block h-8 w-48 animate-pulse rounded-md bg-muted" />
          ) : (
            <span className="inline-flex items-center gap-2.5">
              {role?.name ?? t("roles.title")}
              {role?.system ? (
                <Badge variant="secondary" className="align-middle text-xs font-normal">
                  {t("roles.system")}
                </Badge>
              ) : null}
            </span>
          )
        }
        description={
          loading ? (
            <span className="inline-block h-4 w-64 animate-pulse rounded-md bg-muted" />
          ) : (
            `${readOnly ? t("roles.edit.viewDescription") : t("roles.edit.editDescription")} · ${role?.code ?? ""}`
          )
        }
        actions={
          <Can permission={PERMISSIONS.rolesWrite}>
            {role && !role.system ? (
              <Button type="button" variant="outline" disabled={busy || loading} onClick={() => setDeleteOpen(true)}>
                {deleting ? (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                ) : (
                  <Trash2 data-icon="inline-start" />
                )}
                {t("common.delete")}
              </Button>
            ) : null}
            <Button type="submit" form={FORM_ID} disabled={busy || loading || !role}>
              {saving ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Save data-icon="inline-start" />}
              {t("common.save")}
            </Button>
          </Can>
        }
      >
        {loading || !role ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : (
          <RoleForm
            key={role.code}
            formId={FORM_ID}
            mode="edit"
            defaultValues={roleToForm(role)}
            permissionsCatalog={permissionsCatalog}
            disabled={busy || readOnly}
            onSubmit={submit}
            t={t}
          />
        )}
      </CrudFormPage>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("roles.edit.deleteTitle")}
        description={role ? t("roles.edit.deleteDescription", { name: role.name }) : undefined}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        destructive
        loading={deleting}
        onConfirm={remove}
      />
    </>
  );
}

export default function EditRolePage() {
  return (
    <RequirePermission permission={PERMISSIONS.rolesRead}>
      <EditRoleContent />
    </RequirePermission>
  );
}
