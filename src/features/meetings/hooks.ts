import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteMeeting, listMeetings, listPublishedMeetings, saveMeeting } from "./service";

const keys = {
  all: ["meetings"] as const,
  published: ["meetings", "published"] as const,
  admin: ["meetings", "admin"] as const,
};

export const usePublishedMeetings = () => useQuery({ queryKey: keys.published, queryFn: listPublishedMeetings });

export const useMeetings = () => useQuery({ queryKey: keys.admin, queryFn: listMeetings });

function useInvalidateMeetings() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: keys.all });
    // Las tarjetas de estadísticas cuentan reuniones.
    void queryClient.invalidateQueries({ queryKey: ["stats"] });
  };
}

export function useSaveMeeting() {
  return useMutation({ mutationFn: saveMeeting, onSuccess: useInvalidateMeetings() });
}

export function useDeleteMeeting() {
  return useMutation({ mutationFn: deleteMeeting, onSuccess: useInvalidateMeetings() });
}
