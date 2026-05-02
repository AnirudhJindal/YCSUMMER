"use client";
import { useEffect, useRef, useState } from "react";

/**
 * useParallax
 * Returns a translateY string to apply to a section's inner content.
 * @param speed  0 = no movement, 0.2 = subtle, 0.5 = strong. Default 0.2.
 */
export function useParallax(speed = 0.2) {
  const ref = useRef<HTMLElement | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2 - window.innerHeight / 2;
      setOffset(centerY * speed);
    };

    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // run once on mount
    return () => document.removeEventListener("scroll", onScroll);
  }, [speed]);

  return { ref, transform: `translateY(${offset}px)` };
}