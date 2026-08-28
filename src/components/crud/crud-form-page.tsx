import { PageHeader } from "@/components/crud/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CrudFormPageProps = {
  backHref: string;
  backLabel?: string;
  icon?: React.ComponentProps<typeof PageHeader>["icon"];
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  cardTitle?: React.ReactNode;
  cardDescription?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function CrudFormPage({
  backHref,
  backLabel,
  icon,
  title,
  description,
  actions,
  cardTitle = "Details",
  cardDescription,
  children,
  className,
}: CrudFormPageProps) {
  return (
    <div className={cn("@container/main flex w-full flex-col gap-6", className)}>
      <PageHeader
        backHref={backHref}
        backLabel={backLabel}
        icon={icon}
        title={title}
        description={description}
        actions={actions}
      />
      <Card className="shadow-xs">
        <CardHeader className="border-b">
          <CardTitle>{cardTitle}</CardTitle>
          {cardDescription ? <CardDescription>{cardDescription}</CardDescription> : null}
        </CardHeader>
        <CardContent className="pt-6">{children}</CardContent>
      </Card>
    </div>
  );
}
