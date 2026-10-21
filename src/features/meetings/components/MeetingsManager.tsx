import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";
import { EmptyState, ErrorState, FieldError, ListSkeleton } from "@/components/QueryState";
import { useNotify } from "@/hooks/useNotify";
import { IMAGE_ACCEPT, imageUrl } from "@/lib/storageImage";
import { useDeleteMeeting, useMeetings, useSaveMeeting } from "../hooks";
import { emptyMeeting, meetingSchema, toDateTimeInput, type MeetingFormValues } from "../schema";
import type { Meeting } from "../service";

const MeetingsManager = () => {
  const { data: meetings, isPending, isError, error, refetch } = useMeetings();
  const remove = useDeleteMeeting();
  const notify = useNotify();
  // null: formulario cerrado; "new": creando; un objeto: editando esa reunión.
  const [editing, setEditing] = useState<Meeting | "new" | null>(null);

  const handleDelete = async (m: Meeting) => {
    try {
      notify.success("Eliminado", await remove.mutateAsync(m));
      if (editing !== "new" && editing?.id === m.id) setEditing(null);
    } catch (err) {
      notify.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-foreground">Reuniones y Asesorías</h2>
        <Button onClick={() => setEditing("new")}>
          <Plus size={16} className="mr-1" /> Nueva
        </Button>
      </div>

      {editing && (
        <MeetingForm
          key={editing === "new" ? "new" : editing.id}
          meeting={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}

      {isPending ? (
        <ListSkeleton />
      ) : isError ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : meetings.length === 0 ? (
        <EmptyState icon={Calendar} title="No hay reuniones ni asesorías aún." hint='Haz clic en "Nueva" para crear la primera.' />
      ) : (
        <div className="space-y-3">
          {meetings.map((m) => (
            <div key={m.id} className="bg-card border border-border rounded-xl p-4 flex gap-4 items-start">
              {m.image_path && (
                <img src={imageUrl(m.image_path)} alt={m.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      m.type === "reunion"
                        ? "bg-[hsl(var(--blue-light))] text-[hsl(var(--blue))]"
                        : "bg-[hsl(var(--teal-light))] text-[hsl(var(--green))]"
                    }`}
                  >
                    {m.type === "reunion" ? "Reunión" : "Asesoría"}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      m.published ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {m.published ? "Publicado" : "Borrador"}
                  </span>
                </div>
                <h4 className="font-semibold text-foreground truncate">{m.title}</h4>
                {m.description && <p className="text-sm text-muted-foreground line-clamp-2">{m.description}</p>}
                {m.meeting_date && (
                  <p className="text-xs text-muted-foreground mt-1">
                    📅 {new Date(m.meeting_date).toLocaleDateString("es-CO", { dateStyle: "long" })}
                  </p>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => setEditing(m)} aria-label={`Editar ${m.title}`} title="Editar">
                  <Pencil size={14} />
                </Button>
                <ConfirmDeleteButton
                  itemLabel={`"${m.title}"`}
                  onConfirm={() => handleDelete(m)}
                  disabled={remove.isPending}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MeetingForm = ({ meeting, onClose }: { meeting: Meeting | null; onClose: () => void }) => {
  const save = useSaveMeeting();
  const notify = useNotify();
  const {
    register,
    control,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingSchema),
    defaultValues: meeting
      ? {
          title: meeting.title,
          description: meeting.description ?? "",
          meetingDate: toDateTimeInput(meeting.meeting_date),
          type: meeting.type === "asesoria" ? "asesoria" : "reunion",
          published: meeting.published,
          image: null,
        }
      : emptyMeeting,
  });

  const onSubmit = async (values: MeetingFormValues) => {
    try {
      const result = await save.mutateAsync({
        id: meeting?.id ?? null,
        values,
        previousImage: meeting?.image_path ?? null,
      });
      notify.success(meeting ? "Actualizado" : "Creado", result);
      onClose();
    } catch (err) {
      notify.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-card border border-border rounded-xl p-6 mb-6 space-y-4" noValidate>
      <h3 className="font-semibold text-foreground">{meeting ? "Editar" : "Crear nueva"} reunión / asesoría</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="meeting-title">Título</Label>
          <Input id="meeting-title" aria-invalid={!!errors.title} aria-describedby="meeting-title-error" {...register("title")} />
          <FieldError id="meeting-title-error" message={errors.title?.message} />
        </div>
        <div>
          <Label htmlFor="meeting-type">Tipo</Label>
          <select
            id="meeting-type"
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            aria-invalid={!!errors.type}
            aria-describedby="meeting-type-error"
            {...register("type")}
          >
            <option value="reunion">Reunión</option>
            <option value="asesoria">Asesoría</option>
          </select>
          <FieldError id="meeting-type-error" message={errors.type?.message} />
        </div>
        <div>
          <Label htmlFor="meeting-date">Fecha</Label>
          <Input
            id="meeting-date"
            type="datetime-local"
            aria-invalid={!!errors.meetingDate}
            aria-describedby="meeting-date-error"
            {...register("meetingDate")}
          />
          <FieldError id="meeting-date-error" message={errors.meetingDate?.message} />
        </div>
        <div>
          <Label htmlFor="meeting-image">Imagen</Label>
          <Controller
            control={control}
            name="image"
            render={({ field }) => (
              <Input
                id="meeting-image"
                type="file"
                accept={IMAGE_ACCEPT}
                aria-invalid={!!errors.image}
                aria-describedby="meeting-image-error"
                onBlur={field.onBlur}
                onChange={(e) => {
                  field.onChange(e.target.files?.[0] ?? null);
                  void trigger("image");
                }}
              />
            )}
          />
          <FieldError id="meeting-image-error" message={errors.image?.message} />
        </div>
      </div>
      <div>
        <Label htmlFor="meeting-description">Descripción</Label>
        <Textarea
          id="meeting-description"
          rows={3}
          aria-invalid={!!errors.description}
          aria-describedby="meeting-description-error"
          {...register("description")}
        />
        <FieldError id="meeting-description-error" message={errors.description?.message} />
      </div>
      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name="published"
          render={({ field }) => (
            <Switch id="meeting-published" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
        <Label htmlFor="meeting-published">Publicado (visible para clientes)</Label>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : meeting ? "Guardar cambios" : "Crear"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default MeetingsManager;
