"use client";

import { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useApiErrorHandler } from "@/components/auth/permission-guards";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { rbacApi, type RoleResponse } from "@/lib/api/auth";
import { formatApiError } from "@/lib/api/client";
import type { User } from "@/lib/api/users";
import { usersApi } from "@/lib/api/users";

type ManageUserRolesDialogProps = {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export function ManageUserRolesDialog({ user, open, onOpenChange, onSaved }: ManageUserRolesDialogProps) {
  const handleApiError = useApiErrorHandler();
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const allRoles = await rbacApi.listRoles();
        if (cancelled) return;
        setRoles(allRoles);
        setSelectedRole(user?.roles[0] ?? allRoles[0]?.code ?? "");
      } catch (error) {
        if (cancelled) return;
        handleApiError(error);
        toast.error(formatApiError(error, "Failed to load roles"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [handleApiError, open, user]);

  async function save() {
    if (!user || !selectedRole) return;
    setSaving(true);
    try {
      await usersApi.setRoles(user.id, [selectedRole]);
      toast.success("Roles updated");
      onSaved();
    } catch (error) {
      handleApiError(error);
      toast.error(formatApiError(error, "Failed to update roles"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage roles</DialogTitle>
          <DialogDescription>
            Assign a role to {user?.name ?? "this user"}. Permissions follow the selected role.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-2">
            <Label htmlFor="user-role">Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger id="user-role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.code} value={role.code}>
                    {role.name} ({role.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void save()} disabled={saving || loading || !selectedRole}>
            {saving ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
