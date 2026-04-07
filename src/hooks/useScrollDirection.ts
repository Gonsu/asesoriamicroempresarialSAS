import { useState, useEffect } from "react";

export function useScrollDirection() {
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    const container = document.getElementById("main-scroll-container");
    if (!container) return;

    const onScroll = () => {
      const y = container.scrollTop;
      if (y > lastY && y > 80) setHidden(true);
      else setHidden(false);
      setLastY(y);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [lastY]);

  return hidden;
}
