"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Info, Globe2, Trophy, Landmark } from "lucide-react";

// 1. Data configuration for export destinations
export interface Destination {
  name: string;
  lat: number;
  lng: number;
  label: string;
  details: string;
}

const ORIGIN_SURAT = { lat: 21.1702, lng: 72.8311, name: "Surat, Gujarat, India" };

const DESTINATIONS: Destination[] = [
  { name: "Mauritius", lat: -20.3484, lng: 57.5522, label: "East Africa Hub", details: "Premium silk and georgette bridal catalog exports." },
  { name: "South Africa", lat: -30.5595, lng: 22.9375, label: "Southern Africa Region", details: "Direct boutique distributions to Johannesburg & Cape Town." },
  { name: "UAE", lat: 23.4241, lng: 53.8478, label: "Middle East Gateway", details: "High-volume bridal couture supplying Dubai showrooms." },
  { name: "United Kingdom", lat: 55.3781, lng: -3.4360, label: "Western Europe Partner", details: "Custom handloom collections shipped to London boutiques." },
  { name: "New Zealand", lat: -40.9006, lng: 174.8860, label: "Pacific Retail Network", details: "Festive and sider lengha wear air-freighted weekly." },
  { name: "West Indies", lat: 13.1939, lng: -59.5432, label: "Caribbean Boutiques", details: "Exclusive traditional silk trail wear collections." },
  { name: "Sri Lanka", lat: 7.8731, lng: 80.7718, label: "South Asia Dist.", details: "Handloom fabrics and heavy embellished georgettes." },
  { name: "Bangladesh", lat: 23.6850, lng: 90.3563, label: "South Asia Partner", details: "Direct merchant partnerships supplying Dhaka hubs." },
  { name: "Fiji Islands", lat: -17.7134, lng: 178.0650, label: "Oceania Region", details: "Bespoke bridal lengha exports with express logistics." }
];

// Helper to convert Lat/Lng to 3D Cartesian coordinates on a unit sphere
function latLngToVector3(lat: number, lng: number): [number, number, number] {
  const phi = (lat * Math.PI) / 180;
  const theta = ((lng - 90) * Math.PI) / 180; // offset to align with front face projection
  return [
    Math.cos(phi) * Math.sin(theta),
    Math.sin(phi),
    Math.cos(phi) * Math.cos(theta)
  ];
}

// Great circle spherical linear interpolation (Slerp) helper
function slerp(
  v0: [number, number, number],
  v1: [number, number, number],
  t: number
): [number, number, number] {
  const dot = v0[0] * v1[0] + v0[1] * v1[1] + v0[2] * v1[2];
  const theta = Math.acos(Math.max(-1, Math.min(1, dot)));
  if (Math.abs(theta) < 0.001) {
    return [
      v0[0] + t * (v1[0] - v0[0]),
      v0[1] + t * (v1[1] - v0[1]),
      v0[2] + t * (v1[2] - v0[2])
    ];
  }
  const sinTheta = Math.sin(theta);
  const s0 = Math.sin((1 - t) * theta) / sinTheta;
  const s1 = Math.sin(t * theta) / sinTheta;
  return [
    s0 * v0[0] + s1 * v1[0],
    s0 * v0[1] + s1 * v1[1],
    s0 * v0[2] + s1 * v1[2]
  ];
}

export default function ExportGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Interaction State
  const [hoveredDest, setHoveredDest] = useState<Destination | null>(null);
  const [cardPos, setCardPos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  // Stats values
  const [boutiquesCount, setBoutiquesCount] = useState(0);
  const [countriesCount, setCountriesCount] = useState(0);
  const [heritageCount, setHeritageCount] = useState(0);

  // Globe orientation
  const rotationY = useRef(0);
  const rotationX = useRef(0.3); // Slight initial tilt down

  // Dragging and Momentum variables
  const isDragging = useRef(false);
  const prevMouseX = useRef(0);
  const prevMouseY = useRef(0);
  const dragVelocityX = useRef(0);
  const dragVelocityY = useRef(0);
  const lastActiveTime = useRef(Date.now());
  const autoRotateSpeed = 0.002;
  const targetRotationX = useRef(0.3);

  // Check if prefers-reduced-motion is active
  const isReducedMotion = useRef(false);

  // Generate background particle stars in 3D around the globe
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 60; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1.1 + Math.random() * 0.3; // Distance from center
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      arr.push({ x, y, z, size: Math.random() * 1.5 + 0.5, speed: Math.random() * 0.01 + 0.002, phase: Math.random() * Math.PI });
    }
    return arr;
  }, []);

  // Set up screen listener
  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    
    // Check reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    isReducedMotion.current = mediaQuery.matches;

    return () => window.removeEventListener("resize", checkSize);
  }, []);

  // Stats counting animation when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !statsAnimated) {
          setStatsAnimated(true);
          
          // Animate counters
          let startB = 0;
          const endB = 1700;
          const duration = 1500;
          const stepB = Math.ceil(endB / (duration / 16));
          const timerB = setInterval(() => {
            startB += stepB;
            if (startB >= endB) {
              setBoutiquesCount(endB);
              clearInterval(timerB);
            } else {
              setBoutiquesCount(startB);
            }
          }, 16);

          let startC = 0;
          const endC = 17;
          const timerC = setInterval(() => {
            startC += 1;
            if (startC >= endC) {
              setCountriesCount(endC);
              clearInterval(timerC);
            } else {
              setCountriesCount(startC);
            }
          }, duration / endC);

          let startH = 2026;
          const endH = 2011;
          const timerH = setInterval(() => {
            startH -= 1;
            if (startH <= endH) {
              setHeritageCount(endH);
              clearInterval(timerH);
            } else {
              setHeritageCount(startH);
            }
          }, duration / (2026 - 2011));
        }
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    return () => observer.disconnect();
  }, [statsAnimated]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;

    // Intersection observer to pause rendering when offscreen
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
      },
      { threshold: 0.05 }
    );
    visibilityObserver.observe(canvas);

    // Compute exact pixel radius based on canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Precalculate Surat origin coordinates on unit sphere
    const vOrigin = latLngToVector3(ORIGIN_SURAT.lat, ORIGIN_SURAT.lng);

    // Coordinate rotation logic
    // Rotates a point [x, y, z] by current rotationX and rotationY
    const rotateVector = (v: [number, number, number]): [number, number, number] => {
      const [x, y, z] = v;
      // Rotate around Y axis (longitude rotation)
      const cosY = Math.cos(rotationY.current);
      const sinY = Math.sin(rotationY.current);
      let rx = x * cosY - z * sinY;
      let rz = x * sinY + z * cosY;

      // Rotate around X axis (latitude tilt)
      const cosX = Math.cos(rotationX.current);
      const sinX = Math.sin(rotationX.current);
      const ry = y * cosX - rz * sinX;
      rz = y * sinX + rz * cosX;

      return [rx, ry, rz];
    };

    let time = 0;

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      time += 0.008;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const radius = Math.min(width, height) * 0.38;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // 1. Idle auto-rotation rotation updates (if not dragging)
      if (!isDragging.current) {
        if (!isReducedMotion.current) {
          const idleTime = Date.now() - lastActiveTime.current;
          if (idleTime > 3000) {
            // Smoothly drift tilt back to 0.3 if tilted extreme
            rotationX.current += (targetRotationX.current - rotationX.current) * 0.05;
            rotationY.current += autoRotateSpeed;
          }
        }
        // Apply friction to momentum
        rotationY.current += dragVelocityX.current;
        rotationX.current += dragVelocityY.current;
        dragVelocityX.current *= 0.95;
        dragVelocityY.current *= 0.95;

        // Constraint X axis tilt to avoid flipping upside down
        rotationX.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotationX.current));
      }

      // 2. Draw Soft Outer Atmospheric Glow around the globe border
      const glowGrad = ctx.createRadialGradient(centerX, centerY, radius * 0.95, centerX, centerY, radius * 1.15);
      glowGrad.addColorStop(0, "rgba(178, 149, 103, 0.15)"); // brand gold
      glowGrad.addColorStop(0.5, "rgba(107, 31, 42, 0.05)"); // brand maroon
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.25, 0, 2 * Math.PI);
      ctx.fill();

      // 3. Draw Ambient Sphere shading
      const sphereGrad = ctx.createRadialGradient(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        radius * 0.1,
        centerX,
        centerY,
        radius
      );
      sphereGrad.addColorStop(0, "#231B19"); // very dark warm grey
      sphereGrad.addColorStop(0.7, "#110D0C");
      sphereGrad.addColorStop(1, "#080605"); // near black at bounds
      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fill();

      // 4. Draw latitude & longitude grid lines (Meridians & Parallels)
      ctx.strokeStyle = "rgba(178, 149, 103, 0.1)"; // faint gold
      ctx.lineWidth = 0.5;

      const gridSegments = 60;
      // Draw parallels (latitude grid rings)
      for (let lat = -75; lat <= 75; lat += 15) {
        ctx.beginPath();
        let first = true;
        for (let lon = -180; lon <= 180; lon += 360 / gridSegments) {
          const v = latLngToVector3(lat, lon);
          const [rx, ry, rz] = rotateVector(v);
          if (rz > 0) { // facing front
            const cx = centerX + radius * rx;
            const cy = centerY - radius * ry;
            if (first) {
              ctx.moveTo(cx, cy);
              first = false;
            } else {
              ctx.lineTo(cx, cy);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      }

      // Draw meridians (longitude grid rings)
      for (let lon = -180; lon < 180; lon += 30) {
        ctx.beginPath();
        let first = true;
        for (let lat = -90; lat <= 90; lat += 180 / gridSegments) {
          const v = latLngToVector3(lat, lon);
          const [rx, ry, rz] = rotateVector(v);
          if (rz > 0) { // facing front
            const cx = centerX + radius * rx;
            const cy = centerY - radius * ry;
            if (first) {
              ctx.moveTo(cx, cy);
              first = false;
            } else {
              ctx.lineTo(cx, cy);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      }

      // 5. Draw 3D particle dust field orbiting the sphere
      particles.forEach((p) => {
        // Rotate particle vector
        const cosY = Math.cos(rotationY.current + p.speed * time);
        const sinY = Math.sin(rotationY.current + p.speed * time);
        let rx = p.x * cosY - p.z * sinY;
        let rz = p.x * sinY + p.z * cosY;

        const cosX = Math.cos(rotationX.current);
        const sinX = Math.sin(rotationX.current);
        const ry = p.y * cosX - rz * sinX;
        rz = p.y * sinX + rz * cosX;

        // Faint twinkle animation
        const alpha = (Math.sin(time * 2 + p.phase) + 1) * 0.25 + 0.15;
        ctx.fillStyle = `rgba(234, 223, 207, ${alpha})`; // ivory particle

        const cx = centerX + radius * rx;
        const cy = centerY - radius * ry;

        // Draw particle if depth is visible
        ctx.beginPath();
        ctx.arc(cx, cy, p.size, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Project Origin Surat to 2D coordinates
      const [oX, oY, oZ] = rotateVector(vOrigin);
      const originScreenX = centerX + radius * oX;
      const originScreenY = centerY - radius * oY;

      const destinationScreenPositions: { dest: Destination; x: number; y: number; z: number }[] = [];

      // 6. Draw export arcs & destinations
      DESTINATIONS.forEach((dest, idx) => {
        const vDest = latLngToVector3(dest.lat, dest.lng);
        const [dX, dY, dZ] = rotateVector(vDest);
        const destScreenX = centerX + radius * dX;
        const destScreenY = centerY - radius * dY;

        // Only keep projection coords for active hover-checking
        destinationScreenPositions.push({ dest, x: destScreenX, y: destScreenY, z: dZ });

        // A. DrawGreat Circle Arc with slerp interpolation
        const steps = 36;
        ctx.beginPath();
        let pathBegun = false;
        
        // Arc glowing pulse animation
        const speedMultiplier = 1;
        const pulseProgress = ((time * speedMultiplier + idx * 0.12) % 1.5) / 1.5;

        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const vInterp = slerp(vOrigin, vDest, t);
          const [ix, iy, iz] = rotateVector(vInterp);

          // We draw the arc. If it goes behind (iz < 0), draw it very faded, otherwise bright
          const alphaFactor = iz > 0 ? 0.6 : 0.12;
          
          // Animate route path lighting
          const distToPulse = Math.abs(t - pulseProgress);
          const isPulseRange = distToPulse < 0.1;
          const arcColor = isPulseRange && iz > 0
            ? `rgba(178, 149, 103, ${0.6 + (0.1 - distToPulse) * 4})` // glowing gold
            : `rgba(178, 149, 103, ${alphaFactor})`;

          ctx.strokeStyle = arcColor;
          ctx.lineWidth = isPulseRange && iz > 0 ? 1.5 : 0.8;

          const cx = centerX + radius * ix;
          const cy = centerY - radius * iy;

          if (i === 0) {
            ctx.moveTo(cx, cy);
            pathBegun = true;
          } else {
            // Draw segment by segment to dynamically change colors along path
            ctx.lineTo(cx, cy);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx, cy);
          }
        }

        // B. Draw Destination markers
        if (dZ > 0) {
          const isHovered = hoveredDest?.name === dest.name;
          const baseRadius = isHovered ? 4.5 : 2.5;

          // Pulse animation for destination marker
          const pulse = (Math.sin(time * 6 + idx) + 1) * 0.5; // fast pulse
          
          // Outer pulsing ring
          ctx.strokeStyle = isHovered ? "rgba(107, 31, 42, 0.8)" : "rgba(178, 149, 103, 0.5)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(destScreenX, destScreenY, baseRadius + pulse * 6, 0, 2 * Math.PI);
          ctx.stroke();

          // Inner solid core
          ctx.fillStyle = isHovered ? "#6B1F2A" : "#B29567"; // deep maroon on hover, gold default
          ctx.beginPath();
          ctx.arc(destScreenX, destScreenY, baseRadius, 0, 2 * Math.PI);
          ctx.fill();

          // Small white center core dot
          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.arc(destScreenX, destScreenY, 1, 0, 2 * Math.PI);
          ctx.fill();
        }
      });

      // 7. Draw Surat, India Origin Marker (Always stays in focus)
      if (oZ > 0) {
        const pulse = (Math.sin(time * 3) + 1) * 0.5; // slower gentle pulse
        
        // Large background breathing glow
        ctx.strokeStyle = "rgba(107, 31, 42, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(originScreenX, originScreenY, 5 + pulse * 8, 0, 2 * Math.PI);
        ctx.stroke();

        // Base ring
        ctx.strokeStyle = "#6B1F2A";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(originScreenX, originScreenY, 4, 0, 2 * Math.PI);
        ctx.stroke();

        // Inner solid core
        ctx.fillStyle = "#6B1F2A";
        ctx.beginPath();
        ctx.arc(originScreenX, originScreenY, 2.5, 0, 2 * Math.PI);
        ctx.fill();

        // Origin label
        ctx.fillStyle = "rgba(234, 223, 207, 0.9)"; // ivory text
        ctx.font = "bold 9px var(--font-inter), sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("SURAT (HQ)", originScreenX, originScreenY - 10);
      }

      // 8. Draw Border circle for neatness
      ctx.strokeStyle = "rgba(178, 149, 103, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.stroke();

      // Store canvas metrics for mousemove checks
      (canvas as any).destinations = destinationScreenPositions;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      visibilityObserver.disconnect();
    };
  }, [particles, hoveredDest]);

  // Handle Drag / Rotation mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    prevMouseX.current = e.clientX;
    prevMouseY.current = e.clientY;
    lastActiveTime.current = Date.now();
    dragVelocityX.current = 0;
    dragVelocityY.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Hover check for destinations
    const destinations = (canvas as any).destinations || [];
    let foundHover: Destination | null = null;
    
    for (const d of destinations) {
      if (d.z > 0) {
        const dx = x - d.x;
        const dy = y - d.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 10) { // Hover tolerance
          foundHover = d.dest;
          // Set floating card position
          setCardPos({ x: d.x, y: d.y - 12 });
          break;
        }
      }
    }

    if (foundHover !== hoveredDest) {
      setHoveredDest(foundHover);
    }

    if (!isDragging.current) return;

    const deltaX = e.clientX - prevMouseX.current;
    const deltaY = e.clientY - prevMouseY.current;

    rotationY.current += deltaX * 0.005;
    rotationX.current += deltaY * 0.005;

    // Save velocity for momentum
    dragVelocityX.current = deltaX * 0.0015;
    dragVelocityY.current = deltaY * 0.0015;

    prevMouseX.current = e.clientX;
    prevMouseY.current = e.clientY;
    lastActiveTime.current = Date.now();
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  // Keyboard navigation for accessibility (Arrow keys to rotate)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    lastActiveTime.current = Date.now();
    const rotateAmount = 0.05;
    if (e.key === "ArrowLeft") {
      rotationY.current -= rotateAmount;
    } else if (e.key === "ArrowRight") {
      rotationY.current += rotateAmount;
    } else if (e.key === "ArrowUp") {
      rotationX.current -= rotateAmount;
    } else if (e.key === "ArrowDown") {
      rotationX.current += rotateAmount;
    }
  };

  // Mobile Touch Support
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length !== 1) return;
    isDragging.current = true;
    prevMouseX.current = e.touches[0].clientX;
    prevMouseY.current = e.touches[0].clientY;
    lastActiveTime.current = Date.now();
    dragVelocityX.current = 0;
    dragVelocityY.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging.current || e.touches.length !== 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const deltaX = e.touches[0].clientX - prevMouseX.current;
    const deltaY = e.touches[0].clientY - prevMouseY.current;

    rotationY.current += deltaX * 0.005;
    rotationX.current += deltaY * 0.005;

    dragVelocityX.current = deltaX * 0.0015;
    dragVelocityY.current = deltaY * 0.0015;

    prevMouseX.current = e.touches[0].clientX;
    prevMouseY.current = e.touches[0].clientY;
    lastActiveTime.current = Date.now();

    // Tap/Click simulation for mobile hover checking
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    const destinations = (canvas as any).destinations || [];
    let foundHover: Destination | null = null;
    
    for (const d of destinations) {
      if (d.z > 0) {
        const dx = x - d.x;
        const dy = y - d.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 18) { // wider hit area on touch
          foundHover = d.dest;
          setCardPos({ x: d.x, y: d.y - 12 });
          break;
        }
      }
    }

    if (foundHover !== hoveredDest) {
      setHoveredDest(foundHover);
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  return (
    <section className="bg-ivory border-t border-[#EADFCF]/30 select-none font-body relative overflow-hidden">
      
      {/* Decorative grids */}
      <div className="absolute inset-0 bg-[radial-gradient(#EADFCF_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center">
        
        {/* Header Storytelling */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <span className="text-xs uppercase tracking-[0.3em] text-[#B29567] font-heading font-semibold mb-3 block">
            Global Footprint
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-light tracking-tight text-deep-maroon text-shadow-luxury">
            Our Global Export Network
          </h2>
          <p className="text-xs sm:text-sm text-warm-grey mt-4 font-light max-w-xl mx-auto leading-relaxed">
            From the textile capital of India, we proudly deliver premium ethnic fashion to trusted boutique partners across multiple international markets.
          </p>
        </div>

        {/* Globe Container Area */}
        <div 
          ref={containerRef}
          className="relative w-full aspect-square max-w-[500px] flex items-center justify-center cursor-grab active:cursor-grabbing outline-none"
        >
          {/* Floating Premium Hover/Tap Card */}
          {hoveredDest && (
            <div 
              style={{ 
                left: `${cardPos.x}px`, 
                top: `${cardPos.y}px`, 
                transform: "translate(-50%, -100%)" 
              }}
              className="absolute z-30 pointer-events-none bg-rich-charcoal/95 border border-antique-gold/25 p-4 w-60 shadow-[0_12px_24px_rgba(0,0,0,0.25)] rounded-none text-left animate-fade-in"
            >
              <span className="text-[8px] tracking-[0.25em] font-heading uppercase font-bold text-antique-gold block mb-1">
                {hoveredDest.label}
              </span>
              <h4 className="text-sm font-heading font-semibold text-warm-ivory uppercase tracking-wider mb-2">
                {hoveredDest.name}
              </h4>
              <p className="text-[10px] text-warm-cream/90 font-light font-body leading-relaxed border-t border-antique-gold/15 pt-2">
                {hoveredDest.details}
              </p>
              
              {/* Little arrow accent on B2B card bottom */}
              <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-rich-charcoal/95" />
            </div>
          )}

          {/* Core Interactive Canvas */}
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            aria-label="3D Interactive Export Globe. Use mouse or touch dragging to rotate, or arrow keys to tilt the globe."
            role="img"
            className="w-full h-full block focus-visible:outline-none"
          />

          {/* Drag signpost overlay */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1.5 text-[9px] font-heading tracking-widest text-warm-grey uppercase bg-pearl-white/40 backdrop-blur-sm border border-[#EADFCF]/30 px-3 py-1 rounded-full pointer-events-none">
            <Globe2 className="w-3.5 h-3.5 text-royal-maroon animate-spin-slow" />
            Drag Globe to Explore Routes
          </div>
        </div>

        {/* Live B2B Counters (Animate on entering viewport once) */}
        <div 
          ref={statsRef}
          className="w-full max-w-4xl mt-12 pt-12 border-t border-[#EADFCF]/50"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-antique-gold/15">
            <div className="flex flex-col items-center justify-center p-4">
              <div className="w-10 h-10 bg-royal-maroon/5 flex items-center justify-center border border-antique-gold/10 mb-3">
                <Trophy className="w-5 h-5 text-antique-gold" />
              </div>
              <span className="font-heading text-4xl sm:text-5xl font-light text-deep-maroon block mb-1">
                {statsAnimated ? `${boutiquesCount}+` : "0+"}
              </span>
              <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#B29567]">
                Boutique Partners
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-4">
              <div className="w-10 h-10 bg-royal-maroon/5 flex items-center justify-center border border-antique-gold/10 mb-3">
                <Globe2 className="w-5 h-5 text-antique-gold" />
              </div>
              <span className="font-heading text-4xl sm:text-5xl font-light text-deep-maroon block mb-1">
                {statsAnimated ? `${countriesCount}+` : "0+"}
              </span>
              <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#B29567]">
                Countries Served
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-4">
              <div className="w-10 h-10 bg-royal-maroon/5 flex items-center justify-center border border-antique-gold/10 mb-3">
                <Landmark className="w-5 h-5 text-antique-gold" />
              </div>
              <span className="font-heading text-4xl sm:text-5xl font-light text-deep-maroon block mb-1">
                {statsAnimated ? `Since ${heritageCount}` : "Since 2026"}
              </span>
              <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#B29567]">
                Surat direct since 2011
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
