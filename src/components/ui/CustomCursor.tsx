"use client";

import React, { useEffect, useState, useRef } from "react";

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // Position references
  const positionRef = useRef({ x: 0, y: 0 });
  const trailPositionRef = useRef({ x: 0, y: 0 });

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
      positionRef.current.x = e.clientX;
      positionRef.current.y = e.clientY;
      
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
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

    // Animation Loop for trailing circle
    let animationFrameId = 0;
    const updateTrail = () => {
      const targetX = positionRef.current.x;
      const targetY = positionRef.current.y;
      
      const currentX = trailPositionRef.current.x;
      const currentY = trailPositionRef.current.y;

      // Linear interpolation (lerp) for smooth trailing delay (0.15 damping factor)
      const dx = targetX - currentX;
      const dy = targetY - currentY;
      
      trailPositionRef.current.x += dx * 0.15;
      trailPositionRef.current.y += dy * 0.15;

      if (circleRef.current) {
        circleRef.current.style.transform = `translate3d(${trailPositionRef.current.x}px, ${trailPositionRef.current.y}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(updateTrail);
    };

    animationFrameId = requestAnimationFrame(updateTrail);

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
      cancelAnimationFrame(animationFrameId);
      if (document.head.contains(styleNode)) {
        document.head.removeChild(styleNode);
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Center Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-antique-gold rounded-full pointer-events-none z-9999 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 mix-blend-difference"
        style={{
          transform: "translate3d(-100px, -100px, 0)",
        }}
      />
      
      {/* Trailing Circle */}
      <div
        ref={circleRef}
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-9999 -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ease-out mix-blend-difference
          ${isHovered 
            ? "w-10 h-10 border border-antique-gold bg-antique-gold/10 scale-110" 
            : isClicked 
              ? "w-6 h-6 border-2 border-deep-maroon scale-95" 
              : "w-8 h-8 border border-antique-gold/80"
          }
        `}
        style={{
          transform: "translate3d(-100px, -100px, 0)",
        }}
      />
    </>
  );
}
