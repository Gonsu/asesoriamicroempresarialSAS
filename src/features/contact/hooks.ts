import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ContactFormValues } from "./schema";
import { deleteContactMessage, listContactMessages, sendContactMessage, setContactMessageRead } from "./service";

const messagesKey = ["contact_messages"] as const;

export function useSendContactMessage() {
  return useMutation({
    mutationFn: ({ values, token }: { values: ContactFormValues; token: string }) => sendContactMessage(values, token),
  });
}

export const useContactMessages = () => useQuery({ queryKey: messagesKey, queryFn: listContactMessages });

function useInvalidateMessages() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: messagesKey });
}

export function useSetContactMessageRead() {
  return useMutation({ mutationFn: setContactMessageRead, onSuccess: useInvalidateMessages() });
}

export function useDeleteContactMessage() {
  return useMutation({ mutationFn: deleteContactMessage, onSuccess: useInvalidateMessages() });
}
