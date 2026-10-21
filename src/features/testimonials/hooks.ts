import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteTestimonial,
  listPublishedTestimonials,
  listTestimonials,
  saveTestimonial,
  setTestimonialPublished,
} from "./service";

const keys = {
  all: ["testimonials"] as const,
  published: ["testimonials", "published"] as const,
  admin: ["testimonials", "admin"] as const,
};

export const usePublishedTestimonials = () =>
  useQuery({ queryKey: keys.published, queryFn: listPublishedTestimonials });

export const useTestimonials = () => useQuery({ queryKey: keys.admin, queryFn: listTestimonials });

function useInvalidateTestimonials() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: keys.all });
}

export function useSaveTestimonial() {
  return useMutation({ mutationFn: saveTestimonial, onSuccess: useInvalidateTestimonials() });
}

export function useSetTestimonialPublished() {
  return useMutation({ mutationFn: setTestimonialPublished, onSuccess: useInvalidateTestimonials() });
}

export function useDeleteTestimonial() {
  return useMutation({ mutationFn: deleteTestimonial, onSuccess: useInvalidateTestimonials() });
}
