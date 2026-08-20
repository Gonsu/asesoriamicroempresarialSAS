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

const sanitizePage = (path: string) => {
  const clean = path.replace(/[^A-Za-z0-9/_-]/g, "").slice(0, 128);
  return clean.startsWith("/") ? clean : `/${clean}`;
};

const PageViewTracker = () => {
  useEffect(() => {
    const track = async () => {
      await supabase.from("page_views").insert({
        page: sanitizePage(window.location.pathname),
        visitor_id: getVisitorId(),
        user_agent: navigator.userAgent.slice(0, 512),
      });
    };
    track();
  }, []);

  return null;
};

export default PageViewTracker;
