"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Globe2, Trophy, Landmark } from "lucide-react";

// 1. Data configuration for export destinations
export interface Destination {
  name: string;
  lat: number;
  lng: number;
  label: string;
  details: string;
}

const ORIGIN_SURAT = { lat: 21.1702, lng: 72.8311, name: "Surat (HQ)" };

const DESTINATIONS: Destination[] = [
  { name: "Dubai", lat: 25.2048, lng: 55.2708, label: "UAE Gateway", details: "Direct boutique exports to Dubai showrooms." },
  { name: "London", lat: 51.5074, lng: -0.1278, label: "UK Hub", details: "Premium zardozi lengha supply to retail networks." },
  { name: "Singapore", lat: 1.3521, lng: 103.8198, label: "South East Asia", details: "Direct distribution to bridal styling boutiques." },
  { name: "Mauritius", lat: -20.3484, lng: 57.5522, label: "East Africa", details: "Custom bridal catalog exports." },
  { name: "South Africa", lat: -30.5595, lng: 22.9375, label: "Southern Africa", details: "Supply to showrooms in Johannesburg." },
  { name: "New Zealand", lat: -40.9006, lng: 174.8860, label: "Oceania Region", details: "Weekly express cargo deliveries." },
  { name: "Barbados", lat: 13.1939, lng: -59.5432, label: "West Indies", details: "Traditional silk trail collections." },
  { name: "Sri Lanka", lat: 7.8731, lng: 80.7718, label: "South Asia", details: "Handloom fabrics and heavy georgettes." },
  { name: "Bangladesh", lat: 23.6850, lng: 90.3563, label: "East Bengal Hub", details: "Direct merchant distributions." },
  { name: "Fiji", lat: -17.7134, lng: 178.0650, label: "Pacific Region", details: "Couture custom lengha exports." }
];

// Mathematical representation of continents to render a dotted map on the canvas sphere
const LAND_CENTERS = [
  { lat: 45, lng: -100, r: 35 }, // North America
  { lat: 60, lng: -110, r: 25 }, // Northern Canada
  { lat: -20, lng: -60, r: 22 }, // South America
  { lat: -5, lng: -60, r: 20 },  // Northern South America
  { lat: 5, lng: 20, r: 28 },    // Central Africa
  { lat: -20, lng: 22, r: 18 },   // Southern Africa
  { lat: 50, lng: 15, r: 18 },    // Europe
  { lat: 45, lng: 90, r: 38 },    // Northern Asia
  { lat: 30, lng: 75, r: 32 },    // Central/Southern Asia
  { lat: 60, lng: 100, r: 25 },   // Siberia
  { lat: 22, lng: 77, r: 14 },    // India
  { lat: -25, lng: 133, r: 18 },  // Australia
  { lat: 72, lng: -40, r: 14 },   // Greenland
];

function isLand(lat: number, lng: number): boolean {
  if (lat < -60) return true; // Antarctica
  for (const center of LAND_CENTERS) {
    const dLat = lat - center.lat;
    let dLng = lng - center.lng;
    if (dLng > 180) dLng -= 360;
    if (dLng < -180) dLng += 360;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < center.r) return true;
  }
  return false;
}

// Convert Lat/Lng to 3D Cartesian coordinates
function latLngToVector3(lat: number, lng: number): [number, number, number] {
  const phi = (lat * Math.PI) / 180;
  const theta = ((lng - 90) * Math.PI) / 180; // Offset to align with center projection
  return [
    Math.cos(phi) * Math.sin(theta),
    Math.sin(phi),
    Math.cos(phi) * Math.cos(theta)
  ];
}

// Great circle path interpolation (Slerp)
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredDest, setHoveredDest] = useState<Destination | null>(null);
  const [cardPos, setCardPos] = useState({ x: 0, y: 0 });
  const [statsAnimated, setStatsAnimated] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  // Stats values
  const [boutiquesCount, setBoutiquesCount] = useState(0);
  const [countriesCount, setCountriesCount] = useState(0);
  const [heritageCount, setHeritageCount] = useState(0);

  // Globe orientation (match tilt from screenshot)
  const rotationY = useRef(-0.5);
  const rotationX = useRef(0.2); // Slight natural tilt

  // Dragging and Momentum variables
  const isDragging = useRef(false);
  const prevMouseX = useRef(0);
  const prevMouseY = useRef(0);
  const dragVelocityX = useRef(0);
  const dragVelocityY = useRef(0);
  const lastActiveTime = useRef(Date.now());
  const autoRotateSpeed = 0.0015;

  // Pre-generate grid of world points to check for land/water once
  const globeDotGrid = useMemo(() => {
    const dots: { v: [number, number, number]; isLand: boolean }[] = [];
    const latStep = 3.5;
    const lngStep = 3.5;
    for (let lat = -80; lat <= 80; lat += latStep) {
      for (let lng = -180; lng <= 180; lng += lngStep) {
        dots.push({
          v: latLngToVector3(lat, lng),
          isLand: isLand(lat, lng)
        });
      }
    }
    return dots;
  }, []);

  // Intersection observer trigger for stats animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !statsAnimated) {
          setStatsAnimated(true);
          
          let startB = 0;
          const endB = 1700;
          const duration = 1200;
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

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
      },
      { threshold: 0.05 }
    );
    visibilityObserver.observe(canvas);

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const vOrigin = latLngToVector3(ORIGIN_SURAT.lat, ORIGIN_SURAT.lng);

    const rotateVector = (v: [number, number, number]): [number, number, number] => {
      const [x, y, z] = v;
      const cosY = Math.cos(rotationY.current);
      const sinY = Math.sin(rotationY.current);
      let rx = x * cosY - z * sinY;
      let rz = x * sinY + z * cosY;

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
      const radius = Math.min(width, height) * 0.40;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Auto rotation updates
      if (!isDragging.current) {
        const idleTime = Date.now() - lastActiveTime.current;
        if (idleTime > 3000) {
          rotationY.current += autoRotateSpeed;
        }
        rotationY.current += dragVelocityX.current;
        rotationX.current += dragVelocityY.current;
        dragVelocityX.current *= 0.95;
        dragVelocityY.current *= 0.95;
        rotationX.current = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, rotationX.current));
      }

      // Draw subtle atmospheric background glow for the sphere
      const atmosGrad = ctx.createRadialGradient(centerX, centerY, radius * 0.9, centerX, centerY, radius * 1.05);
      atmosGrad.addColorStop(0, "rgba(234, 223, 207, 0.08)"); // warm ivory glow
      atmosGrad.addColorStop(0.8, "rgba(178, 149, 103, 0.03)"); // gold glow
      atmosGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = atmosGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.15, 0, 2 * Math.PI);
      ctx.fill();

      // Draw base dark golden-ivory sphere shadow
      ctx.fillStyle = "rgba(253, 249, 243, 0.45)"; // very soft ivory backing
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Draw thin latitude/longitude line circles (grid outline)
      ctx.strokeStyle = "rgba(178, 149, 103, 0.12)"; // light antique gold grid
      ctx.lineWidth = 0.5;
      
      // Draw grid ring segments
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let first = true;
        for (let lon = -180; lon <= 180; lon += 10) {
          const v = latLngToVector3(lat, lon);
          const [rx, ry, rz] = rotateVector(v);
          if (rz > 0) {
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

      // Draw Dotted Landmass (Continent shapes) matching Shiveshwar screenshot style
      // We render only dots that are landmasses to give the dotted globe outline
      globeDotGrid.forEach((dot) => {
        const [rx, ry, rz] = rotateVector(dot.v);
        if (rz > 0) { // facing camera
          const cx = centerX + radius * rx;
          const cy = centerY - radius * ry;

          if (dot.isLand) {
            // Draw land dot
            ctx.fillStyle = "rgba(178, 149, 103, 0.65)"; // premium gold dots
            ctx.beginPath();
            ctx.arc(cx, cy, 1.2, 0, 2 * Math.PI);
            ctx.fill();
          } else {
            // Very faint water dot (for matrix aesthetic)
            ctx.fillStyle = "rgba(178, 149, 103, 0.08)";
            ctx.beginPath();
            ctx.arc(cx, cy, 0.6, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
      });

      // Project Origin Surat
      const [oX, oY, oZ] = rotateVector(vOrigin);
      const originScreenX = centerX + radius * oX;
      const originScreenY = centerY - radius * oY;

      const destinationScreenPositions: { dest: Destination; x: number; y: number; z: number }[] = [];

      // Draw Export Arcs & Destination Dots
      DESTINATIONS.forEach((dest, idx) => {
        const vDest = latLngToVector3(dest.lat, dest.lng);
        const [dX, dY, dZ] = rotateVector(vDest);
        const destScreenX = centerX + radius * dX;
        const destScreenY = centerY - radius * dY;

        destinationScreenPositions.push({ dest, x: destScreenX, y: destScreenY, z: dZ });

        // Draw Great Circle Arc (Maroon/Gold blend)
        const steps = 30;
        ctx.beginPath();
        let first = true;
        const pulseProgress = ((time * 0.8 + idx * 0.15) % 1.5) / 1.5;

        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const vInterp = slerp(vOrigin, vDest, t);
          const [ix, iy, iz] = rotateVector(vInterp);

          const cx = centerX + radius * ix;
          const cy = centerY - radius * iy;

          const distToPulse = Math.abs(t - pulseProgress);
          const isPulseRange = distToPulse < 0.1;
          
          const alpha = iz > 0 ? (isPulseRange ? 0.8 : 0.28) : 0.05;
          ctx.strokeStyle = isPulseRange && iz > 0 
            ? `rgba(107, 31, 42, ${alpha})` // bright royal maroon
            : `rgba(178, 149, 103, ${alpha})`; // gold base arc

          ctx.lineWidth = isPulseRange && iz > 0 ? 1.2 : 0.6;

          if (first) {
            ctx.moveTo(cx, cy);
            first = false;
          } else {
            ctx.lineTo(cx, cy);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx, cy);
          }
        }

        // Draw Destination Markers & Labels (Connect leader line to text label)
        if (dZ > 0) {
          const isHovered = hoveredDest?.name === dest.name;
          const size = isHovered ? 4.5 : 2.5;

          // Fast pulse ring
          const pulse = (Math.sin(time * 5 + idx) + 1) * 0.5;
          ctx.strokeStyle = isHovered ? "rgba(107, 31, 42, 0.7)" : "rgba(178, 149, 103, 0.4)";
          ctx.beginPath();
          ctx.arc(destScreenX, destScreenY, size + pulse * 5, 0, 2 * Math.PI);
          ctx.stroke();

          // Dot center
          ctx.fillStyle = isHovered ? "#6B1F2A" : "#B29567";
          ctx.beginPath();
          ctx.arc(destScreenX, destScreenY, size, 0, 2 * Math.PI);
          ctx.fill();

          // Draw leader line and country text label (matching Shiveshwar styling)
          // Draw leader lines and labels for top 5 key routes if not hovered, or display on hover
          const showAlways = ["Dubai", "London", "Singapore", "Mauritius"].includes(dest.name);
          if (showAlways || isHovered) {
            ctx.fillStyle = isHovered ? "#6B1F2A" : "rgba(35, 27, 25, 0.8)";
            ctx.font = isHovered 
              ? "bold 10px var(--font-inter), sans-serif" 
              : "500 9px var(--font-inter), sans-serif";
            ctx.textAlign = destScreenX > centerX ? "left" : "right";
            
            // Text offset positioning
            const textOffset = destScreenX > centerX ? 12 : -12;
            ctx.fillText(dest.name, destScreenX + textOffset, destScreenY + 3);

            // Small horizontal tick line
            ctx.strokeStyle = "rgba(178, 149, 103, 0.35)";
            ctx.beginPath();
            ctx.moveTo(destScreenX, destScreenY);
            ctx.lineTo(destScreenX + (destScreenX > centerX ? 8 : -8), destScreenY);
            ctx.stroke();
          }
        }
      });

      // Draw Surat Origin Beacon
      if (oZ > 0) {
        const pulse = (Math.sin(time * 3) + 1) * 0.5;
        
        // Large outer pulsing circle
        ctx.strokeStyle = "rgba(107, 31, 42, 0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(originScreenX, originScreenY, 6 + pulse * 7, 0, 2 * Math.PI);
        ctx.stroke();

        // Inner solid ring
        ctx.strokeStyle = "#6B1F2A";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(originScreenX, originScreenY, 4.5, 0, 2 * Math.PI);
        ctx.stroke();

        // Solid center core
        ctx.fillStyle = "#6B1F2A";
        ctx.beginPath();
        ctx.arc(originScreenX, originScreenY, 2.5, 0, 2 * Math.PI);
        ctx.fill();

        // White core dot
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(originScreenX, originScreenY, 1, 0, 2 * Math.PI);
        ctx.fill();

        // Surat HQ text label
        ctx.fillStyle = "#231B19";
        ctx.font = "bold 10px var(--font-inter), sans-serif";
        ctx.textAlign = "center";
        // background backing for label readability
        ctx.fillStyle = "rgba(253, 249, 243, 0.85)";
        ctx.fillRect(originScreenX - 25, originScreenY - 22, 50, 12);
        ctx.fillStyle = "#6B1F2A";
        ctx.fillText("Surat (HQ)", originScreenX, originScreenY - 13);
      }

      // Draw outer circle accent
      ctx.strokeStyle = "rgba(178, 149, 103, 0.22)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.stroke();

      // Store canvas metrics for hover tracking
      (canvas as any).destinations = destinationScreenPositions;

      // Draw technical overlay text labels matching the Shiveshwar screenshot
      ctx.fillStyle = "rgba(178, 149, 103, 0.4)";
      ctx.font = "500 7px var(--font-inter), sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("SYSTEM: CANVAS_3D_ACTIVE", centerX - radius * 0.95, centerY - radius * 1.05);
      ctx.textAlign = "right";
      ctx.fillText("AXIS: TILTED_23.5", centerX + radius * 0.95, centerY - radius * 1.05);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      visibilityObserver.disconnect();
    };
  }, [globeDotGrid, hoveredDest]);

  // Drag and Rotation mouse handlers
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

    const destinations = (canvas as any).destinations || [];
    let foundHover: Destination | null = null;
    
    for (const d of destinations) {
      if (d.z > 0) {
        const dx = x - d.x;
        const dy = y - d.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 12) {
          foundHover = d.dest;
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

    dragVelocityX.current = deltaX * 0.0015;
    dragVelocityY.current = deltaY * 0.0015;

    prevMouseX.current = e.clientX;
    prevMouseY.current = e.clientY;
    lastActiveTime.current = Date.now();
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  // Keyboard rotation support
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
        if (dist < 20) {
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
      
      {/* Editorial subtle grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#EADFCF_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        
        {/* Two Column Layout matching screenshot's design structure */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Typography Storytelling */}
          <div className="lg:col-span-5 text-left space-y-6">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-[#B29567] font-heading font-semibold block">
              Global Textile Network
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-light tracking-tight text-deep-maroon leading-tight">
              Connecting Surat<br />
              <span className="italic font-normal text-[#B29567]">to the World.</span>
            </h2>
            <div className="w-12 h-[1px] bg-antique-gold" />
            <p className="text-xs sm:text-sm text-charcoal/80 font-light leading-relaxed max-w-md">
              From the historical textile capital of India, our wholesale manufacturing lines feed international B2B distribution channels, supplying custom-woven bridal silks, heavy zardozi lenghas, and designer ethnic couture to elite boutique partners worldwide.
            </p>
          </div>

          {/* Right Column: Globe Visualization */}
          <div className="lg:col-span-7 flex justify-center items-center relative">
            <div className="relative w-full aspect-square max-w-[540px] flex items-center justify-center cursor-grab active:cursor-grabbing outline-none">
              
              {/* Floating Premium Hover Card */}
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
                  
                  {/* Decorative pointer arrow */}
                  <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-rich-charcoal/95" />
                </div>
              )}

              {/* Dotted Interactive Canvas Globe */}
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
                aria-label="3D Interactive Export Globe. Dotted land outlines connect Surat HQ to international B2B partners."
                role="img"
                className="w-full h-full block focus-visible:outline-none"
              />

              {/* Drag instruction overlay */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1.5 text-[8px] font-heading tracking-widest text-warm-grey uppercase bg-pearl-white/40 backdrop-blur-sm border border-[#EADFCF]/30 px-3 py-1 rounded-full pointer-events-none">
                <Globe2 className="w-3 h-3 text-royal-maroon animate-spin-slow" />
                Drag to Rotate Globe
              </div>
            </div>
          </div>
        </div>

        {/* Live B2B Counters Section */}
        <div 
          ref={statsRef}
          className="w-full max-w-4xl mt-16 pt-12 border-t border-[#EADFCF]/50"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-antique-gold/15">
            <div className="flex flex-col items-center justify-center p-4">
              <span className="font-heading text-4xl sm:text-5xl font-light text-deep-maroon block mb-1">
                {statsAnimated ? `${boutiquesCount}+` : "0+"}
              </span>
              <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#B29567]">
                Boutique Partners
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-4">
              <span className="font-heading text-4xl sm:text-5xl font-light text-deep-maroon block mb-1">
                {statsAnimated ? `${countriesCount}+` : "0+"}
              </span>
              <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#B29567]">
                Countries Served
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-4">
              <span className="font-heading text-4xl sm:text-5xl font-light text-deep-maroon block mb-1">
                {statsAnimated ? `Since ${heritageCount}` : "Since 2026"}
              </span>
              <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-[#B29567]">
                Established in Surat
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
