import { Mail, MailOpen, Inbox, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/QueryState";
import { useNotify } from "@/hooks/useNotify";
import { useContactMessages, useDeleteContactMessage, useSetContactMessageRead } from "../hooks";
import type { ContactMessage } from "../service";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" });

/** Mensajes del formulario de contacto. Todo se muestra como texto: React escapa el contenido. */
const ContactMessagesManager = () => {
  const { data: messages, isPending, isError, error, refetch } = useContactMessages();
  const setRead = useSetContactMessageRead();
  const remove = useDeleteContactMessage();
  const notify = useNotify();

  const toggleRead = async (m: ContactMessage) => {
    try {
      await setRead.mutateAsync({ id: m.id, isRead: !m.is_read });
    } catch (err) {
      notify.error(err);
    }
  };

  const handleDelete = async (m: ContactMessage) => {
    try {
      await remove.mutateAsync(m.id);
      notify.success("Eliminado");
    } catch (err) {
      notify.error(err);
    }
  };

  const unread = messages?.filter((m) => !m.is_read).length ?? 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-foreground">Mensajes de contacto</h2>
        {messages && <span className="text-sm text-muted-foreground">{unread} sin leer</span>}
      </div>

      {isPending ? (
        <ListSkeleton />
      ) : isError ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : messages.length === 0 ? (
        <EmptyState icon={Inbox} title="No hay mensajes aún." hint="Los mensajes del formulario de Contacto aparecerán aquí." />
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <article
              key={m.id}
              className={`bg-card border rounded-xl p-4 ${m.is_read ? "border-border" : "border-primary/40 shadow-sm"}`}
            >
              <div className="flex gap-4 items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {!m.is_read && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        Nuevo
                      </span>
                    )}
                    <h3 className="font-semibold text-foreground">{m.name}</h3>
                    <span className="text-xs text-muted-foreground">{formatDate(m.created_at)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 break-all">{m.email}</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap break-words">{m.message}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button asChild variant="ghost" size="icon" title="Responder por correo">
                    <a href={`mailto:${encodeURIComponent(m.email)}`} aria-label={`Responder a ${m.name}`}>
                      <Reply size={14} />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleRead(m)}
                    disabled={setRead.isPending && setRead.variables?.id === m.id}
                    aria-label={m.is_read ? `Marcar como no leído el mensaje de ${m.name}` : `Marcar como leído el mensaje de ${m.name}`}
                    title={m.is_read ? "Marcar como no leído" : "Marcar como leído"}
                  >
                    {m.is_read ? <Mail size={14} /> : <MailOpen size={14} />}
                  </Button>
                  <ConfirmDeleteButton
                    itemLabel={`el mensaje de ${m.name}`}
                    onConfirm={() => handleDelete(m)}
                    disabled={remove.isPending}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactMessagesManager;
