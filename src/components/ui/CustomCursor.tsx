"use client";

import React, { useEffect, useState, useRef } from "react";

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // DOM node references
  const dotRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable custom cursor on mobile/touch screens
    const isTouchDevice = 
      "ontouchstart" in window || 
      navigator.maxTouchPoints > 0 || 
      window.matchMedia("(pointer: coarse)").matches;

    if (isTouchDevice) {
      return;
    }

    // Show cursor when mouse starts moving
    setIsVisible(true);

    const onMouseMove = (e: MouseEvent) => {
      // Update both dot and circle position instantly to the exact same coordinates (no lag/lerp)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      if (circleRef.current) {
        circleRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);
    
    const onMouseLeaveDoc = () => setIsVisible(false);
    const onMouseEnterDoc = () => setIsVisible(true);

    // Event delegation for link/button hovers
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target && (
          target.tagName === "A" ||
          target.tagName === "BUTTON" ||
          target.closest("a") ||
          target.closest("button") ||
          target.closest('[role="button"]') ||
          target.style.cursor === "pointer"
        )
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    // Listeners
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseleave", onMouseLeaveDoc);
    document.addEventListener("mouseenter", onMouseEnterDoc);

    // Hide original browser cursor on body/interactive elements
    const styleNode = document.createElement("style");
    styleNode.innerHTML = `
      body, a, button, [role="button"], input, select, textarea {
        cursor: none !important;
      }
    `;
    document.head.appendChild(styleNode);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseleave", onMouseLeaveDoc);
      document.removeEventListener("mouseenter", onMouseEnterDoc);
      if (document.head.contains(styleNode)) {
        document.head.removeChild(styleNode);
      }
    };
  }, []);

  if (!isVisible) return null;

  // Render both elements with absolute positioning. Sizing & color transitions are handled inline.
  // The 'transform' property is purposely omitted from transition lists so it updates instantly.
  return (
    <>
      {/* Center Dot (Instantly centered under hardware pointer) */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-[#C9A14A] rounded-full pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2"
        style={{
          transform: "translate3d(-100px, -100px, 0)",
        }}
      />
      
      {/* Outer Circle (Concentric with dot at all times - no transform lag) */}
      <div
        ref={circleRef}
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2
          ${isHovered 
            ? "w-10 h-10 border border-[#C9A14A] bg-[#C9A14A]/10" 
            : isClicked 
              ? "w-6 h-6 border border-[#5C0E1D] bg-[#5C0E1D]/10" 
              : "w-8 h-8 border border-[#C9A14A]/80"
          }
        `}
        style={{
          transform: "translate3d(-100px, -100px, 0)",
          transition: "width 0.15s ease-out, height 0.15s ease-out, border-color 0.15s ease-out, background-color 0.15s ease-out"
        }}
      />
    </>
  );
}
