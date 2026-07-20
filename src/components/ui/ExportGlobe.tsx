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
  { name: "London", lat: 51.5074, lng: -0.1278, label: "UK Hub", details: "Premium zardozi lehenga supply to retail networks." },
  { name: "Singapore", lat: 1.3521, lng: 103.8198, label: "South East Asia", details: "Direct distribution to bridal styling boutiques." },
  { name: "Mauritius", lat: -20.3484, lng: 57.5522, label: "East Africa", details: "Custom bridal catalog exports." },
  { name: "South Africa", lat: -30.5595, lng: 22.9375, label: "Southern Africa", details: "Supply to showrooms in Johannesburg." },
  { name: "New Zealand", lat: -40.9006, lng: 174.8860, label: "Oceania Region", details: "Weekly express cargo deliveries." },
  { name: "Barbados", lat: 13.1939, lng: -59.5432, label: "West Indies", details: "Traditional silk trail collections." },
  { name: "Sri Lanka", lat: 7.8731, lng: 80.7718, label: "South Asia", details: "Handloom fabrics and heavy georgettes." },
  { name: "Bangladesh", lat: 23.6850, lng: 90.3563, label: "East Bengal Hub", details: "Direct merchant distributions." },
  { name: "Fiji", lat: -17.7134, lng: 178.0650, label: "Pacific Region", details: "Couture custom lehenga exports." }
];

const EXPORT_COUNTRY_CODES = [
  "IND", "ARE", "GBR", "SGP", "MUS", "ZAF", "NZL", "BRB", "LKA", "BGD", "FJI"
];

// Country Data — ISO numeric → [ISO3, name]
const CD: { [key: string]: [string, string] } = {
  "004": ["AFG", "Afghanistan"],
  "008": ["ALB", "Albania"],
  "012": ["DZA", "Algeria"],
  "024": ["AGO", "Angola"],
  "032": ["ARG", "Argentina"],
  "036": ["AUS", "Australia"],
  "040": ["AUT", "Austria"],
  "031": ["AZE", "Azerbaijan"],
  "050": ["BGD", "Bangladesh"],
  "056": ["BEL", "Belgium"],
  "204": ["BEN", "Benin"],
  "064": ["BTN", "Bhutan"],
  "068": ["BOL", "Bolivia"],
  "070": ["BIH", "Bosnia and Herz."],
  "072": ["BWA", "Botswana"],
  "076": ["BRA", "Brazil"],
  "096": ["BRN", "Brunei"],
  "100": ["BGR", "Bulgaria"],
  "854": ["BFA", "Burkina Faso"],
  "108": ["BDI", "Burundi"],
  "116": ["KHM", "Cambodia"],
  "120": ["CMR", "Cameroon"],
  "124": ["CAN", "Canada"],
  "140": ["CAF", "Central African Rep."],
  "148": ["TCD", "Chad"],
  "152": ["CHL", "Chile"],
  "156": ["CHN", "China"],
  "170": ["COL", "Colombia"],
  "178": ["COG", "Congo"],
  "180": ["COD", "Dem. Rep. Congo"],
  "188": ["CRI", "Costa Rica"],
  "384": ["CIV", "Côte d'Ivoire"],
  "191": ["HRV", "Croatia"],
  "192": ["CUB", "Cuba"],
  "196": ["CYP", "Cyprus"],
  "203": ["CZE", "Czechia"],
  "208": ["DNK", "Denmark"],
  "262": ["DJI", "Djibouti"],
  "214": ["DOM", "Dominican Rep."],
  "218": ["ECU", "Ecuador"],
  "818": ["EGY", "Egypt"],
  "222": ["SLV", "El Salvador"],
  "226": ["GNQ", "Eq. Guinea"],
  "232": ["ERI", "Eritrea"],
  "233": ["EST", "Estonia"],
  "748": ["SWZ", "Eswatini"],
  "231": ["ETH", "Ethiopia"],
  "242": ["FJI", "Fiji"],
  "246": ["FIN", "Finland"],
  "250": ["FRA", "France"],
  "266": ["GAB", "Gabon"],
  "270": ["GMB", "Gambia"],
  "268": ["GEO", "Georgia"],
  "276": ["DEU", "Germany"],
  "288": ["GHA", "Ghana"],
  "300": ["GRC", "Greece"],
  "304": ["GRL", "Greenland"],
  "320": ["GTM", "Guatemala"],
  "324": ["GIN", "Guinea"],
  "624": ["GNB", "Guinea-Bissau"],
  "328": ["GUY", "Guyana"],
  "332": ["HTI", "Haiti"],
  "340": ["HND", "Honduras"],
  "348": ["HUN", "Hungary"],
  "352": ["ISL", "Iceland"],
  "356": ["IND", "India"],
  "360": ["IDN", "Indonesia"],
  "364": ["IRN", "Iran"],
  "368": ["IRQ", "Iraq"],
  "372": ["IRL", "Ireland"],
  "376": ["ISR", "Israel"],
  "380": ["ITA", "Italy"],
  "388": ["JAM", "Jamaica"],
  "392": ["JPN", "Japan"],
  "400": ["JOR", "Jordan"],
  "398": ["KAZ", "Kazakhstan"],
  "404": ["KEN", "Kenya"],
  "408": ["PRK", "North Korea"],
  "410": ["KOR", "South Korea"],
  "414": ["KWT", "Kuwait"],
  "417": ["KGZ", "Kyrgyzstan"],
  "418": ["LAO", "Laos"],
  "428": ["LVA", "Latvia"],
  "422": ["LBN", "Lebanon"],
  "426": ["LSO", "Lesotho"],
  "430": ["LBR", "Liberia"],
  "434": ["LBY", "Libya"],
  "440": ["LTU", "Lithuania"],
  "442": ["LUX", "Luxembourg"],
  "450": ["MDG", "Madagascar"],
  "454": ["MWI", "Malawi"],
  "458": ["MYS", "Malaysia"],
  "466": ["MLI", "Mali"],
  "478": ["MRT", "Mauritania"],
  "484": ["MEX", "Mexico"],
  "498": ["MDA", "Moldova"],
  "496": ["MNG", "Mongolia"],
  "499": ["MNE", "Montenegro"],
  "504": ["MAR", "Morocco"],
  "508": ["MOZ", "Mozambique"],
  "104": ["MMR", "Myanmar"],
  "516": ["NAM", "Namibia"],
  "524": ["NPL", "Nepal"],
  "528": ["NLD", "Netherlands"],
  "554": ["NZL", "New Zealand"],
  "558": ["NIC", "Nicaragua"],
  "562": ["NER", "Niger"],
  "566": ["NGA", "Nigeria"],
  "578": ["NOR", "Norway"],
  "512": ["OMN", "Oman"],
  "586": ["PAK", "Pakistan"],
  "591": ["PAN", "Panama"],
  "598": ["PNG", "Papua New Guinea"],
  "600": ["PRY", "Paraguay"],
  "604": ["PER", "Peru"],
  "608": ["PHL", "Philippines"],
  "616": ["POL", "Poland"],
  "620": ["PRT", "Portugal"],
  "634": ["QAT", "Qatar"],
  "642": ["ROU", "Romania"],
  "643": ["RUS", "Russia"],
  "646": ["RWA", "Rwanda"],
  "682": ["SAU", "Saudi Arabia"],
  "686": ["SEN", "Senegal"],
  "688": ["SRB", "Serbia"],
  "694": ["SLE", "Sierra Leone"],
  "702": ["SGP", "Singapore"],
  "703": ["SVK", "Slovakia"],
  "705": ["SVN", "Slowenia"],
  "706": ["SOM", "Somalia"],
  "710": ["ZAF", "South Africa"],
  "728": ["SSD", "South Sudan"],
  "724": ["ESP", "Spain"],
  "144": ["LKA", "Sri Lanka"],
  "729": ["SDN", "Sudan"],
  "740": ["SUR", "Suriname"],
  "752": ["SWE", "Sweden"],
  "756": ["CHE", "Switzerland"],
  "760": ["SYR", "Syria"],
  "158": ["TWN", "Taiwan"],
  "762": ["TJK", "Tajikistan"],
  "834": ["TZA", "Tanzania"],
  "764": ["THA", "Thailand"],
  "626": ["TLS", "Timor-Leste"],
  "768": ["TGO", "Togo"],
  "780": ["TTO", "Trinidad and Tobago"],
  "788": ["TUN", "Tunisia"],
  "792": ["TUR", "Turkey"],
  "795": ["TKM", "Turkmenistan"],
  "800": ["UGA", "Uganda"],
  "804": ["UKR", "Ukraine"],
  "784": ["ARE", "UAE"],
  "826": ["GBR", "United Kingdom"],
  "840": ["USA", "United States"],
  "858": ["URY", "Uruguay"],
  "860": ["UZB", "Uzbekistan"],
  "862": ["VEN", "Venezuela"],
  "704": ["VNM", "Vietnam"],
  "887": ["YEM", "Yemen"],
  "894": ["ZMB", "Zambia"],
  "716": ["ZWE", "Zimbabwe"],
  "275": ["PSE", "Palestine"],
  "807": ["MKD", "North Macedonia"],
  "051": ["ARM", "Armenia"],
  "112": ["BLR", "Belarus"],
  "174": ["COM", "Comoros"],
  "084": ["BLZ", "Belize"],
  "090": ["SLB", "Solomon Islands"],
  "540": ["NCL", "New Caledonia"],
  "548": ["VUT", "Vanuatu"],
  "010": ["ATA", "Antarctica"],
  "-99": ["XKX", "Kosovo"]
};

/* ========================================================================== */
/* 3D Sphere Math */
/* ========================================================================== */
const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

interface ProjectedPoint {
  sx: number;
  sy: number;
  rx: number;
  ry: number;
  rz: number;
  v: boolean;
}

function project(
  lng: number,
  lat: number,
  lambda: number,
  phi: number,
  gamma: number,
  R: number,
  cx: number,
  cy: number
): ProjectedPoint {
  const lr = (lng - lambda) * D2R;
  const la = lat * D2R;
  const cl = Math.cos(la);
  // Unrotated unit-sphere position (post-Z-rotation by lambda)
  const x0 = cl * Math.cos(lr);
  const y0 = cl * Math.sin(lr);
  const z0 = Math.sin(la);
  // Rotate around Y by phi (tilts north pole forward)
  const cp = Math.cos(phi * D2R);
  const sp = Math.sin(phi * D2R);
  const x1 = x0 * cp + z0 * sp;
  const y1 = y0;
  const z1 = -x0 * sp + z0 * cp;
  // Rotate around X by gamma (rolls around the viewer-facing axis)
  const cg = Math.cos(gamma * D2R);
  const sg = Math.sin(gamma * D2R);
  const rx = x1;
  const ry = y1 * cg - z1 * sg;
  const rz = y1 * sg + z1 * cg;
  return { sx: cx + R * ry, sy: cy - R * rz, rx, ry, rz, v: rx >= 0 };
}

function unproject(
  px: number,
  py: number,
  lambda: number,
  phi: number,
  gamma: number,
  R: number,
  cx: number,
  cy: number
): { lng: number; lat: number } | null {
  const Ry = (px - cx) / R;
  const Rz = -(py - cy) / R;
  const r2 = Ry * Ry + Rz * Rz;
  if (r2 > 1) return null;
  const cg = Math.cos(gamma * D2R);
  const sg = Math.sin(gamma * D2R);
  const y1 = Ry * cg + Rz * sg;
  const z1 = -Ry * sg + Rz * cg;
  const x1 = Math.sqrt(Math.max(0, 1 - r2));
  const cp = Math.cos(phi * D2R);
  const sp = Math.sin(phi * D2R);
  const x0 = x1 * cp - z1 * sp;
  const y0 = y1;
  const z0 = x1 * sp + z1 * cp;
  const lat = Math.asin(clamp(z0, -1, 1)) * R2D;
  let lng = Math.atan2(y0, x0) * R2D + lambda;
  lng = ((lng + 180) % 360 + 360) % 360 - 180;
  return { lng, lat };
}

function limbIntersect(
  a: ProjectedPoint,
  b: ProjectedPoint,
  R: number,
  cx: number,
  cy: number
): ProjectedPoint | null {
  const dr = a.rx - b.rx;
  if (Math.abs(dr) < 1e-12) return null;
  const t = a.rx / dr;
  if (t < 0 || t > 1) return null;
  let ry = a.ry + t * (b.ry - a.ry);
  let rz = a.rz + t * (b.rz - a.rz);
  const norm = Math.sqrt(ry * ry + rz * rz);
  if (norm < 1e-9) return null;
  ry /= norm;
  rz /= norm;
  return { sx: cx + R * ry, sy: cy - R * rz, rx: 0, ry, rz, v: true };
}

function ringToSegments(
  ring: [number, number][],
  lambda: number,
  phi: number,
  gamma: number,
  R: number,
  cx: number,
  cy: number
): ProjectedPoint[][] {
  const n = ring.length;
  if (n < 3) return [];
  const proj: ProjectedPoint[] = new Array(n);
  let visCount = 0;
  for (let i = 0; i < n; i++) {
    const p = ring[i];
    proj[i] = project(p[0], p[1], lambda, phi, gamma, R, cx, cy);
    if (proj[i].v) visCount++;
  }
  if (visCount === 0) return [];
  if (visCount === n) return [proj.slice()];

  let startIdx = -1;
  for (let i = 0; i < n; i++) {
    if (!proj[i].v && proj[(i + 1) % n].v) {
      startIdx = i;
      break;
    }
  }

  if (startIdx === -1) return [proj.slice()];
  const segments: ProjectedPoint[][] = [];
  let cur: ProjectedPoint[] = [];

  for (let k = 0; k < n; k++) {
    const i = (startIdx + k) % n;
    const j = (startIdx + k + 1) % n;
    const A = proj[i];
    const B = proj[j];

    if (A.v && B.v) {
      cur.push(B);
    } else if (A.v && !B.v) {
      const inter = limbIntersect(A, B, R, cx, cy);
      if (inter) cur.push(inter);
      if (cur.length >= 2) segments.push(cur);
      cur = [];
    } else if (!A.v && B.v) {
      const inter = limbIntersect(A, B, R, cx, cy);
      if (inter) cur.push(inter);
      cur.push(B);
    }
  }

  return segments;
}

function segmentsToPath(segs: ProjectedPoint[][]): string {
  if (segs.length === 0) return "";
  let out = "";
  for (const seg of segs) {
    for (let i = 0; i < seg.length; i++) {
      const p = seg[i];
      out += (i === 0 ? "M" : "L") + p.sx.toFixed(1) + "," + p.sy.toFixed(1);
    }
    out += "Z";
  }
  return out;
}

function buildSphericalPath(
  type: string,
  coords: any,
  lambda: number,
  phi: number,
  gamma: number,
  R: number,
  cx: number,
  cy: number
): string {
  if (!coords) return "";
  if (type === "Polygon") {
    let out = "";
    for (const ring of coords) {
      out += segmentsToPath(ringToSegments(ring, lambda, phi, gamma, R, cx, cy));
    }
    return out;
  }
  if (type === "MultiPolygon") {
    let out = "";
    for (const poly of coords) {
      for (const ring of poly) {
        out += segmentsToPath(ringToSegments(ring, lambda, phi, gamma, R, cx, cy));
      }
    }
    return out;
  }
  return "";
}

// Convert Lat/Lng to 3D Cartesian coordinates matching project
function latLngToUnitVector(lat: number, lng: number): [number, number, number] {
  const la = lat * D2R;
  const lo = lng * D2R;
  return [
    Math.cos(la) * Math.cos(lo),
    Math.cos(la) * Math.sin(lo),
    Math.sin(la)
  ];
}

function unitVectorToLatLng(v: [number, number, number]): { lat: number; lng: number } {
  const lat = Math.asin(clamp(v[2], -1, 1)) * R2D;
  const lng = Math.atan2(v[1], v[0]) * R2D;
  return { lat, lng };
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

/* ========================================================================== */
/* TopoJSON Decoder */
/* ========================================================================== */
function decArcs(t: any): any[] {
  const tf = t.transform;
  if (!tf) return t.arcs;
  const sx = tf.scale[0], sy = tf.scale[1], dx = tf.translate[0], dy = tf.translate[1];
  return t.arcs.map((a: any[]) => {
    let x = 0, y = 0;
    return a.map(p => {
      x += p[0];
      y += p[1];
      return [x * sx + dx, y * sy + dy];
    });
  });
}

function resolveRing(idx: number[], arcs: any[]): any[] {
  const out = [];
  for (const i of idx) {
    const a = i >= 0 ? arcs[i] : arcs[~i].slice().reverse();
    for (let j: number = out.length > 0 ? 1 : 0; j < a.length; j++) out.push(a[j]);
  }
  return out;
}

interface CountryFeature {
  id: string;
  type: string;
  coords: any;
}

function extractFeatures(t: any): CountryFeature[] {
  const arcs = decArcs(t);
  const gs = t.objects.countries?.geometries;
  if (!gs) return [];
  return gs.map((g: any) => {
    let c = null;
    if (g.type === "Polygon") c = g.arcs.map((r: any) => resolveRing(r, arcs));
    else if (g.type === "MultiPolygon")
      c = g.arcs.map((p: any) => p.map((r: any) => resolveRing(r, arcs)));
    return { id: String(g.id ?? ""), type: g.type, coords: c };
  });
}

/* ========================================================================== */
/* Hover hit-test (point-in-polygon over lng/lat) */
/* ========================================================================== */
interface CountryIndexItem {
  id: string;
  name: string;
  type: string;
  coords: any;
  rings: [number, number][][];
  bbox: { minLng: number; maxLng: number; minLat: number; maxLat: number };
}

function pointInRing(x: number, y: number, ring: [number, number][]): boolean {
  let inside = false;
  const n = ring.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if (yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function findCountryAt(lng: number, lat: number, index: CountryIndexItem[]): CountryIndexItem | null {
  for (const c of index) {
    if (lng < c.bbox.minLng || lng > c.bbox.maxLng) continue;
    if (lat < c.bbox.minLat || lat > c.bbox.maxLat) continue;
    let inside = false;
    for (const ring of c.rings) {
      if (pointInRing(lng, lat, ring)) inside = !inside;
    }
    if (inside) return c;
  }
  return null;
}

const DATA_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function ExportGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const ghostPathRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const markerRefs = useRef<Map<number, SVGGElement>>(new Map());
  const gridPathRef = useRef<SVGPathElement>(null);
  const originBeaconRef = useRef<SVGGElement>(null);
  const arcRefs = useRef<Map<number, SVGPathElement>>(new Map());
  const pulseRefs = useRef<Map<number, SVGGElement>>(new Map());
  const hoverCardRef = useRef<HTMLDivElement>(null);

  const [hoveredDest, setHoveredDest] = useState<Destination | null>(null);
  const hoveredDestRef = useRef<Destination | null>(null);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  // Stats values
  const [boutiquesCount, setBoutiquesCount] = useState(0);
  const [countriesCount, setCountriesCount] = useState(0);
  const [heritageCount, setHeritageCount] = useState(0);

  const [isClient, setIsClient] = useState(false);
  const [dims, setDims] = useState({ w: 540, h: 540 });
  const [feats, setFeats] = useState<CountryFeature[] | null>(null);
  const [err, setErr] = useState(false);
  const [hC, setHC] = useState<{ screenX: number; screenY: number; name: string; code: string } | null>(null);

  // Globe orientation state held in refs for 60fps performance
  // lambda = Z axis rotation (spin / longitude)
  // phi = Y axis rotation (tilt / latitude)
  // gamma = X axis rotation (roll)
  // Set default view to focus on Surat/India
  const rotRef = useRef({ lambda: 72, phi: 21, gamma: 0 });
  const dragRef = useRef({ active: false, startX: 0, startY: 0, startLambda: 0, startPhi: 0 });
  const lastMouseRef = useRef<{ x: number; y: number } | null>(null);
  const userInteractedRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const autoRotateSpeed = 2.0; // degrees per second

  // Store projected 2D coordinates of markers for hover card alignment
  const markerPositionsRef = useRef<{ [key: string]: { x: number; y: number; visible: boolean } }>({});

  const handleSetHoveredDest = (dest: Destination | null) => {
    setHoveredDest(dest);
    hoveredDestRef.current = dest;
    if (!dest && hoverCardRef.current) {
      hoverCardRef.current.style.display = "none";
    }
  };

  /* SSR guard */
  useEffect(() => {
    setIsClient(true);
  }, []);

  /* Resize observer for responsiveness */
  useEffect(() => {
    if (!isClient) return;
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const r = entries[0]?.contentRect;
      if (r && r.width > 0 && r.height > 0) {
        React.startTransition(() => {
          setDims({ w: r.width, h: r.height });
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isClient]);

  /* Load map geometries */
  useEffect(() => {
    if (!isClient) return;
    let dead = false;
    fetch(DATA_URL)
      .then(r => {
        if (!r.ok) throw new Error("Fetch failed");
        return r.json();
      })
      .then(t => {
        if (!dead) {
          React.startTransition(() => {
            setFeats(extractFeatures(t));
          });
        }
      })
      .catch(() => {
        if (!dead) {
          React.startTransition(() => {
            setErr(true);
          });
        }
      });
    return () => {
      dead = true;
    };
  }, [isClient]);

  /* Build country index (flatten rings + bbox) */
  const countryIndex = useMemo(() => {
    if (!feats) return [];
    const out: CountryIndexItem[] = [];
    for (const f of feats) {
      const pad3 = String(f.id).padStart(3, "0");
      const e = CD[pad3];
      const a3 = e ? e[0] : pad3;
      const nm = e ? e[1] : a3;
      if (a3 === "ATA") continue; // skip Antarctica for aesthetics

      const rings: [number, number][][] = [];
      let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
      
      const visit = (ring: [number, number][]) => {
        rings.push(ring);
        for (const p of ring) {
          if (p[0] < minLng) minLng = p[0];
          if (p[0] > maxLng) maxLng = p[0];
          if (p[1] < minLat) minLat = p[1];
          if (p[1] > maxLat) maxLat = p[1];
        }
      };

      if (f.type === "Polygon") {
        for (const r of f.coords) visit(r);
      } else if (f.type === "MultiPolygon") {
        for (const poly of f.coords) {
          for (const r of poly) visit(r);
        }
      }
      out.push({
        id: a3,
        name: nm,
        type: f.type,
        coords: f.coords,
        rings,
        bbox: { minLng, maxLng, minLat, maxLat }
      });
    }
    return out;
  }, [feats]);

  // Intersection observer trigger for stats counter animation
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

  /* Main Canvas-equivalent SVG Render Loop (Imperative 3D updates) */
  useEffect(() => {
    if (!isClient || countryIndex.length === 0) return;
    const { w: W, h: H } = dims;
    if (W <= 0 || H <= 0) return;

    const R = Math.min(W, H) / 2 - 20;
    const cx = W / 2;
    const cy = H / 2;

    let raf = 0;
    let lastTime = typeof performance !== "undefined" ? performance.now() : 0;
    const idleMs = 1500; // time to resume rotation after interaction

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      timeRef.current += dt;

      const sinceUser = now - userInteractedRef.current;
      if (!dragRef.current.active && sinceUser > idleMs) {
        // Rotate Z axis (spin longitude)
        rotRef.current.lambda += autoRotateSpeed * dt;
      }

      const { lambda, phi, gamma } = rotRef.current;

      // 1. Update Country Borders (Paths)
      for (const c of countryIndex) {
        const d = buildSphericalPath(c.type, c.coords, lambda, phi, gamma, R, cx, cy);
        const pathEl = pathRefs.current.get(c.id);
        if (pathEl) pathEl.setAttribute("d", d);

        const ghostEl = ghostPathRefs.current.get(c.id);
        if (ghostEl) ghostEl.setAttribute("d", d);
      }

      // 2. Update Latitude/Longitude Grid
      if (gridPathRef.current) {
        let gridD = "";
        // Parallels (latitudes)
        for (let lat = -60; lat <= 60; lat += 30) {
          let started = false;
          let prev = null;
          for (let lng = -180; lng <= 180; lng += 4) {
            const p = project(lng, lat, lambda, phi, gamma, R, cx, cy);
            if (p.v) {
              if (!started || (prev && !prev.v)) {
                gridD += `M${p.sx.toFixed(1)},${p.sy.toFixed(1)}`;
                started = true;
              } else {
                gridD += `L${p.sx.toFixed(1)},${p.sy.toFixed(1)}`;
              }
            }
            prev = p;
          }
        }
        // Meridians (longitudes)
        for (let lng = -180; lng < 180; lng += 30) {
          let started = false;
          let prev = null;
          for (let lat = -80; lat <= 80; lat += 4) {
            const p = project(lng, lat, lambda, phi, gamma, R, cx, cy);
            if (p.v) {
              if (!started || (prev && !prev.v)) {
                gridD += `M${p.sx.toFixed(1)},${p.sy.toFixed(1)}`;
                started = true;
              } else {
                gridD += `L${p.sx.toFixed(1)},${p.sy.toFixed(1)}`;
              }
            }
            prev = p;
          }
        }
        gridPathRef.current.setAttribute("d", gridD);
      }

      // 3. Update Surat Origin Beacon
      const originEl = originBeaconRef.current;
      if (originEl) {
        const p = project(ORIGIN_SURAT.lng, ORIGIN_SURAT.lat, lambda, phi, gamma, R, cx, cy);
        if (p.v) {
          originEl.style.display = "";
          originEl.setAttribute("transform", `translate(${p.sx.toFixed(1)},${p.sy.toFixed(1)})`);
          const fade = clamp(p.rx * 4, 0, 1);
          originEl.style.opacity = String(fade);
          markerPositionsRef.current["Surat"] = { x: p.sx, y: p.sy, visible: true };
        } else {
          originEl.style.display = "none";
          markerPositionsRef.current["Surat"] = { x: 0, y: 0, visible: false };
        }
      }

      // 4. Update Destination Markers
      DESTINATIONS.forEach((dest, idx) => {
        const el = markerRefs.current.get(idx);
        if (!el) return;

        const p = project(dest.lng, dest.lat, lambda, phi, gamma, R, cx, cy);
        if (p.v) {
          const fade = clamp(p.rx * 4, 0, 1);
          el.style.opacity = String(fade);
          el.style.display = "";
          el.setAttribute("transform", `translate(${p.sx.toFixed(1)},${p.sy.toFixed(1)})`);
          markerPositionsRef.current[dest.name] = { x: p.sx, y: p.sy, visible: true };
        } else {
          el.style.opacity = "0";
          el.style.display = "none";
          markerPositionsRef.current[dest.name] = { x: 0, y: 0, visible: false };
        }
      });

      // 5. Update Connection Arcs and Pulse Elements
      const vOrigin = latLngToUnitVector(ORIGIN_SURAT.lat, ORIGIN_SURAT.lng);
      DESTINATIONS.forEach((dest, idx) => {
        const arcEl = arcRefs.current.get(idx);
        const pulseEl = pulseRefs.current.get(idx);
        const vDest = latLngToUnitVector(dest.lat, dest.lng);

        // Update Arc path
        if (arcEl) {
          const steps = 20;
          let pathD = "";
          let isDrawing = false;

          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const vInterp = slerp(vOrigin, vDest, t);
            const { lat: lat_t, lng: lng_t } = unitVectorToLatLng(vInterp);
            
            // Arch height is 12% of the globe radius at the midpoint
            const R_eff = R * (1.0 + Math.sin(t * Math.PI) * 0.12);
            const p = project(lng_t, lat_t, lambda, phi, gamma, R_eff, cx, cy);

            if (p.v) {
              if (!isDrawing) {
                pathD += `M${p.sx.toFixed(1)},${p.sy.toFixed(1)}`;
                isDrawing = true;
              } else {
                pathD += ` L${p.sx.toFixed(1)},${p.sy.toFixed(1)}`;
              }
            } else {
              isDrawing = false;
            }
          }
          arcEl.setAttribute("d", pathD);
        }

        // Update Pulse element position
        if (pulseEl) {
          // Pulse takes 2.2 seconds per loop, staggered by index
          const progress = ((timeRef.current * 0.45 + idx * 0.12) % 1.0);
          const vPulse = slerp(vOrigin, vDest, progress);
          const { lat: latP, lng: lngP } = unitVectorToLatLng(vPulse);
          const R_eff = R * (1.0 + Math.sin(progress * Math.PI) * 0.12);
          const pP = project(lngP, latP, lambda, phi, gamma, R_eff, cx, cy);

          if (pP.v) {
            pulseEl.style.display = "";
            pulseEl.setAttribute("transform", `translate(${pP.sx.toFixed(1)},${pP.sy.toFixed(1)})`);
            // Fade pulse near both ends and by projection depth
            const fade = Math.sin(progress * Math.PI) * clamp(pP.rx * 4, 0, 1);
            pulseEl.style.opacity = String(fade);
          } else {
            pulseEl.style.display = "none";
          }
        }
      });

      // 6. Dynamic Floating Hover Card position update (aligns with marker during rotation)
      if (hoveredDestRef.current && hoverCardRef.current) {
        const pos = markerPositionsRef.current[hoveredDestRef.current.name];
        if (pos && pos.visible) {
          hoverCardRef.current.style.display = "";
          hoverCardRef.current.style.left = `${pos.x}px`;
          hoverCardRef.current.style.top = `${pos.y - 12}px`;
        } else {
          hoverCardRef.current.style.display = "none";
        }
      }

      // Re-evaluate country hover if pointer is stationary but globe rotated under it
      if (lastMouseRef.current && !dragRef.current.active) {
        const m = lastMouseRef.current;
        const ll = unproject(m.x, m.y, lambda, phi, gamma, R, cx, cy);
        if (ll) {
          const c = findCountryAt(ll.lng, ll.lat, countryIndex);
          if (c) {
            if (!hC || hC.code !== c.id) {
              React.startTransition(() => {
                setHC({ screenX: m.x, screenY: m.y, name: c.name, code: c.id });
              });
            } else if (hC.screenX !== m.x || hC.screenY !== m.y) {
              React.startTransition(() => {
                setHC(prev => prev ? { ...prev, screenX: m.x, screenY: m.y } : null);
              });
            }
          } else if (hC) {
            React.startTransition(() => {
              setHC(null);
            });
          }
        } else if (hC) {
          React.startTransition(() => {
            setHC(null);
          });
        }
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [isClient, countryIndex, dims]);

  /* Highlight hovered countries (separates Standard vs B2B export countries) */
  useEffect(() => {
    for (const c of countryIndex) {
      const el = pathRefs.current.get(c.id);
      if (!el) continue;
      const isHov = hC?.code === c.id;
      const isExport = EXPORT_COUNTRY_CODES.includes(c.id);
      const fill = isHov
        ? "#6B1F2A" // Royal Maroon on hover
        : isExport
        ? "#EADFCF" // Rich Antique Sand for export destinations
        : "#FBF8F3"; // Faint Warm Ivory for standard countries
      el.setAttribute("fill", fill);
    }
  }, [countryIndex, hC]);

  /* Drag Rotation Handlers */
  const localMouse = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const m = localMouse(e);
    const { w: W, h: H } = dims;
    const R = Math.min(W, H) / 2 - 20;
    const cx = W / 2;
    const cy = H / 2;
    const dx = m.x - cx;
    const dy = m.y - cy;

    // Only start drag if clicking directly on the globe sphere disc
    if (dx * dx + dy * dy > (R + 10) * (R + 10)) return;

    dragRef.current = {
      active: true,
      startX: m.x,
      startY: m.y,
      startLambda: rotRef.current.lambda,
      startPhi: rotRef.current.phi
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    React.startTransition(() => {
      setHC(null);
    });
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const m = localMouse(e);
    lastMouseRef.current = m;

    if (dragRef.current.active) {
      const sens = 0.25; // Drag sensitivity
      const dx = m.x - dragRef.current.startX;
      const dy = m.y - dragRef.current.startY;

      // Adjust rotation (lambda = polar spin, phi = horizontal tilt)
      rotRef.current.lambda = dragRef.current.startLambda - dx * sens;
      rotRef.current.phi = clamp(dragRef.current.startPhi + dy * sens, -85, 85);
    }
  };

  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (dragRef.current.active) {
      dragRef.current.active = false;
      userInteractedRef.current = typeof performance !== "undefined" ? performance.now() : Date.now();
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const onPointerLeave = () => {
    lastMouseRef.current = null;
    if (!dragRef.current.active) {
      React.startTransition(() => {
        setHC(null);
      });
    }
  };

  const loading = !feats && !err;
  const W = dims.w;
  const H = dims.h;
  const R = Math.min(W, H) / 2 - 20;
  const cx = W / 2;
  const cy = H / 2;

  return (
    <section className="bg-ivory border-t border-[#EADFCF]/30 select-none font-body relative overflow-hidden">
      
      {/* Editorial subtle grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#EADFCF_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        
        {/* Two Column Layout matching screenshot's design structure */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Typography Storytelling */}
          <div className="lg:col-span-5 text-left space-y-6">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#B29567] font-heading font-bold block">
              GLOBAL TEXTILE NETWORK
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-semibold tracking-wider text-deep-maroon uppercase leading-[1.1]">
              Connecting<br />
              Surat<br />
              <span className="italic font-light text-[#B29567] block mt-2 lowercase font-serif tracking-normal">to the world.</span>
            </h2>
            <div className="w-12 h-[1px] bg-antique-gold" />
            <p className="text-xs sm:text-sm text-charcoal/80 font-light leading-relaxed max-w-md">
              From the historical textile capital of India, our wholesale manufacturing lines feed international B2B distribution channels, supplying custom-woven bridal silks, heavy zardozi lehengas, and designer ethnic couture to elite boutique partners worldwide.
            </p>
          </div>

          {/* Right Column: Globe Visualization */}
          <div className="lg:col-span-7 flex justify-center items-center relative">
            <div 
              ref={containerRef} 
              className="relative w-full aspect-square max-w-[540px] flex items-center justify-center cursor-grab active:cursor-grabbing outline-none"
            >
              {/* CSS Styles for animations */}
              <style>{`
                .mm-c { transition: fill 150ms ease; }
                @keyframes mm-pulse {
                  0%, 100% { transform: scale(1); opacity: 0.55; }
                  50% { transform: scale(1.6); opacity: 0.05; }
                }
                .mm-pulse {
                  animation: mm-pulse 2.2s ease-out infinite;
                  transform-box: fill-box;
                  transform-origin: center;
                }
              `}</style>

              {/* Floating Premium Hover Card */}
              {hoveredDest && (
                <div 
                  ref={hoverCardRef}
                  style={{ 
                    position: "absolute",
                    zIndex: 30,
                    pointerEvents: "none",
                    transform: "translate(-50%, -100%)",
                    display: "none"
                  }}
                  className="bg-rich-charcoal/95 border border-antique-gold/25 p-4 w-60 shadow-[0_12px_24px_rgba(0,0,0,0.25)] rounded-none text-left animate-fade-in"
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

              {/* Loading State Overlay */}
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-widest text-[#B29567]/60">
                  Loading Global Map Data…
                </div>
              )}

              {/* Error State Overlay */}
              {err && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-xs text-red-700/80">
                  <span>Map display unavailable.</span>
                  <span className="text-[9px] opacity-60">Check network status for jsdelivr CDN.</span>
                </div>
              )}

              {/* Interactive 3D SVG Globe */}
              {isClient && !err && (
                <svg
                  ref={svgRef}
                  width={W}
                  height={H}
                  viewBox={`0 0 ${W} ${H}`}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                  onPointerLeave={onPointerLeave}
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    willChange: "transform",
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden"
                  }}
                  aria-label="3D Interactive Export Globe. Connecting Surat HQ to international B2B partners."
                  role="img"
                >
                  <defs>
                    {/* Shadow filter for landmasses */}
                    <filter id="landShadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.12 0" />
                    </filter>
                    {/* Globe surface spherical shadow */}
                    <radialGradient id="sphereShade" cx="38%" cy="32%" r="78%">
                      <stop offset="0%" stopColor="rgba(255, 255, 255, 0.1)" />
                      <stop offset="55%" stopColor="rgba(255, 255, 255, 0)" />
                      <stop offset="90%" stopColor="rgba(35, 27, 25, 0.15)" />
                      <stop offset="100%" stopColor="rgba(35, 27, 25, 0.4)" />
                    </radialGradient>
                    {/* Atmospheric Glow Halo */}
                    <radialGradient id="atmosphereGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(178, 149, 103, 0)" />
                      <stop offset={`${(R / (R + 60) * 100).toFixed(1)}%`} stopColor="rgba(178, 149, 103, 0)" />
                      <stop offset={`${((R + 6) / (R + 60) * 100).toFixed(1)}%`} stopColor="rgba(178, 149, 103, 0.12)" />
                      <stop offset="100%" stopColor="rgba(178, 149, 103, 0)" />
                    </radialGradient>
                    {/* 3D Sphere shading overlay */}
                    <linearGradient id="oceanBack" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(252, 249, 245, 0.4)" />
                      <stop offset="100%" stopColor="rgba(234, 223, 207, 0.3)" />
                    </linearGradient>
                    {/* Clipping mask to keep features within the circle */}
                    <clipPath id="globeClip">
                      <circle cx={cx} cy={cy} r={R} />
                    </clipPath>
                  </defs>

                  {/* Atmospheric gold glow halo */}
                  <circle cx={cx} cy={cy} r={R + 60} fill="url(#atmosphereGlow)" pointerEvents="none" />

                  {/* Base Ocean sphere */}
                  <circle cx={cx} cy={cy} r={R} fill="#FCF9F5" />
                  <circle cx={cx} cy={cy} r={R} fill="url(#oceanBack)" />

                  {/* Clipped map elements (land & grid) */}
                  <g clipPath="url(#globeClip)">
                    {/* Soft shadows behind lands */}
                    <g opacity={0.06} filter="url(#landShadow)">
                      {countryIndex.map((c, index) => (
                        <path
                          key={"ghost_" + c.id + "_" + index}
                          ref={el => {
                            if (el) ghostPathRefs.current.set(c.id, el);
                            else ghostPathRefs.current.delete(c.id);
                          }}
                          fill="#D1C2A5"
                          stroke="none"
                          pointerEvents="none"
                        />
                      ))}
                    </g>

                    {/* Lat/Lng Grid (Graticule) */}
                    <path
                      ref={gridPathRef}
                      fill="none"
                      stroke="#B29567"
                      strokeWidth={0.5}
                      strokeOpacity={0.08}
                      vectorEffect="non-scaling-stroke"
                      pointerEvents="none"
                    />

                    {/* Actual Country polygons */}
                    {countryIndex.map((c, index) => {
                      const isExport = EXPORT_COUNTRY_CODES.includes(c.id);
                      const initialFill = isExport ? "#EADFCF" : "#FBF8F3";
                      return (
                        <path
                          key={c.id + "_" + index}
                          ref={el => {
                            if (el) pathRefs.current.set(c.id, el);
                            else pathRefs.current.delete(c.id);
                          }}
                          className="mm-c"
                          fill={initialFill}
                          stroke="#D1C2A5"
                          strokeWidth={0.6}
                          vectorEffect="non-scaling-stroke"
                          style={{ cursor: "default" }}
                        />
                      );
                    })}

                    {/* Connection Arcs (Surat -> Destinations) */}
                    {DESTINATIONS.map((_, idx) => (
                      <path
                        key={`arc_${idx}`}
                        ref={el => {
                          if (el) arcRefs.current.set(idx, el);
                          else arcRefs.current.delete(idx);
                        }}
                        fill="none"
                        stroke="rgba(107, 31, 42, 0.3)"
                        strokeWidth={0.8}
                        pointerEvents="none"
                      />
                    ))}

                    {/* Traveling pulses on connection arcs */}
                    {DESTINATIONS.map((_, idx) => (
                      <g
                        key={`pulse_${idx}`}
                        ref={el => {
                          if (el) pulseRefs.current.set(idx, el);
                          else pulseRefs.current.delete(idx);
                        }}
                        style={{ display: "none" }}
                        pointerEvents="none"
                      >
                        <circle r={1.5} fill="#DC2626" />
                        <circle r={4.5} fill="none" stroke="#DC2626" strokeWidth={1} opacity={0.6} className="mm-pulse" />
                      </g>
                    ))}
                  </g>

                  {/* Shading overlay for 3D depth */}
                  <circle cx={cx} cy={cy} r={R} fill="url(#sphereShade)" pointerEvents="none" />
                  <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(178, 149, 103, 0.25)" strokeWidth={1} pointerEvents="none" />

                  {/* Destination Markers */}
                  {DESTINATIONS.map((dest, idx) => {
                    const isHovered = hoveredDest?.name === dest.name;
                    return (
                      <g
                        key={idx}
                        ref={el => {
                          if (el) markerRefs.current.set(idx, el);
                          else markerRefs.current.delete(idx);
                        }}
                        style={{ cursor: "pointer", display: "none" }}
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseEnter={() => handleSetHoveredDest(dest)}
                        onMouseLeave={() => handleSetHoveredDest(null)}
                      >
                        {/* Outer pulse */}
                        <circle
                          className={isHovered ? "mm-pulse" : ""}
                          r={isHovered ? 12 : 8}
                          fill={isHovered ? "rgba(107, 31, 42, 0.25)" : "rgba(178, 149, 103, 0.2)"}
                        />
                        {/* Solid center dot */}
                        <circle r={isHovered ? 5.5 : 4.5} fill={isHovered ? "#6B1F2A" : "#B29567"} />
                        <circle cx={-0.6} cy={-0.6} r={0.6} fill="#FFF" opacity={0.7} />

                        {/* Constant Text Labels for Top Locations */}
                        {["Dubai", "London", "Singapore", "Mauritius"].includes(dest.name) && (
                          <text
                            x={10}
                            y={3}
                            fill="#6B1F2A"
                            fontSize={9}
                            fontWeight={700}
                            className="select-none pointer-events-none opacity-80"
                            style={{
                              paintOrder: "stroke",
                              stroke: "#FCF9F5",
                              strokeWidth: 3,
                              strokeLinejoin: "round"
                            }}
                          >
                            {dest.name}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Surat HQ Origin Beacon */}
                  <g ref={originBeaconRef} style={{ display: "none" }}>
                    <circle className="mm-pulse" r={10} fill="rgba(107, 31, 42, 0.25)" />
                    <circle r={6} fill="none" stroke="#6B1F2A" strokeWidth={1.5} />
                    <circle r={3} fill="#6B1F2A" />
                    <circle cx={-0.8} cy={-0.8} r={0.8} fill="#FFF" />
                    {/* Surat HQ Text Label */}
                    <rect x={-32} y={-23} width={64} height={14} fill="rgba(253, 249, 243, 0.85)" rx={2} />
                    <text y={-13} fill="#6B1F2A" fontSize={8} fontWeight="bold" textAnchor="middle">
                      Surat (HQ)
                    </text>
                  </g>

                  {/* Technical Overlay Labels */}
                  <text x={cx - R * 0.95} y={cy - R * 0.98} fill="rgba(178, 149, 103, 0.4)" fontSize={7} fontWeight={500}>
                    SYSTEM: SVG_3D_ORTHO_ACTIVE
                  </text>
                  <text x={cx + R * 0.95} y={cy - R * 0.98} fill="rgba(178, 149, 103, 0.4)" fontSize={7} fontWeight={500} textAnchor="end">
                    AXIS: TILTED_23.5
                  </text>
                </svg>
              )}

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
