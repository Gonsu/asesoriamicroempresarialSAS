import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const getVisitorId = () => {
  let id = localStorage.getItem("ame_visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("ame_visitor_id", id);
  }
  return id;
};

const PageViewTracker = () => {
  useEffect(() => {
    const track = async () => {
      await supabase.from("page_views").insert({
        page: window.location.pathname,
        visitor_id: getVisitorId(),
        user_agent: navigator.userAgent,
      });
    };
    track();
  }, []);

  return null;
};

export default PageViewTracker;
