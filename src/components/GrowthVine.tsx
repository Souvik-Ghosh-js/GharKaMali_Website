'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * The home page's signature: a living stem that grows down the page with the
 * reader. It sprouts from the hero, runs down the left gutter, unfurls a leaf
 * at every chapter (section) and blooms at the end. Purely decorative — no
 * content — and drawn with one rAF loop (stroke-dashoffset + transforms).
 */

type Geo = {
  top: number;
  height: number;
  width: number;
  d: string;
  leafYs: number[];
  scale: number;
};

const LEAF = 'M0 0 C 9 -14, 28 -19, 42 -6 C 29 6, 11 9, 0 0 Z';
const VEIN = 'M1 -0.5 C 13 -6, 26 -9, 38 -6';

export default function GrowthVine() {
  const [geo, setGeo] = useState<Geo | null>(null);
  const stemRef = useRef<SVGPathElement>(null);
  const haloRef = useRef<SVGPathElement>(null);
  const tipRef = useRef<SVGGElement>(null);
  const leafRefs = useRef<(SVGGElement | null)[]>([]);
  const bloomRef = useRef<SVGGElement>(null);

  // ── Measure the page and build the stem path ──────────────────────────────
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    let last = '';

    const measure = () => {
      const hero = document.querySelector<HTMLElement>('[data-story="hero"]');
      // Sprout below the marquee bands that follow the hero (never over them).
      const start = document.querySelector<HTMLElement>('.hero-marquees') || hero;
      const footer = document.querySelector<HTMLElement>('footer');
      const container = document.querySelector<HTMLElement>('.container');
      if (!hero || !footer || !container) return;

      const sy = scrollY;
      const top = Math.round((start || hero)!.getBoundingClientRect().bottom + sy);
      const bottom = Math.round(footer.getBoundingClientRect().top + sy);
      const height = bottom - top;
      const width = document.documentElement.clientWidth;
      if (height < 400) return;

      const gutter = parseFloat(getComputedStyle(container).paddingLeft) || 20;
      const gx = Math.max(10, gutter * 0.5);
      const amp = Math.min(gutter * 0.15, 10);
      // Leaves angle up at 55°, so they reach ~0.55 × length sideways.
      const scale = Math.min(1.1, Math.max(0.42, (gutter * 0.5) / 26));

      // Chapters: every section after the hero (use the pin spacer if pinned).
      const tops = Array.from(document.querySelectorAll<HTMLElement>('section'))
        .filter(s => s !== hero && !hero.contains(s))
        .map(s => {
          const box = s.parentElement?.classList.contains('pin-spacer') ? s.parentElement : s;
          return Math.round(box.getBoundingClientRect().top + sy - top);
        })
        .filter(y => y > 120 && y < height - 160)
        .sort((a, b) => a - b);
      const leafYs = tops.map(y => y + 70);

      // Sprout from the hero's centre, sweep to the gutter, then meander down.
      const cx = width / 2;
      let d = `M ${cx} 0 C ${cx} 70, ${gx + 40} 40, ${gx} 150`;
      let y = 150, i = 0;
      // The last stretch leans out of the gutter so the bloom fits on screen.
      const endX = Math.max(gx, 48 * scale);
      while (y < height - 10) {
        const ny = Math.min(height, y + 280);
        const last = ny >= height;
        const nx = last ? endX : gx + (i % 2 === 0 ? amp : -amp);
        const px = gx + (i % 2 === 0 ? -amp : amp);
        d += ` C ${px} ${y + (ny - y) / 2}, ${nx} ${y + (ny - y) / 2}, ${nx} ${ny}`;
        y = ny; i++;
      }

      const key = `${top}|${height}|${width}|${leafYs.join(',')}`;
      if (key === last) return;
      last = key;
      setGeo({ top, height, width, d, leafYs, scale });
    };

    const schedule = () => { clearTimeout(t); t = setTimeout(measure, 200); };
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    addEventListener('resize', schedule);
    const first = setTimeout(measure, 600);
    return () => { clearTimeout(t); clearTimeout(first); ro.disconnect(); removeEventListener('resize', schedule); };
  }, []);

  // ── Grow with the reader ──────────────────────────────────────────────────
  useEffect(() => {
    const stem = stemRef.current;
    if (!geo || !stem) return;
    const L = stem.getTotalLength();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // y → length lookup (the stem only ever heads downward after the sprout)
    const N = 500;
    const lut: { len: number; x: number; y: number }[] = [];
    for (let k = 0; k <= N; k++) {
      const len = (L * k) / N;
      const p = stem.getPointAtLength(len);
      lut.push({ len, x: p.x, y: p.y });
    }
    const lenAtY = (y: number) => {
      if (y <= 0) return 0;
      let lo = 0, hi = N;
      while (lo < hi) { const m = (lo + hi) >> 1; if (lut[m].y < y) lo = m + 1; else hi = m; }
      return lut[lo].len;
    };
    const ptAtY = (y: number) => {
      const len = lenAtY(y);
      return lut[Math.min(N, Math.round((len / L) * N))];
    };

    // Place leaves on the stem, alternating sides.
    const leafLens = geo.leafYs.map((ly, i) => {
      const p = ptAtY(ly);
      const g = leafRefs.current[i];
      if (g) g.setAttribute('transform', `translate(${p.x} ${p.y}) scale(${(i % 2 ? -1 : 1) * geo.scale} ${geo.scale}) rotate(-55)`);
      return p.len;
    });
    const end = lut[N];
    bloomRef.current?.setAttribute('transform', `translate(${end.x} ${end.y}) scale(${geo.scale * 0.75})`);

    const halo = haloRef.current;
    stem.style.strokeDasharray = `${L}`;
    if (halo) halo.style.strokeDasharray = `${L}`;
    let cur = reduce ? L : 0;
    let drawn = -1;
    const leafOn: boolean[] = leafLens.map(() => false);
    let tipOn = false, bloomOn = false;
    let raf = 0;

    const frame = () => {
      const target = reduce ? L : lenAtY(scrollY + innerHeight * 0.62 - geo.top);
      cur += (target - cur) * 0.14;
      if (Math.abs(target - cur) < 0.5) cur = target;
      // Idle while reading: no DOM writes unless the tip actually moved.
      if (Math.abs(cur - drawn) < 0.3) { raf = 0; return; }
      drawn = cur;

      stem.style.strokeDashoffset = `${L - cur}`;
      if (halo) halo.style.strokeDashoffset = `${L - cur}`;
      const p = lut[Math.min(N, Math.max(0, Math.round((cur / L) * N)))];
      tipRef.current?.setAttribute('transform', `translate(${p.x} ${p.y})`);
      const t = cur > 2 && cur < L - 2;
      if (t !== tipOn) { tipOn = t; tipRef.current?.classList.toggle('on', t); }
      leafLens.forEach((len, i) => {
        const on = cur >= len;
        if (on !== leafOn[i]) { leafOn[i] = on; leafRefs.current[i]?.classList.toggle('on', on); }
      });
      const b = cur >= L - 4;
      if (b !== bloomOn) { bloomOn = b; bloomRef.current?.classList.toggle('on', b); }

      // Keep easing only until the tip catches up, then stop (no idle loop).
      raf = cur === target ? 0 : requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
    kick();
    addEventListener('scroll', kick, { passive: true });
    addEventListener('resize', kick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('scroll', kick);
      removeEventListener('resize', kick);
    };
  }, [geo]);

  if (!geo) return null;

  return (
    <svg
      className="vine"
      aria-hidden
      width={geo.width}
      height={geo.height}
      viewBox={`0 0 ${geo.width} ${geo.height}`}
      style={{ top: geo.top }}
    >
      <defs>
        <linearGradient id="vineStem" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d9f27a" />
          <stop offset="35%" stopColor="#8fd9ae" />
          <stop offset="100%" stopColor="#2f6b47" />
        </linearGradient>
        <linearGradient id="vineLeaf" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2f6b47" />
          <stop offset="100%" stopColor="#8fd9ae" />
        </linearGradient>
      </defs>

      {/* Where it will grow — a faint dotted promise */}
      <path d={geo.d} className="vine-ghost" />
      {/* Halo so the stem reads on dark sections too */}
      <path ref={haloRef} d={geo.d} className="vine-halo" />
      <path ref={stemRef} d={geo.d} className="vine-stem" />

      {geo.leafYs.map((_, i) => (
        <g key={i} ref={el => { leafRefs.current[i] = el; }} className="vine-leaf">
          <g>
            <path d={LEAF} fill="url(#vineLeaf)" />
            <path d={VEIN} className="vine-vein" />
            <circle r="3.2" className="vine-node" />
          </g>
        </g>
      ))}

      <g ref={bloomRef} className="vine-bloom">
        <g>
          {[0, 60, 120, 180, 240, 300].map(a => (
            <path key={a} d={LEAF} fill="url(#vineLeaf)" transform={`rotate(${a})`} />
          ))}
          <circle r="7" className="vine-bud" />
        </g>
      </g>

      <g ref={tipRef} className="vine-tip">
        <circle r="13" className="vine-tip-ring" />
        <circle r="4.5" className="vine-tip-core" />
      </g>
    </svg>
  );
}
