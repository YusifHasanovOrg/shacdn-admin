"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { useTable } from "@tanstack/react-table";
import { Lock, Plus } from "lucide-react";
import { toast } from "sonner";

import { createRolesColumns } from "@/app/(main)/dashboard/roles/_components/roles-columns";
import { Can, RequirePermission, useApiErrorHandler, usePermission } from "@/components/auth/permission-guards";
import { ConfirmDialog } from "@/components/crud/confirm-dialog";
import { CrudListPage } from "@/components/crud/crud-list-page";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { rbacApi, type RoleResponse } from "@/lib/api/auth";
import { formatApiError } from "@/lib/api/client";
import { PERMISSIONS } from "@/lib/auth/constants";
import { dataTableFeatures } from "@/lib/data-table-features";
import { useTranslation } from "@/stores/locale/locale-provider";

function RolesPageContent() {
  const { t } = useTranslation();
  const canWrite = usePermission(PERMISSIONS.rolesWrite);
  const handleApiError = useApiErrorHandler();
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<RoleResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await rbacApi.listRoles();
      setRoles(data);
    } catch (error) {
      handleApiError(error);
      toast.error(formatApiError(error, t("roles.loadError")));
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [handleApiError, t]);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await rbacApi.deleteRole(deleteTarget.code);
      toast.success(t("roles.deleted", { name: deleteTarget.name }));
      setDeleteTarget(null);
      await loadRoles();
    } catch (error) {
      handleApiError(error);
      toast.error(formatApiError(error, t("roles.deleteError")));
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, handleApiError, loadRoles, t]);

  const columns = useMemo(
    () =>
      createRolesColumns({
        canWrite,
        onDelete: setDeleteTarget,
        t,
      }),
    [canWrite, t],
  );

  const table = useTable({
    features: dataTableFeatures,
    data: roles,
    columns,
    getRowId: (row) => row.code,
  });

  const description = useMemo(() => {
    if (loading) return t("roles.loading");
    const count = t("common.results", { count: roles.length.toLocaleString() });
    return canWrite ? `${t("roles.description")} · ${count}` : `${t("roles.descriptionRead")} · ${count}`;
  }, [canWrite, loading, roles.length, t]);

  return (
    <>
      <CrudListPage
        icon={Lock}
        title={t("roles.title")}
        description={description}
        actions={
          <Can permission={PERMISSIONS.rolesWrite}>
            <Button asChild>
              <Link href="/dashboard/roles/new">
                <Plus data-icon="inline-start" />
                {t("roles.add")}
              </Link>
            </Button>
          </Can>
        }
      >
        <DataTable
          table={table}
          loading={loading}
          emptyMessage={t("roles.empty")}
          emptyDescription={canWrite ? t("roles.emptyDescriptionWrite") : t("roles.emptyDescriptionRead")}
          emptyAction={
            canWrite ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/roles/new">
                  <Plus data-icon="inline-start" />
                  {t("roles.add")}
                </Link>
              </Button>
            ) : undefined
          }
        />
      </CrudListPage>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={t("roles.deleteTitle")}
        description={
          deleteTarget ? t("roles.deleteDescription", { name: deleteTarget.name }) : undefined
        }
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </>
  );
}

export default function Page() {
  return (
    <RequirePermission permission={PERMISSIONS.rolesRead}>
      <RolesPageContent />
    </RequirePermission>
  );
}
