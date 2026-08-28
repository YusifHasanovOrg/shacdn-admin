"use client";

import { useMemo } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { PermissionResponse } from "@/lib/api/auth";
import type { TranslateFn } from "@/lib/i18n";
import { permissionGroupKey, type RoleFormValues, roleFormSchema, sanitizeRoleCode } from "@/lib/role-form";

type RoleFormProps = {
  defaultValues: RoleFormValues;
  disabled?: boolean;
  formId: string;
  mode: "create" | "edit";
  onSubmit: (values: RoleFormValues) => void | Promise<void>;
  permissionsCatalog: PermissionResponse[];
  t: TranslateFn;
};

function groupLabel(t: TranslateFn, group: string) {
  const key = `roles.groups.${group}`;
  const label = t(key);
  return label === key ? group.charAt(0).toUpperCase() + group.slice(1) : label;
}

function groupPermissions(permissions: PermissionResponse[]) {
  const groups = new Map<string, PermissionResponse[]>();
  for (const permission of permissions) {
    const key = permissionGroupKey(permission.code);
    const list = groups.get(key) ?? [];
    list.push(permission);
    groups.set(key, list);
  }
  return [...groups.entries()].sort(([left], [right]) => left.localeCompare(right));
}

export function RoleForm({
  defaultValues,
  disabled,
  formId,
  mode,
  onSubmit,
  permissionsCatalog,
  t,
}: RoleFormProps) {
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues,
  });
  const selected = form.watch("permissions");
  const groups = useMemo(() => groupPermissions(permissionsCatalog), [permissionsCatalog]);
  const selectedCount = selected.length;
  const totalCount = permissionsCatalog.length;

  function setPermissions(next: string[]) {
    form.setValue("permissions", next, { shouldDirty: true, shouldTouch: true });
  }

  function togglePermission(code: string, checked: boolean) {
    setPermissions(checked ? [...new Set([...selected, code])] : selected.filter((item) => item !== code));
  }

  function toggleGroup(codes: string[], checked: boolean) {
    setPermissions(
      checked ? [...new Set([...selected, ...codes])] : selected.filter((item) => !codes.includes(item)),
    );
  }

  function selectAll(checked: boolean) {
    setPermissions(checked ? permissionsCatalog.map((permission) => permission.code) : []);
  }

  return (
    <form id={formId} noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card className="shadow-xs">
        <CardHeader className="border-b">
          <CardTitle>{t("roles.form.detailsTitle")}</CardTitle>
          <CardDescription>{t("roles.form.detailsDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <FieldGroup className="gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="code"
                render={({ field, fieldState }) => (
                  <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${formId}-code`}>{t("roles.form.code")}</FieldLabel>
                    <Input
                      {...field}
                      id={`${formId}-code`}
                      placeholder={t("roles.form.codePlaceholder")}
                      disabled={disabled || mode === "edit"}
                      autoComplete="off"
                      spellCheck={false}
                      aria-invalid={fieldState.invalid}
                      onChange={(event) => field.onChange(sanitizeRoleCode(event.target.value))}
                    />
                    <FieldDescription>
                      {mode === "edit" ? t("roles.form.codeLocked") : t("roles.form.codeHint")}
                    </FieldDescription>
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${formId}-name`}>{t("roles.form.name")}</FieldLabel>
                    <Input
                      {...field}
                      id={`${formId}-name`}
                      placeholder={t("roles.form.namePlaceholder")}
                      disabled={disabled}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardHeader className="border-b">
          <CardTitle>{t("roles.form.permissionsTitle")}</CardTitle>
          <CardDescription>
            {t("roles.form.permissionsSelected", { selected: selectedCount, total: totalCount })}
          </CardDescription>
          <CardAction>
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" variant="outline" disabled={disabled || totalCount === 0} onClick={() => selectAll(true)}>
                {t("roles.form.selectAll")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={disabled || selectedCount === 0}
                onClick={() => selectAll(false)}
              >
                {t("roles.form.clear")}
              </Button>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="pt-6">
          {groups.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("roles.form.permissionsEmpty")}</p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {groups.map(([group, permissions]) => {
                const codes = permissions.map((permission) => permission.code);
                const checkedCount = codes.filter((code) => selected.includes(code)).length;
                const allChecked = checkedCount === codes.length && codes.length > 0;
                const someChecked = checkedCount > 0 && !allChecked;

                return (
                  <div key={group} className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
                    <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-3">
                      <label htmlFor={`${formId}-group-${group}`} className="flex min-w-0 cursor-pointer items-center gap-3">
                        <Checkbox
                          id={`${formId}-group-${group}`}
                          checked={allChecked ? true : someChecked ? "indeterminate" : false}
                          disabled={disabled}
                          onCheckedChange={(value) => toggleGroup(codes, value === true)}
                        />
                        <span className="min-w-0">
                          <span className="block font-medium text-sm">{groupLabel(t, group)}</span>
                          <span className="text-muted-foreground text-xs">
                            {t("roles.form.groupCount", { selected: checkedCount, total: codes.length })}
                          </span>
                        </span>
                      </label>
                      <Badge variant="secondary" className="shrink-0 tabular-nums">
                        {checkedCount}/{codes.length}
                      </Badge>
                    </div>
                    <div className="grid gap-1 p-2">
                      {permissions.map((permission) => {
                        const checked = selected.includes(permission.code);
                        const inputId = `${formId}-perm-${permission.code}`;
                        return (
                          <label
                            key={permission.code}
                            htmlFor={inputId}
                            className="flex cursor-pointer items-start gap-3 rounded-lg px-2.5 py-2.5 hover:bg-muted/60"
                          >
                            <Checkbox
                              id={inputId}
                              className="mt-0.5"
                              checked={checked}
                              disabled={disabled}
                              onCheckedChange={(value) => togglePermission(permission.code, value === true)}
                            />
                            <span className="grid min-w-0 gap-0.5">
                              <span className="font-mono text-sm">{permission.code}</span>
                              <span className="text-muted-foreground text-xs leading-relaxed">
                                {permission.description}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
