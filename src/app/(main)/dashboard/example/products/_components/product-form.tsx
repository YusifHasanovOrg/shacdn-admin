"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useProductLabels } from "@/lib/i18n/product-labels";
import { type ProductFormValues, productFormSchema } from "@/lib/product-form";

type ProductFormProps = {
  defaultValues: ProductFormValues;
  disabled?: boolean;
  formId: string;
  onSubmit: (values: ProductFormValues) => void | Promise<void>;
};

export function ProductForm({ defaultValues, disabled, formId, onSubmit }: ProductFormProps) {
  const { t, categoryOptions, statusOptions } = useProductLabels();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });

  return (
    <form id={formId} noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card className="shadow-xs">
        <CardHeader className="border-b">
          <CardTitle>{t("example.products.form.detailsTitle")}</CardTitle>
          <CardDescription>{t("example.products.form.detailsDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <FieldGroup className="gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${formId}-name`}>{t("example.products.form.name")}</FieldLabel>
                    <Input
                      {...field}
                      id={`${formId}-name`}
                      placeholder={t("example.products.form.namePlaceholder")}
                      disabled={disabled}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="sku"
                render={({ field, fieldState }) => (
                  <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${formId}-sku`}>{t("example.products.form.sku")}</FieldLabel>
                    <Input
                      {...field}
                      id={`${formId}-sku`}
                      placeholder={t("example.products.form.skuPlaceholder")}
                      disabled={disabled}
                      autoComplete="off"
                      spellCheck={false}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>{t("example.products.form.skuHint")}</FieldDescription>
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Controller
                control={form.control}
                name="category"
                render={({ field, fieldState }) => (
                  <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${formId}-category`}>{t("example.products.form.category")}</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
                      <SelectTrigger id={`${formId}-category`} aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder={t("example.products.form.selectCategory")} />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="status"
                render={({ field, fieldState }) => (
                  <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${formId}-status`}>{t("example.products.form.status")}</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
                      <SelectTrigger id={`${formId}-status`} aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder={t("example.products.form.selectStatus")} />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="price"
                render={({ field, fieldState }) => (
                  <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${formId}-price`}>{t("example.products.form.price")}</FieldLabel>
                    <InputGroup className="h-8">
                      <InputGroupAddon>
                        <InputGroupText>$</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        {...field}
                        id={`${formId}-price`}
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder={t("example.products.form.pricePlaceholder")}
                        disabled={disabled}
                        aria-invalid={fieldState.invalid}
                        value={Number.isFinite(field.value) ? String(field.value) : ""}
                        onChange={(event) => {
                          const nextValue = Number.parseFloat(event.target.value);
                          field.onChange(Number.isNaN(nextValue) ? 0 : nextValue);
                        }}
                      />
                    </InputGroup>
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
          <CardTitle>{t("example.products.form.descriptionTitle")}</CardTitle>
          <CardDescription>{t("example.products.form.descriptionCardDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${formId}-description`}>{t("example.products.form.description")}</FieldLabel>
                <Textarea
                  {...field}
                  id={`${formId}-description`}
                  placeholder={t("example.products.form.descriptionPlaceholder")}
                  rows={5}
                  disabled={disabled}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </CardContent>
      </Card>
    </form>
  );
}
