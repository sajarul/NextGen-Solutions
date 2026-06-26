"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface CursorState {
  x: number;
  y: number;
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest(
      "a, button, input, textarea, select, label, summary, [role='button'], .cursor-target"
    )
  );
}

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [position, setPosition] = useState<CursorState>({ x: -100, y: -100 });
  const [pressed, setPressed] = useState(false);
  const [hoveringInteractive, setHoveringInteractive] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const handleChange = () => {
      setEnabled(mq.matches);
      if (mq.matches) {
        document.body.classList.add("cursor-enabled");
      } else {
        document.body.classList.remove("cursor-enabled");
      }
    };

    handleChange();
    mq.addEventListener("change", handleChange);

    return () => {
      document.body.classList.remove("cursor-enabled");
      mq.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onOver = (event: MouseEvent) => setHoveringInteractive(isInteractiveTarget(event.target));
    const onLeaveWindow = (event: MouseEvent) => {
      if (event.relatedTarget !== null) {
        return;
      }
      setHoveringInteractive(false);
      setPosition({ x: -100, y: -100 });
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseout", onLeaveWindow);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onLeaveWindow);
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  const outerScale = hoveringInteractive ? 1.8 : pressed ? 0.9 : 1;
  const dotScale = pressed ? 0.7 : 1;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[120] h-10 w-10 rounded-full border border-brand-300/70 bg-brand-300/10"
        animate={{
          x: position.x - 20,
          y: position.y - 20,
          scale: outerScale,
          opacity: hoveringInteractive ? 0.95 : 0.72
        }}
        transition={{ type: "spring", stiffness: 360, damping: 28, mass: 0.25 }}
      />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[121] h-2.5 w-2.5 rounded-full bg-brand-300"
        animate={{
          x: position.x - 5,
          y: position.y - 5,
          scale: dotScale
        }}
        transition={{ type: "spring", stiffness: 600, damping: 30, mass: 0.1 }}
      />
    </>
  );
}
