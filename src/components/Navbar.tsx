'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';
import { useQuery } from '@tanstack/react-query';
import { getNotifications, getShopProducts } from '@/lib/api';
import { APP_STORE_URL, PLAY_STORE_URL } from '@/lib/appLinks';
import { SHOP_ENABLED } from '@/lib/features';

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
  Map: () =><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  Help: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  WA: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>,
  Logout: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  Wallet: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M22 10h-5a2 2 0 0 0 0 4h5" /></svg>,
};

const NAV_ITEMS = [
  { href: '/', label: 'Home', Icon: Ic.Home, color: '#2f6b47' },
  { href: '/plans', label: 'Plans', Icon: Ic.Plans, color: '#123824' },
  { href: '/services', label: 'Services', Icon: Ic.Book, color: '#5a8f3c' },
  { href: '/book', label: 'Book Visit', Icon: Ic.Cal, color: '#96794f' },
  // Plant Store disabled for now (see SHOP_ENABLED in lib/features).
  ...(SHOP_ENABLED ? [{ href: '/shop', label: 'Plant Store', Icon: Ic.Shop, color: '#2f6b47' }] : []),
  { href: '/plantopedia', label: 'AI Care', Icon: Ic.Leaf, color: '#1d4a31' },
  { href: '/about', label: 'About Us', Icon: Ic.Help, color: '#123824' },
];

const ACCOUNT_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', Icon: Ic.Dash },
  { href: '/bookings', label: 'My Bookings', Icon: Ic.Cal },
  { href: '/subscriptions', label: 'My Plans', Icon: Ic.Bookmark },
  { href: '/wallet', label: 'Wallet', Icon: Ic.Wallet },
  ...(SHOP_ENABLED ? [{ href: '/shop/orders', label: 'Shop Orders', Icon: Ic.Package }] : []),
  { href: '/notifications', label: 'Notifications', Icon: Ic.Bell },
  { href: '/profile', label: 'Profile & Addresses', Icon: Ic.Map },
  { href: '/complaints', label: 'Support & Help', Icon: Ic.Help },
];

export default function Navbar({ transparent: _transparent = false }: { transparent?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [hubOpen, setHubOpen] = useState(false);
  const [menuScrolled, setMenuScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hubOpen) setMenuScrolled(false);
  }, [hubOpen]);

  // Live search debounce
  const runSearch = useCallback((q: string) => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (!q.trim()) { setSearchResults([]); setSearchOpen(false); return; }
    searchDebounce.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data: any = await getShopProducts({ search: q.trim(), limit: 6 });
        const items = Array.isArray(data) ? data : (data?.data ?? []);
        setSearchResults(items.slice(0, 6));
        setSearchOpen(true);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 320);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (hubOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [hubOpen]);
  const searchRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/shop?search=${encodeURIComponent(q)}`);
      setSearchQuery('');
      setSearchOpen(false);
      setHubOpen(false);
    }
  };

  const goToProduct = (p: any) => {
    router.push(`/shop/${p.slug || p.id}`);
    setSearchQuery('');
    setSearchOpen(false);
    setHubOpen(false);
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


  const { data: notifs } = useQuery({ queryKey: ['notifs-nav'], queryFn: getNotifications, enabled: isAuthenticated, refetchInterval: 60_000 });
  const unread = ((notifs as any[]) ?? []).filter((n: any) => !n.is_read).length;
  const cartCount = totalItems();
  const showBg = scrolled && !hubOpen;
  const isLight = _transparent && !scrolled && !hubOpen;

  return (
    <>
      {/* ═══ TOPBAR ═══ */}
      <nav className={`gk-nav${isLight ? ' on-dark' : ''}${showBg ? ' is-scrolled' : ''}${hubOpen ? ' hub-open' : ''}${hubOpen && menuScrolled ? ' hub-scrolled' : ''}`}>
        <div className="container">
         <div className="gk-nav-bar">
          <Link href="/" className="gk-nav-logo" aria-label="GharKaMali home">
            <img src="/logo-dark.png" alt="GharKaMali" style={{ filter: isLight ? 'brightness(0) invert(1)' : 'none' }} />
          </Link>

          {/* Desktop nav */}
          <div className="nav-desktop-links" style={{ display: hubOpen ? 'none' : 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center', minWidth: 0, overflow: 'hidden' }}>
            {NAV_ITEMS.map(item => (
              <Link key={item.href} href={item.href} className={`nav-link ${isLight ? 'is-light' : ''} ${pathname === item.href ? 'active' : ''}`}>{item.label}</Link>
            ))}
            {/* Green Makeover CTA pill */}
            <Link
              href="/green-makeover"
              className={`nav-gm-pill${pathname === '/green-makeover' ? ' active' : ''}`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              </svg>
              Green Makeover
            </Link>
          </div>

          {/* Desktop search bar */}
          <div ref={searchWrapRef} className="nav-search-wrap" style={{ position: 'relative', display: hubOpen ? 'none' : 'flex', alignItems: 'center', flexShrink: 0 }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 11, color: isLight ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', pointerEvents: 'none', zIndex: 1 }}>
                {searchLoading
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="9" strokeDasharray="40" strokeDashoffset="10"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                }
              </span>
              <input
                ref={searchRef}
                type="search"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); runSearch(e.target.value); }}
                onKeyDown={e => { if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); } }}
                placeholder="Search plants, tools…"
                className="nav-search-input"
                aria-label="Search"
                autoComplete="off"
                style={{ background: isLight ? 'rgba(255,255,255,0.15)' : 'rgba(3,65,26,0.06)', border: `1.5px solid ${isLight ? 'rgba(255,255,255,0.3)' : 'var(--border-mid)'}`, borderRadius: 99, padding: '8px 16px 8px 34px', fontSize: '0.82rem', color: isLight ? '#fff' : 'var(--text)', outline: 'none', width: 150, transition: 'all 0.3s', fontFamily: 'var(--font-body)', backdropFilter: isLight ? 'blur(8px)' : 'none' }}
                onFocus={e => { e.currentTarget.style.width = '220px'; e.currentTarget.style.borderColor = isLight ? '#fff' : 'var(--forest)'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = 'var(--forest)'; if (searchQuery && searchResults.length > 0) setSearchOpen(true); }}
                onBlur={e => { e.currentTarget.style.width = '150px'; e.currentTarget.style.borderColor = isLight ? 'rgba(255,255,255,0.3)' : 'var(--border-mid)'; e.currentTarget.style.background = isLight ? 'rgba(255,255,255,0.15)' : 'rgba(3,65,26,0.06)'; e.currentTarget.style.color = isLight ? '#fff' : 'var(--text)'; }}
              />
            </form>
            {/* Instant search dropdown */}
            {searchOpen && searchResults.length > 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 340, background: '#fff', borderRadius: 18, boxShadow: '0 16px 60px rgba(3,65,26,0.18), 0 4px 20px rgba(0,0,0,0.08)', border: '1px solid rgba(3,65,26,0.1)', overflow: 'hidden', zIndex: 3000 }}>
                {searchResults.map((p, i) => {
                  const price = Number(p.price);
                  const mrp = Number(p.mrp);
                  const disc = mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
                  return (
                    <button key={p.id} onMouseDown={() => goToProduct(p)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 14px', background: 'none', border: 'none', borderBottom: i < searchResults.length - 1 ? '1px solid rgba(3,65,26,0.06)' : 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s', fontFamily: 'var(--font-body)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(3,65,26,0.04)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg,#f0f7f2,#e8f5ed)', flexShrink: 0, overflow: 'hidden', border: '1px solid rgba(3,65,26,0.08)' }}>
                        {p.images?.[0] || p.thumbnail
                          ? <img src={p.images?.[0] || p.thumbnail} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                          : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--forest)', opacity: 0.3 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg></div>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--forest)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--earth)', fontWeight: 600, marginTop: 1 }}>{typeof p.category === 'string' ? p.category : p.category?.name || 'General'}</div>
                      </div>
                      <div style={{ flexShrink: 0, textAlign: 'right' }}>
                        <div style={{ fontWeight: 900, fontSize: '0.85rem', color: 'var(--forest)' }}>₹{price.toLocaleString('en-IN')}</div>
                        {disc > 0 && <div style={{ fontSize: '0.6rem', color: '#16a34a', fontWeight: 800, background: '#dcfce7', borderRadius: 99, padding: '1px 6px', marginTop: 2 }}>{disc}% off</div>}
                      </div>
                    </button>
                  );
                })}
                <button onMouseDown={() => { const q = searchQuery.trim(); if (q) { router.push(`/shop?search=${encodeURIComponent(q)}`); setSearchQuery(""); setSearchOpen(false); setHubOpen(false); } }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '10px 14px', background: 'rgba(3,65,26,0.04)', border: 'none', borderTop: '1px solid rgba(3,65,26,0.08)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.78rem', color: 'var(--forest)', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(3,65,26,0.08)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(3,65,26,0.04)'}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  See all results for &quot;{searchQuery}&quot;
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {!hubOpen && (
              <div className="nav-app-badges" style={{ display: 'flex', gap: 6 }}>
                <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="gk-nav-badge" title="Download on the App Store" aria-label="Download on the App Store"><Ic.Apple /> App Store</a>
                <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="gk-nav-badge" title="Get it on Google Play" aria-label="Get it on Google Play"><Ic.Android /> Play Store</a>
              </div>
            )}
            {!hubOpen && SHOP_ENABLED && (
              <button onClick={openCart} aria-label="Cart" className="gk-nav-icon">
                <Ic.Cart />
                {cartCount > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--lime)', color: 'var(--ink)', width: 17, height: 17, borderRadius: '50%', fontSize: '0.62rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>{cartCount}</span>}
              </button>
            )}
            {!hubOpen && isAuthenticated && (
              <Link href="/notifications" className="nav-bell-desktop gk-nav-icon">
                <Ic.Bell />
                {unread > 0 && <span style={{ position: 'absolute', top: 9, right: 9, width: 7, height: 7, background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }} />}
              </Link>
            )}
            <button onClick={() => setHubOpen(!hubOpen)} aria-label={hubOpen ? 'Close' : 'Menu'} aria-expanded={hubOpen} className={`gk-nav-menu${hubOpen ? ' open' : ''}`}>
              {hubOpen ? <Ic.Close /> : <Ic.Menu />}
            </button>
          </div>
         </div>
        </div>
      </nav>

      {/* ═══ FULLSCREEN MENU OVERLAY ═══ */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1900,
        height: '100dvh',
        opacity: hubOpen ? 1 : 0, visibility: hubOpen ? 'visible' : 'hidden',
        transition: 'opacity 0.45s cubic-bezier(0.22,1,0.36,1), visibility 0.45s',
        background: "url('/fx/contours-dark.svg') center / cover no-repeat, linear-gradient(160deg, #f5f9f4 0%, #e4f1e8 100%)",
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch' as any,
      }}
      onScroll={(e) => setMenuScrolled(e.currentTarget.scrollTop > 20)}
      >
        <div className="container nav-hub-container" style={{ position: 'relative', zIndex: 10, paddingTop: 'calc(var(--nav-h) + 32px)', paddingBottom: 60 }}>
          {/* Auth pill */}
          <div style={{ marginBottom: 36, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {isAuthenticated && user ? (
              <>
                <Link href="/dashboard" onClick={() => setHubOpen(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(3,65,26,0.04)', border: '1px solid rgba(3,65,26,0.1)', borderRadius: 99, padding: '10px 22px 10px 10px', textDecoration: 'none', backdropFilter: 'blur(10px)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem' }}>
                    {(user as any)?.name?.[0]?.toUpperCase() || <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--forest)' }}>{(user as any)?.name || 'My Account'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--earth)', fontWeight: 600 }}>View Dashboard →</div>
                  </div>
                </Link>
                <button onClick={() => { setHubOpen(false); logout(); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(220,38,38,0.06)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 99, padding: '11px 22px', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem', fontFamily: 'var(--font-body)', transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(220,38,38,0.12)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(220,38,38,0.06)'}
                >
                  <Ic.Logout /> Logout
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setHubOpen(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--forest)', color: '#fff', borderRadius: 99, padding: '12px 30px', textDecoration: 'none', fontWeight: 800, fontSize: '0.88rem', boxShadow: '0 8px 32px rgba(3,65,26,0.4)' }}>
                Sign In / Create Account
              </Link>
            )}
          </div>

          {/* Search bar inside menu — visible on all devices */}
          <form onSubmit={handleSearch} style={{ marginBottom: searchOpen && searchResults.length > 0 ? 0 : 28, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', pointerEvents: 'none', zIndex: 1 }}>
              {searchLoading
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="9" strokeDasharray="40" strokeDashoffset="10"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              }
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); runSearch(e.target.value); }}
              onKeyDown={e => { if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); } }}
              placeholder="Search plants, tools, products…"
              style={{ width: '100%', padding: '13px 16px 13px 44px', background: 'rgba(3,65,26,0.05)', border: '1.5px solid rgba(3,65,26,0.12)', borderRadius: searchOpen && searchResults.length > 0 ? '16px 16px 0 0' : 16, fontSize: '0.92rem', color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-body)', transition: 'border-color 0.25s, background 0.25s', boxSizing: 'border-box' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--forest)'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(3,65,26,0.08)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(3,65,26,0.12)'; e.currentTarget.style.background = 'rgba(3,65,26,0.05)'; e.currentTarget.style.boxShadow = 'none'; }}
              aria-label="Search"
              autoComplete="off"
            />
            {searchQuery && !searchLoading && (
              <button type="submit" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 10, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                Go
              </button>
            )}
          </form>
          {/* Inline results inside menu */}
          {searchOpen && searchResults.length > 0 && (
            <div style={{ background: '#fff', border: '1.5px solid var(--forest)', borderTop: 'none', borderRadius: '0 0 16px 16px', overflow: 'hidden', marginBottom: 20, boxShadow: '0 8px 32px rgba(3,65,26,0.12)' }}>
              {searchResults.map((p, i) => {
                const price = Number(p.price);
                const mrp = Number(p.mrp);
                const disc = mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
                return (
                  <button key={p.id} onMouseDown={() => goToProduct(p)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 16px', background: 'none', border: 'none', borderBottom: i < searchResults.length - 1 ? '1px solid rgba(3,65,26,0.06)' : 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(3,65,26,0.04)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
                  >
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: 'linear-gradient(135deg,#f0f7f2,#e8f5ed)', flexShrink: 0, overflow: 'hidden', border: '1px solid rgba(3,65,26,0.08)' }}>
                      {p.images?.[0] || p.thumbnail
                        ? <img src={p.images?.[0] || p.thumbnail} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--forest)', opacity: 0.3 }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg></div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--forest)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--earth)', fontWeight: 600, marginTop: 2 }}>{typeof p.category === 'string' ? p.category : p.category?.name || 'General'}</div>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <div style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--forest)' }}>₹{price.toLocaleString('en-IN')}</div>
                      {disc > 0 && <div style={{ fontSize: '0.62rem', color: '#16a34a', fontWeight: 800, background: '#dcfce7', borderRadius: 99, padding: '1px 6px', marginTop: 2 }}>{disc}% off</div>}
                    </div>
                  </button>
                );
              })}
              <button onMouseDown={() => { const q = searchQuery.trim(); if (q) { router.push(`/shop?search=${encodeURIComponent(q)}`); setSearchQuery(""); setSearchOpen(false); setHubOpen(false); } }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '12px 16px', background: 'rgba(3,65,26,0.04)', border: 'none', borderTop: '1px solid rgba(3,65,26,0.08)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.82rem', color: 'var(--forest)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(3,65,26,0.08)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(3,65,26,0.04)'}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                See all results for &quot;{searchQuery}&quot;
              </button>
            </div>
          )}

          {/* ── GREEN MAKEOVER FEATURE CARD ── */}
          <Link
            href="/green-makeover"
            onClick={() => setHubOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 20,
              background: "url('/fx/contours-light.svg') center / cover no-repeat, linear-gradient(135deg, #102a1c 0%, #153a26 55%, #1d4a31 100%)",
              borderRadius: 24, padding: '20px 24px',
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
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '1.3rem', color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.2 }}>Green Makeover</div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500, marginTop: 4 }}>Plant setups from ₹20,000</div>
            </div>
            {/* Arrow + badge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0, position: 'relative', zIndex: 1 }}>
              <div style={{ background: 'var(--lime)', color: 'var(--ink)', fontSize: '0.6rem', fontWeight: 800, padding: '4px 10px', borderRadius: 99, whiteSpace: 'nowrap', letterSpacing: '0.06em' }}>₹399 Visit</div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </div>
          </Link>

          {/* Section label */}
          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--leaf)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: 20 }}>Navigate</div>

          {/* ── EXPLORE TILES (2-col grid of large tiles) ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '?');
              return (
                <Link key={item.href} href={item.href} onClick={() => setHubOpen(false)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    gap: 10, padding: '18px 20px',
                    background: isActive ? 'linear-gradient(135deg, #102a1c, #1d4a31)' : 'linear-gradient(135deg, rgba(255,255,255,0.85), rgba(228,241,232,0.5))',
                    border: `1.2px solid ${isActive ? 'rgba(143,217,174,0.35)' : 'rgba(255,255,255,0.9)'}`,
                    boxShadow: '0 8px 20px rgba(18,56,36,0.06)',
                    borderRadius: 22, textDecoration: 'none', transition: 'transform 0.25s, background 0.25s',
                    minHeight: 90,
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isActive ? 'linear-gradient(135deg, #102a1c, #1d4a31)' : 'linear-gradient(135deg, rgba(255,255,255,0.85), rgba(228,241,232,0.5))'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
                >
                  <div className={`v-orb ${isActive ? 'v-orb-lime' : ''}`} style={{ ['--s' as any]: '40px' }}>
                    <item.Icon />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isActive ? '#fff' : 'var(--ink)', lineHeight: 1.2 }}>{item.label}</div>
                    {isActive && <div style={{ fontSize: '0.65rem', color: 'var(--lime)', fontWeight: 700, marginTop: 2 }}>● Active</div>}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ── ACCOUNT TILES ── */}
          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--leaf)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: 16 }}>My Account</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8, marginBottom: 32 }}>
            {ACCOUNT_ITEMS.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setHubOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px 10px 10px', background: 'rgba(255,255,255,0.7)', border: '1.2px solid rgba(255,255,255,0.9)', borderRadius: 18, textDecoration: 'none', transition: 'background 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.7)'; }}
              >
                <div className="v-orb" style={{ ['--s' as any]: '34px' }}><item.Icon /></div>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--forest)', flex: 1 }}>{item.label}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>→</span>
              </Link>
            ))}
          </div>

          {/* Download + WhatsApp row */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 20, paddingBottom: 20, borderTop: '1px solid rgba(3,65,26,0.08)', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: 5 }}>Apps:</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'var(--forest)', color: '#fff', borderRadius: 10, fontSize: '0.68rem', fontWeight: 700, textDecoration: 'none' }}><Ic.Apple /> iOS</a>
              <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'var(--forest)', color: '#fff', borderRadius: 10, fontSize: '0.68rem', fontWeight: 700, textDecoration: 'none' }}><Ic.Android /> Android</a>
              <a href="https://wa.me/919643701701" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'rgba(37,211,102,0.12)', color: '#25D366', borderRadius: 10, fontSize: '0.68rem', fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(37,211,102,0.2)' }}><Ic.WA /> WhatsApp</a>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media(max-width:860px){.nav-desktop-links{display:none!important}}
        @media(max-width:359px){.nav-app-badges{display:none!important}}
        @media(max-width:640px){.nav-bell-desktop{display:none!important}}
        @media(max-width:640px){
          .nav-hub-container { padding-top: calc(var(--nav-h) + 16px) !important; }
        }
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>
    </>
  );
}
