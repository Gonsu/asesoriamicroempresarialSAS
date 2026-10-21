import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, MessageSquareQuote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";
import { EmptyState, ErrorState, FieldError, ListSkeleton } from "@/components/QueryState";
import { useNotify } from "@/hooks/useNotify";
import { IMAGE_ACCEPT, imageUrl } from "@/lib/storageImage";
import { useDeleteTestimonial, useSaveTestimonial, useSetTestimonialPublished, useTestimonials } from "../hooks";
import { emptyTestimonial, testimonialSchema, type TestimonialFormValues } from "../schema";
import type { Testimonial } from "../service";

const TestimonialsManager = () => {
  const { data: items, isPending, isError, error, refetch } = useTestimonials();
  const remove = useDeleteTestimonial();
  const setPublished = useSetTestimonialPublished();
  const notify = useNotify();
  // null: formulario cerrado; "new": creando; un objeto: editando ese testimonio.
  const [editing, setEditing] = useState<Testimonial | "new" | null>(null);

  const handleDelete = async (t: Testimonial) => {
    try {
      notify.success("Eliminado", await remove.mutateAsync(t));
      if (editing !== "new" && editing?.id === t.id) setEditing(null);
    } catch (err) {
      notify.error(err);
    }
  };

  const togglePublish = async (t: Testimonial, isPublished: boolean) => {
    try {
      await setPublished.mutateAsync({ id: t.id, isPublished });
    } catch (err) {
      notify.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-foreground">Testimonios</h2>
        <Button onClick={() => setEditing("new")}>
          <Plus size={16} className="mr-1" /> Nuevo
        </Button>
      </div>

      {editing && (
        <TestimonialForm
          key={editing === "new" ? "new" : editing.id}
          testimonial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}

      {isPending ? (
        <ListSkeleton />
      ) : isError ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState icon={MessageSquareQuote} title="No hay testimonios aún." hint='Haz clic en "Nuevo" para crear el primero.' />
      ) : (
        <div className="space-y-3">
          {items.map((t) => {
            const toggling = setPublished.isPending && setPublished.variables?.id === t.id;
            return (
              <div key={t.id} className="bg-card border border-border rounded-xl p-4 flex gap-4 items-start">
                {t.image_path && (
                  <img src={imageUrl(t.image_path)} alt={t.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        t.is_published ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {t.is_published ? "Publicado" : "Borrador"}
                    </span>
                  </div>
                  <h4 className="font-semibold text-foreground">{t.name}</h4>
                  {t.business_type && <p className="text-xs text-muted-foreground">{t.business_type}</p>}
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">"{t.content}"</p>
                </div>
                <div className="flex gap-1 flex-shrink-0 items-center">
                  {/* Control propio, ya no un Switch dentro de un Button (botón anidado). */}
                  <div className="h-10 w-10 flex items-center justify-center">
                    <Switch
                      checked={t.is_published}
                      disabled={toggling}
                      onCheckedChange={(checked) => togglePublish(t, checked)}
                      aria-label={t.is_published ? `Despublicar el testimonio de ${t.name}` : `Publicar el testimonio de ${t.name}`}
                      title={t.is_published ? "Despublicar" : "Publicar"}
                      className="scale-75"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditing(t)}
                    aria-label={`Editar el testimonio de ${t.name}`}
                    title="Editar"
                  >
                    <Pencil size={14} />
                  </Button>
                  <ConfirmDeleteButton
                    itemLabel={`el testimonio de ${t.name}`}
                    onConfirm={() => handleDelete(t)}
                    disabled={remove.isPending}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const TestimonialForm = ({ testimonial, onClose }: { testimonial: Testimonial | null; onClose: () => void }) => {
  const save = useSaveTestimonial();
  const notify = useNotify();
  const {
    register,
    control,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: testimonial
      ? {
          name: testimonial.name,
          businessType: testimonial.business_type ?? "",
          content: testimonial.content,
          isPublished: testimonial.is_published,
          image: null,
        }
      : emptyTestimonial,
  });

  const onSubmit = async (values: TestimonialFormValues) => {
    try {
      const result = await save.mutateAsync({
        id: testimonial?.id ?? null,
        values,
        previousImage: testimonial?.image_path ?? null,
      });
      notify.success(testimonial ? "Actualizado" : "Creado", result);
      onClose();
    } catch (err) {
      notify.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-card border border-border rounded-xl p-6 mb-6 space-y-4" noValidate>
      <h3 className="font-semibold text-foreground">{testimonial ? "Editar" : "Crear"} testimonio</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="testimonial-name">Nombre</Label>
          <Input id="testimonial-name" aria-invalid={!!errors.name} aria-describedby="testimonial-name-error" {...register("name")} />
          <FieldError id="testimonial-name-error" message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="testimonial-business">Tipo de negocio</Label>
          <Input
            id="testimonial-business"
            placeholder="Ej: Tienda de ropa"
            aria-invalid={!!errors.businessType}
            aria-describedby="testimonial-business-error"
            {...register("businessType")}
          />
          <FieldError id="testimonial-business-error" message={errors.businessType?.message} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="testimonial-image">Imagen (opcional)</Label>
          <Controller
            control={control}
            name="image"
            render={({ field }) => (
              <Input
                id="testimonial-image"
                type="file"
                accept={IMAGE_ACCEPT}
                aria-invalid={!!errors.image}
                aria-describedby="testimonial-image-error"
                onBlur={field.onBlur}
                onChange={(e) => {
                  field.onChange(e.target.files?.[0] ?? null);
                  void trigger("image");
                }}
              />
            )}
          />
          <FieldError id="testimonial-image-error" message={errors.image?.message} />
        </div>
      </div>
      <div>
        <Label htmlFor="testimonial-content">Testimonio</Label>
        <Textarea
          id="testimonial-content"
          rows={3}
          aria-invalid={!!errors.content}
          aria-describedby="testimonial-content-error"
          {...register("content")}
        />
        <FieldError id="testimonial-content-error" message={errors.content?.message} />
      </div>
      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name="isPublished"
          render={({ field }) => (
            <Switch id="testimonial-published" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
        <Label htmlFor="testimonial-published">Publicado</Label>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : testimonial ? "Guardar cambios" : "Crear"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default TestimonialsManager;
