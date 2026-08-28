import { PageHeader } from "@/components/crud/page-header";
import { cn } from "@/lib/utils";

type CrudListPageProps = {
  icon?: React.ComponentProps<typeof PageHeader>["icon"];
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function CrudListPage({ icon, title, description, actions, children, className }: CrudListPageProps) {
  return (
    <div className={cn("@container/main flex flex-col gap-6", className)}>
      <PageHeader icon={icon} title={title} description={description} actions={actions} />
      {children}
    </div>
  );
}
