'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';
import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '@/lib/api';

const Ic = {
  Menu: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>,
  Close: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Bell: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
  Cart: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>,
  Apple: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91 1.64.15 3.12.83 4.02 2.15-3.41 2.07-2.83 6.94.74 8.28-.27.81-.62 1.58-1.07 2.33zm-3.6-13.84c-.66.86-1.59 1.43-2.6 1.39-.14-1.12.35-2.22 1.05-3.04.66-.83 1.68-1.42 2.65-1.39.15 1.15-.35 2.2-1.1 3.04z" /></svg>,
  Android: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.341c-.551 0-.999-.449-.999-1s.448-.999.999-.999c.551 0 .999.448.999.999s-.448 1-.999 1zm-11.046 0c-.551 0-.999-.449-.999-1s.448-.999.999-.999c.551 0 .999.448.999.999s-.448 1-.999 1zm11.405-6.02l1.997-3.459a.415.415 0 00-.152-.567.416.416 0 00-.568.152l-2.035 3.524a12.293 12.293 0 00-4.666-1.002c-1.679 0-3.254.361-4.666 1.002L5.757 5.447a.416.416 0 00-.568-.152.415.415 0 00-.152.567l1.997 3.46C3.398 11.649 1.488 14.936 1.107 18.73h21.787c-.382-3.795-2.292-7.081-6.012-9.409z" /></svg>,
  Home: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  Plans: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>,
  Cal: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  Shop: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  Leaf: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>,
  Book: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
  Dash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
  Bookmark: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>,
  Package: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  Wallet: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
  Map: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  Help: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  WA: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>,
};

const NAV_ITEMS = [
  { href: '/', label: 'Home', Icon: Ic.Home, color: '#16a34a' },
  { href: '/plans', label: 'Plans', Icon: Ic.Plans, color: '#0ea5e9' },
  { href: '/book?type=on-demand', label: 'Book Visit', Icon: Ic.Cal, color: '#f59e0b' },
  { href: '/shop', label: 'Plant Store', Icon: Ic.Shop, color: '#8b5cf6' },
  { href: '/plantopedia', label: 'AI Care', Icon: Ic.Leaf, color: '#10b981' },
  { href: '/about', label: 'About Us', Icon: Ic.Help, color: '#06b6d4' },
];

const ACCOUNT_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', Icon: Ic.Dash },
  { href: '/bookings', label: 'My Bookings', Icon: Ic.Cal },
  { href: '/subscriptions', label: 'My Plans', Icon: Ic.Bookmark },
  { href: '/shop/orders', label: 'Shop Orders', Icon: Ic.Package },
  { href: '/wallet', label: 'Wallet & Rewards', Icon: Ic.Wallet },
  { href: '/notifications', label: 'Notifications', Icon: Ic.Bell },
  { href: '/profile', label: 'Profile & Addresses', Icon: Ic.Map },
  { href: '/complaints', label: 'Support & Help', Icon: Ic.Help },
];

export default function Navbar({ transparent: _transparent = false }: { transparent?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { totalItems, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [hubOpen, setHubOpen] = useState(false);
  const [menuScrolled, setMenuScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!hubOpen) setMenuScrolled(false);
  }, [hubOpen]);

  useEffect(() => {
    if (hubOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [hubOpen]);
  const animRef = useRef<number>(0);
  const searchRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/shop?search=${encodeURIComponent(q)}`);
      setSearchQuery('');
      setHubOpen(false);
    }
  };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    fn(); window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    if (hubOpen && typeof window !== 'undefined' && window.innerWidth <= 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [hubOpen]);

  useEffect(() => { setHubOpen(false); }, [pathname]);

  // Particle canvas for menu background
  useEffect(() => {
    if (!hubOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    type Leaf = { x: number; y: number; vx: number; vy: number; size: number; opacity: number; rotation: number; rotSpeed: number; hue: number; wave: number; waveSpeed: number; waveAmp: number };
    const particles: Leaf[] = [];
    // 50 leaves for a lush effect
    const leafHues = [120, 100, 140, 80, 150, 45, 60, 30]; // greens + gold tones
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.2, vy: Math.random() * 1.8 + 0.4,
        size: Math.random() * 18 + 10, opacity: Math.random() * 0.55 + 0.3,
        rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.12,
        hue: leafHues[Math.floor(Math.random() * leafHues.length)],
        wave: Math.random() * Math.PI * 2, waveSpeed: Math.random() * 0.04 + 0.02, waveAmp: Math.random() * 1.5 + 0.5,
      });
    }

    const leafPath = new Path2D('M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10zM2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12');

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(p.size / 24, p.size / 24);
        const sat = p.hue < 80 ? '70%' : '55%';
        const light = p.hue < 80 ? '45%' : '35%';
        ctx.fillStyle = `hsla(${p.hue}, ${sat}, ${light}, ${p.opacity})`;
        ctx.fill(leafPath);
        ctx.restore();

        // Natural swaying drift
        p.wave += p.waveSpeed;
        p.x += p.vx + Math.sin(p.wave) * p.waveAmp;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        if (p.y > canvas.height + 30) {
          p.y = -30;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -30) p.x = canvas.width + 30;
        if (p.x > canvas.width + 30) p.x = -30;
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [hubOpen]);

  const { data: notifs } = useQuery({ queryKey: ['notifs-nav'], queryFn: getNotifications, enabled: isAuthenticated, refetchInterval: 60_000 });
  const unread = ((notifs as any[]) ?? []).filter((n: any) => !n.is_read).length;
  const cartCount = totalItems();
  const showBg = scrolled && !hubOpen;
  const isLight = _transparent && !scrolled && !hubOpen;

  return (
    <>
      {/* ═══ TOPBAR ═══ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000,
        height: 'var(--nav-h)', display: 'flex', alignItems: 'center',
        background: hubOpen ? (menuScrolled ? 'rgba(255,255,255,0.98)' : 'transparent') : showBg ? 'rgba(255,249,225,0.95)' : 'transparent',
        backdropFilter: (showBg || (hubOpen && menuScrolled)) ? 'blur(24px) saturate(200%)' : 'none',
        borderBottom: (showBg || (hubOpen && menuScrolled)) ? '1px solid rgba(3,65,26,0.08)' : '1px solid transparent',
        transition: 'background 0.4s, border-color 0.4s, backdrop-filter 0.4s',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <img src="/logo-dark.png" alt="GharKaMali" style={{ width: 90, height: 90, objectFit: 'contain', filter: isLight ? 'brightness(0) invert(1)' : 'none', transition: 'filter 0.4s' }} />
          </Link>

          {/* Desktop nav */}
          <div className="nav-desktop-links" style={{ display: hubOpen ? 'none' : 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center', minWidth: 0, overflow: 'hidden' }}>
            {NAV_ITEMS.map(item => (
              <Link key={item.href} href={item.href} className={`nav-link ${isLight ? 'is-light' : ''} ${pathname === item.href ? 'active' : ''}`} style={{
                padding: '7px 11px', borderRadius: 10, fontWeight: 700,
                fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}>{item.label}</Link>
            ))}
            {/* Green Makeover CTA pill */}
            <Link
              href="/green-makeover"
              className="nav-gm-pill"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '7px 14px', borderRadius: 10,
                background: pathname === '/green-makeover'
                  ? 'var(--forest)'
                  : isLight
                    ? 'rgba(255,255,255,0.18)'
                    : 'linear-gradient(135deg, var(--forest) 0%, var(--forest-mid) 100%)',
                border: isLight ? '1px solid rgba(255,255,255,0.3)' : 'none',
                color: '#fff',
                fontSize: '0.75rem', fontWeight: 800,
                letterSpacing: '0.04em', textTransform: 'uppercase',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                boxShadow: isLight ? 'none' : '0 4px 14px rgba(3,65,26,0.3)',
                transition: 'all 0.25s',
                backdropFilter: isLight ? 'blur(10px)' : 'none',
                flexShrink: 0,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              </svg>
              Green Makeover
            </Link>
          </div>

          {/* Desktop search bar */}
          <form onSubmit={handleSearch} className="nav-search-wrap" style={{ position: 'relative', display: hubOpen ? 'none' : 'flex', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ position: 'absolute', left: 11, color: isLight ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </span>
            <input
              ref={searchRef}
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search plants, tools…"
              className="nav-search-input"
              aria-label="Search"
              style={{ background: isLight ? 'rgba(255,255,255,0.15)' : 'rgba(3,65,26,0.06)', border: `1.5px solid ${isLight ? 'rgba(255,255,255,0.3)' : 'var(--border-mid)'}`, borderRadius: 99, padding: '8px 16px 8px 34px', fontSize: '0.82rem', color: isLight ? '#fff' : 'var(--text)', outline: 'none', width: 200, transition: 'all 0.3s', fontFamily: 'var(--font-body)', backdropFilter: isLight ? 'blur(8px)' : 'none' }}
              onFocus={e => { e.currentTarget.style.width = '240px'; e.currentTarget.style.borderColor = isLight ? '#fff' : 'var(--forest)'; e.currentTarget.style.background = isLight ? 'rgba(255,255,255,0.9)' : '#fff'; e.currentTarget.style.color = 'var(--forest)'; }}
              onBlur={e => { e.currentTarget.style.width = '200px'; e.currentTarget.style.borderColor = isLight ? 'rgba(255,255,255,0.3)' : 'var(--border-mid)'; e.currentTarget.style.background = isLight ? 'rgba(255,255,255,0.15)' : 'rgba(3,65,26,0.06)'; e.currentTarget.style.color = isLight ? '#fff' : 'var(--text)'; }}
            />
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {!hubOpen && (
              <div className="nav-app-badges" style={{ display: 'flex', gap: 6 }}>
                <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', background: 'var(--forest)', color: '#fff', borderRadius: 9, fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.4)' : 'none' }}><Ic.Apple /> App Store</a>
                <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', background: isLight ? 'rgba(255,255,255,0.15)' : 'rgba(3,65,26,0.07)', color: isLight ? '#fff' : 'var(--forest)', borderRadius: 9, fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none', border: `1px solid ${isLight ? 'rgba(255,255,255,0.3)' : 'var(--border)'}`, whiteSpace: 'nowrap', backdropFilter: isLight ? 'blur(8px)' : 'none', textShadow: isLight ? '0 1px 4px rgba(0,0,0,0.5)' : 'none' }}><Ic.Android /> Play Store</a>
              </div>
            )}
            {!hubOpen && (
              <button onClick={openCart} aria-label="Cart" style={{ position: 'relative', width: 40, height: 40, borderRadius: 11, background: isLight ? 'rgba(255,255,255,0.15)' : 'rgba(3,65,26,0.06)', color: isLight ? '#fff' : 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${isLight ? 'rgba(255,255,255,0.2)' : 'transparent'}`, cursor: 'pointer', flexShrink: 0, backdropFilter: isLight ? 'blur(8px)' : 'none' }}>
                <Ic.Cart />
                {cartCount > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--earth)', color: '#fff', width: 17, height: 17, borderRadius: '50%', fontSize: '0.62rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>{cartCount}</span>}
              </button>
            )}
            {!hubOpen && isAuthenticated && (
              <Link href="/notifications" className="nav-bell-desktop" style={{ position: 'relative', width: 40, height: 40, borderRadius: 11, background: isLight ? 'rgba(255,255,255,0.15)' : 'rgba(3,65,26,0.06)', color: isLight ? '#fff' : 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${isLight ? 'rgba(255,255,255,0.2)' : 'transparent'}`, backdropFilter: isLight ? 'blur(8px)' : 'none' }}>
                <Ic.Bell />
                {unread > 0 && <span style={{ position: 'absolute', top: 9, right: 9, width: 7, height: 7, background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }} />}
              </Link>
            )}
            <button onClick={() => setHubOpen(!hubOpen)} aria-label={hubOpen ? 'Close' : 'Menu'} style={{ width: 42, height: 42, borderRadius: 13, background: hubOpen ? '#fff' : 'var(--forest)', color: hubOpen ? 'var(--forest)' : '#fff', border: hubOpen ? '2px solid var(--forest)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.3s', boxShadow: hubOpen ? 'var(--sh-sm)' : '0 4px 14px rgba(3,65,26,0.3)' }}>
              {hubOpen ? <Ic.Close /> : <Ic.Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ FULLSCREEN MENU OVERLAY ═══ */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1900,
        height: '100dvh',
        opacity: hubOpen ? 1 : 0, visibility: hubOpen ? 'visible' : 'hidden',
        transition: 'opacity 0.45s cubic-bezier(0.22,1,0.36,1), visibility 0.45s',
        background: '#fff',
        backdropFilter: 'blur(40px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch' as any,
      }}
      onScroll={(e) => setMenuScrolled(e.currentTarget.scrollTop > 20)}
      >
        {/* Animated particle canvas */}
        <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />

        {/* Glowing orbs */}
        <div style={{ position: 'fixed', top: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(3,65,26,0.3) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0, animation: 'menuOrb1 8s ease-in-out infinite' }} />
        <div style={{ position: 'fixed', bottom: '10%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0, animation: 'menuOrb2 10s ease-in-out infinite' }} />

        <div className="container nav-hub-container" style={{ position: 'relative', zIndex: 10, paddingTop: 'calc(var(--nav-h) + 32px)', paddingBottom: 60 }}>
          {/* Auth pill */}
          <div style={{ marginBottom: 36 }}>
            {isAuthenticated && user ? (
              <Link href="/dashboard" onClick={() => setHubOpen(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(3,65,26,0.04)', border: '1px solid rgba(3,65,26,0.1)', borderRadius: 99, padding: '10px 22px 10px 10px', textDecoration: 'none', backdropFilter: 'blur(10px)' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem' }}>
                  {(user as any)?.name?.[0]?.toUpperCase() || <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--forest)' }}>{(user as any)?.name || 'My Account'}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--earth)', fontWeight: 600 }}>View Dashboard →</div>
                </div>
              </Link>
            ) : (
              <Link href="/login" onClick={() => setHubOpen(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--forest)', color: '#fff', borderRadius: 99, padding: '12px 30px', textDecoration: 'none', fontWeight: 800, fontSize: '0.88rem', boxShadow: '0 8px 32px rgba(3,65,26,0.4)' }}>
                Sign In / Create Account
              </Link>
            )}
          </div>

          {/* Search bar inside menu — visible on all devices */}
          <form onSubmit={handleSearch} style={{ marginBottom: 28, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search plants, tools, products…"
              style={{ width: '100%', padding: '13px 16px 13px 44px', background: 'rgba(3,65,26,0.05)', border: '1.5px solid rgba(3,65,26,0.12)', borderRadius: 16, fontSize: '0.92rem', color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-body)', transition: 'all 0.25s' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--forest)'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(3,65,26,0.08)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(3,65,26,0.12)'; e.currentTarget.style.background = 'rgba(3,65,26,0.05)'; e.currentTarget.style.boxShadow = 'none'; }}
              aria-label="Search"
            />
            {searchQuery && (
              <button type="submit" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 10, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                Go
              </button>
            )}
          </form>

          {/* ── GREEN MAKEOVER FEATURE CARD ── */}
          <Link
            href="/green-makeover"
            onClick={() => setHubOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 20,
              background: 'linear-gradient(135deg, var(--forest) 0%, var(--forest-mid) 100%)',
              borderRadius: 20, padding: '20px 24px',
              textDecoration: 'none', marginBottom: 28,
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 12px 40px rgba(3,65,26,0.25)',
              transition: 'transform 0.25s var(--ease), box-shadow 0.25s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 18px 50px rgba(3,65,26,0.35)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(3,65,26,0.25)'; }}
          >
            {/* Decorative glow */}
            <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(237,207,135,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
            {/* Icon */}
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(237,207,135,0.15)', border: '1px solid rgba(237,207,135,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--gold)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              </svg>
            </div>
            {/* Text */}
            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 4 }}>New Service</div>
              <div style={{ fontWeight: 900, fontSize: '1.15rem', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Green Makeover</div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500, marginTop: 4 }}>Plant setups from ₹20,000</div>
            </div>
            {/* Arrow + badge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0, position: 'relative', zIndex: 1 }}>
              <div style={{ background: 'var(--gold)', color: 'var(--forest)', fontSize: '0.58rem', fontWeight: 900, padding: '4px 10px', borderRadius: 99, whiteSpace: 'nowrap', letterSpacing: '0.06em' }}>₹299 Visit</div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </div>
          </Link>

          {/* Section label */}
          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--earth)', textTransform: 'uppercase', letterSpacing: '0.35em', marginBottom: 20 }}>Navigate</div>

          {/* ── EXPLORE TILES (2-col grid of large tiles) ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '?');
              return (
                <Link key={item.href} href={item.href} onClick={() => setHubOpen(false)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    gap: 10, padding: '18px 20px',
                    background: isActive ? `rgba(${item.color === '#16a34a' ? '22,163,74' : item.color === '#0ea5e9' ? '14,165,233' : item.color === '#f59e0b' ? '245,158,11' : item.color === '#8b5cf6' ? '139,92,246' : item.color === '#10b981' ? '16,185,129' : '249,115,22'},0.18)` : 'rgba(3,65,26,0.04)',
                    border: `1px solid ${isActive ? item.color + '50' : 'rgba(3,65,26,0.08)'}`,
                    borderRadius: 18, textDecoration: 'none', transition: 'all 0.25s',
                    backdropFilter: 'blur(8px)',
                    minHeight: 90,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(3,65,26,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isActive ? `rgba(22,163,74,0.18)` : 'rgba(3,65,26,0.04)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}22`, border: `1px solid ${item.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
                    <item.Icon />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--forest)', lineHeight: 1.2 }}>{item.label}</div>
                    {isActive && <div style={{ fontSize: '0.65rem', color: item.color, fontWeight: 700, marginTop: 2 }}>● Active</div>}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ── ACCOUNT TILES ── */}
          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--earth)', textTransform: 'uppercase', letterSpacing: '0.35em', marginBottom: 16 }}>My Account</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8, marginBottom: 32 }}>
            {ACCOUNT_ITEMS.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setHubOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'rgba(3,65,26,0.03)', border: '1px solid rgba(3,65,26,0.08)', borderRadius: 14, textDecoration: 'none', transition: 'all 0.2s', backdropFilter: 'blur(8px)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(3,65,26,0.06)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(3,65,26,0.03)'; }}
              >
                <div style={{ color: 'var(--earth)', flexShrink: 0 }}><item.Icon /></div>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--forest)', flex: 1 }}>{item.label}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>→</span>
              </Link>
            ))}
          </div>

          {/* Download + WhatsApp row */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 20, borderTop: '1px solid rgba(3,65,26,0.08)', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: 5 }}>Apps:</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'var(--forest)', color: '#fff', borderRadius: 10, fontSize: '0.68rem', fontWeight: 700, textDecoration: 'none' }}><Ic.Apple /> iOS</a>
              <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'var(--forest)', color: '#fff', borderRadius: 10, fontSize: '0.68rem', fontWeight: 700, textDecoration: 'none' }}><Ic.Android /> Android</a>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'rgba(37,211,102,0.12)', color: '#25D366', borderRadius: 10, fontSize: '0.68rem', fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(37,211,102,0.2)' }}><Ic.WA /> WhatsApp</a>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .nav-link { color: var(--text-2); background: transparent; }
        .nav-link.active { color: var(--forest); background: rgba(3,65,26,0.08); }
        .nav-link:hover { background: rgba(3,65,26,0.05); color: var(--forest); }
        .nav-link.is-light { color: rgba(255,255,255,0.75) !important; text-shadow: 0 1px 4px rgba(0,0,0,0.5); }
        .nav-link.is-light.active { color: #fff !important; background: rgba(255,255,255,0.2) !important; }
        .nav-link.is-light:hover { color: #fff !important; background: rgba(255,255,255,0.15) !important; }
        
        @media(max-width:860px){.nav-desktop-links{display:none!important}}
        @media(max-width:820px){.nav-app-badges{display:none!important}}
        @media(max-width:640px){.nav-bell-desktop{display:none!important}}
        @media(max-width:640px){
          .nav-hub-container { padding-top: calc(var(--nav-h) + 16px) !important; }
        }
        @keyframes menuOrb1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,-30px) scale(1.1)}}
        @keyframes menuOrb2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-30px,25px) scale(1.08)}}
      `}</style>
    </>
  );
}
