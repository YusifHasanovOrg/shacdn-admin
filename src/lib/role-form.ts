import { z } from "zod";

export const roleFormSchema = z.object({
  code: z
    .string()
    .min(2, { message: "Code must be at least 2 characters." })
    .max(64, { message: "Code must be at most 64 characters." })
    .regex(/^[a-z0-9_]+$/, { message: "Use lowercase letters, numbers, and underscores only." }),
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(255, { message: "Name must be at most 255 characters." }),
  permissions: z.array(z.string()),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;

export const emptyRoleForm: RoleFormValues = {
  code: "",
  name: "",
  permissions: [],
};

export function roleToForm(role: { code: string; name: string; permissions: string[] }): RoleFormValues {
  return {
    code: role.code,
    name: role.name,
    permissions: [...role.permissions],
  };
}

export function sanitizeRoleCode(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9_]/g, "");
}

export function permissionGroupKey(code: string) {
  const separator = code.indexOf(":");
  return separator === -1 ? code : code.slice(0, separator);
}
