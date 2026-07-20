"use client";

import React, { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable custom cursor on touch/mobile devices
    const isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;

    if (isTouchDevice) {
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let currentX = -100;
    let currentY = -100;
    let animFrameId: number | null = null;
    let isVisible = false;

    // Passive listener for locked 60 FPS mouse coordinates capture
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        if (dotRef.current) dotRef.current.style.opacity = "1";
        if (circleRef.current) circleRef.current.style.opacity = "1";
      }
    };

    // requestAnimationFrame tick loop for 60 FPS smooth compositor rendering
    const renderLoop = () => {
      // Lerp for 60 FPS smooth follow
      currentX += (mouseX - currentX) * 0.75;
      currentY += (mouseY - currentY) * 0.75;

      const transformStr = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }
      if (circleRef.current) {
        circleRef.current.style.transform = transformStr;
      }

      animFrameId = requestAnimationFrame(renderLoop);
    };

    // Hover detection via direct DOM manipulation (no React re-renders)
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || !circleRef.current) return;

      const isInteractive =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest('[role="button"]') ||
        window.getComputedStyle(target).cursor === "pointer";

      if (isInteractive) {
        circleRef.current.classList.add("hovered");
      } else {
        circleRef.current.classList.remove("hovered");
      }
    };

    const onMouseDown = () => {
      if (circleRef.current) circleRef.current.classList.add("clicked");
    };

    const onMouseUp = () => {
      if (circleRef.current) circleRef.current.classList.remove("clicked");
    };

    const onMouseLeaveDoc = () => {
      isVisible = false;
      if (dotRef.current) dotRef.current.style.opacity = "0";
      if (circleRef.current) circleRef.current.style.opacity = "0";
    };

    const onMouseEnterDoc = () => {
      isVisible = true;
      if (dotRef.current) dotRef.current.style.opacity = "1";
      if (circleRef.current) circleRef.current.style.opacity = "1";
    };

    // Attach passive event listeners
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    window.addEventListener("mouseover", onMouseOver, { passive: true });
    document.addEventListener("mouseleave", onMouseLeaveDoc, { passive: true });
    document.addEventListener("mouseenter", onMouseEnterDoc, { passive: true });

    // Start 60 FPS animation loop
    animFrameId = requestAnimationFrame(renderLoop);

    // Hide native cursor
    const styleNode = document.createElement("style");
    styleNode.id = "custom-cursor-style";
    styleNode.innerHTML = `
      body, a, button, [role="button"], input, select, textarea {
        cursor: none !important;
      }
    `;
    document.head.appendChild(styleNode);

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseleave", onMouseLeaveDoc);
      document.removeEventListener("mouseenter", onMouseEnterDoc);
      const existingStyle = document.getElementById("custom-cursor-style");
      if (existingStyle && existingStyle.parentNode) {
        existingStyle.parentNode.removeChild(existingStyle);
      }
    };
  }, []);

  return (
    <>
      {/* Center Dot (GPU Hardware Accelerated) */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-[#C9A14A] rounded-full pointer-events-none z-[99999] opacity-0 transition-opacity duration-200"
        style={{
          willChange: "transform",
          transform: "translate3d(-100px, -100px, 0)",
        }}
      />

      {/* Outer Ring (GPU Compositor Layered, Smooth 60 FPS) */}
      <div
        ref={circleRef}
        className="custom-cursor-ring fixed top-0 left-0 w-8 h-8 border border-[#C9A14A]/80 rounded-full pointer-events-none z-[99999] opacity-0 transition-opacity duration-200"
        style={{
          willChange: "transform, width, height, background-color, border-color",
          transform: "translate3d(-100px, -100px, 0)",
          transition: "width 0.15s ease-out, height 0.15s ease-out, border-color 0.15s ease-out, background-color 0.15s ease-out",
        }}
      />
    </>
  );
}
