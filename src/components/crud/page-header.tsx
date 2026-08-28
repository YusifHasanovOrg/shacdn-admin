import Link from "next/link";

import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  backHref?: string;
  backLabel?: string;
  icon?: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  backHref,
  backLabel,
  icon: Icon,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="min-w-0">
        {backHref ? (
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
            <Link href={backHref}>
              <ArrowLeft data-icon="inline-start" />
              {backLabel ?? "Back"}
            </Link>
          </Button>
        ) : null}
        <div className="flex items-start gap-3.5">
          {Icon ? (
            <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
          ) : null}
          <div>
            <h1 className="font-medium text-3xl tracking-tight">{title}</h1>
            {description ? <p className="mt-1 text-muted-foreground text-sm">{description}</p> : null}
          </div>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
