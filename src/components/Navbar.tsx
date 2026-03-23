'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';
import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '@/lib/api';

/* ── Icons ── */
const IcMenu    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IcClose   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcBell    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcCart    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const IcCalPen  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcShop    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const IcBrain   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14zm5 0A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14z"/></svg>;
const IcBlog    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IcPlans   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IcGrid    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IcWallet  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>;
const IcUser    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcLogout  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcArrow   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcStar    = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="#C9A84C"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;

const NAV_LINKS = [
  { href: '/plans',       label: 'Plans',     Icon: IcPlans  },
  { href: '/shop',        label: 'Shop',      Icon: IcShop   },
  { href: '/plantopedia', label: 'AI Plants', Icon: IcBrain  },
  { href: '/blogs',       label: 'Blog',      Icon: IcBlog   },
];

const PROFILE_MENU = [
  { href: '/dashboard',     label: 'Dashboard',     Icon: IcGrid,   desc: 'Your overview' },
  { href: '/bookings',      label: 'My Bookings',   Icon: IcCalPen, desc: 'Track visits' },
  { href: '/subscriptions', label: 'Subscriptions', Icon: IcPlans,  desc: 'Active plans' },
  { href: '/wallet',        label: 'Wallet',        Icon: IcWallet, desc: 'Balance & topup' },
  { href: '/profile',       label: 'Profile',       Icon: IcUser,   desc: 'Account settings' },
];

function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <div className="logo-mark" style={{ width: size, height: size, borderRadius: Math.round(size * 0.27) }}>
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none" style={{ position: 'relative', zIndex: 1 }}>
        <path d="M12 3C9.5 3 6 6 6 10c0 5 6 11 6 11s6-6 6-11c0-4-3.5-7-6-7z" fill="rgba(255,255,255,0.92)"/>
        <path d="M12 7c-1.2 1.5-1.8 3-1.8 3.8 0 1.2.8 2 1.8 2.4.9-.4 1.8-1.2 1.8-2.4 0-0.8-.6-2.3-1.8-3.8z" fill="#C9A84C"/>
      </svg>
    </div>
  );
}

export default function Navbar({ transparent = false }: { transparent?: boolean }) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, openCart } = useCart();

  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => { setMobileOpen(false); setProfileOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const { data: notifs } = useQuery({ queryKey: ['notifs-nav'], queryFn: getNotifications, enabled: isAuthenticated, refetchInterval: 60_000 });
  const unread    = ((notifs as any[]) ?? []).filter((n: any) => !n.is_read).length;
  const cartCount = totalItems();

  const isGlass  = transparent && !scrolled && !mobileOpen;
  const navBg    = isGlass ? 'transparent' : 'rgba(250,247,240,0.92)';
  const shadow   = isGlass ? 'none' : '0 1px 0 rgba(11,61,46,0.07), 0 4px 28px rgba(11,61,46,0.06)';
  const lc       = isGlass ? 'rgba(255,255,255,0.80)' : 'var(--text-2)';
  const lh       = isGlass ? 'rgba(255,255,255,0.10)' : 'rgba(11,61,46,0.06)';
  const logoCol  = isGlass ? '#fff' : 'var(--forest)';

  return (
    <>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 900, height: 'var(--nav-h)', display: 'flex', alignItems: 'center', background: navBg, backdropFilter: isGlass ? 'none' : 'blur(22px) saturate(180%)', WebkitBackdropFilter: isGlass ? 'none' : 'blur(22px) saturate(180%)', boxShadow: shadow, transition: 'background 0.4s ease, box-shadow 0.4s ease' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

            {/* Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0 }}>
              <LogoMark />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.08rem', color: logoCol, letterSpacing: '-0.01em', transition: 'color 0.3s', whiteSpace: 'nowrap' }}>Ghar Ka Mali</span>
            </Link>

            {/* Desktop nav links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 1 }} className="desktop-nav">
              {NAV_LINKS.map(({ href, label, Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link key={href} href={href}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 99, fontSize: '0.84rem', fontWeight: active ? 600 : 500, color: active ? (isGlass ? '#fff' : 'var(--forest)') : lc, background: active ? (isGlass ? 'rgba(255,255,255,0.12)' : 'rgba(11,61,46,0.07)') : 'transparent', textDecoration: 'none', transition: 'all 0.2s ease', letterSpacing: '0.01em' }}
                    onMouseEnter={e => { if (!active) { (e.currentTarget as any).style.background = lh; (e.currentTarget as any).style.color = isGlass ? '#fff' : 'var(--forest)'; } }}
                    onMouseLeave={e => { if (!active) { (e.currentTarget as any).style.background = 'transparent'; (e.currentTarget as any).style.color = lc; } }}>
                    <span style={{ opacity: active ? 1 : 0.55, display: 'flex' }}><Icon /></span>
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* Right actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>

              {/* Cart */}
              <button onClick={openCart}
                style={{ position: 'relative', width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer', background: isGlass ? 'rgba(255,255,255,0.09)' : 'transparent', color: isGlass ? '#fff' : 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = isGlass ? 'rgba(255,255,255,0.16)' : 'rgba(11,61,46,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = isGlass ? 'rgba(255,255,255,0.09)' : 'transparent')}>
                <IcCart />
                {cartCount > 0 && (
                  <span style={{ position: 'absolute', top: 0, right: 0, width: 17, height: 17, borderRadius: '50%', background: 'var(--gold)', color: 'var(--forest)', fontSize: '0.52rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid transparent', lineHeight: 1, boxShadow: '0 0 0 2px #fff' }}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              {isAuthenticated ? (
                <>
                  {/* Bell */}
                  <Link href="/notifications" style={{ position: 'relative', display: 'flex', textDecoration: 'none' }}>
                    <button
                      style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer', background: isGlass ? 'rgba(255,255,255,0.09)' : 'transparent', color: isGlass ? '#fff' : 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = isGlass ? 'rgba(255,255,255,0.16)' : 'rgba(11,61,46,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = isGlass ? 'rgba(255,255,255,0.09)' : 'transparent')}>
                      <IcBell />
                    </button>
                    {unread > 0 && (
                      <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: '50%', background: '#DC2626', border: '1.5px solid #fff' }} />
                    )}
                  </Link>

                  {/* Book CTA */}
                  <Link href="/book" className={`btn btn-sm ${isGlass ? 'btn-white' : 'btn-primary'}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <IcCalPen />
                    <span className="btn-label">Book Now</span>
                  </Link>

                  {/* Avatar + dropdown */}
                  <div ref={profileRef} style={{ position: 'relative' }}>
                    <button
                      onClick={() => setProfileOpen(p => !p)}
                      style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--forest)', border: `2.5px solid ${profileOpen ? 'var(--gold)' : isGlass ? 'rgba(255,255,255,0.32)' : 'rgba(201,168,76,0.55)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', overflow: 'hidden', padding: 0, boxShadow: profileOpen ? '0 0 0 3px rgba(201,168,76,0.25)' : 'none', transition: 'all 0.2s', flexShrink: 0 }}>
                      {user?.profile_image
                        ? <img src={user.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span>{user?.name?.[0]?.toUpperCase() ?? 'U'}</span>}
                    </button>

                    {/* Premium Dropdown */}
                    {profileOpen && (
                      <div className="nav-dropdown">
                        {/* Header — forest gradient */}
                        <div className="nav-dropdown-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.14)', border: '2px solid rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', flexShrink: 0, overflow: 'hidden' }}>
                              {user?.profile_image
                                ? <img src={user.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : user?.name?.[0]?.toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff', marginBottom: 2 }} className="truncate">{user?.name}</div>
                              <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.52)' }}>+91 {user?.phone}</div>
                            </div>
                          </div>
                          {user?.wallet_balance !== undefined && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, background: 'rgba(201,168,76,0.16)', border: '1px solid rgba(201,168,76,0.26)', borderRadius: 10, padding: '6px 12px', position: 'relative', zIndex: 1, width: 'fit-content' }}>
                              <IcWallet />
                              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gold-light)' }}>₹{user.wallet_balance?.toLocaleString('en-IN')}</span>
                              <div style={{ display: 'flex', gap: 1, marginLeft: 2 }}>
                                <IcStar /><IcStar /><IcStar /><IcStar /><IcStar />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Menu items */}
                        <div className="nav-dropdown-menu">
                          {PROFILE_MENU.map(item => (
                            <Link key={item.href} href={item.href} className="nav-dropdown-item">
                              <item.Icon />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text)', lineHeight: 1.2 }}>{item.label}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: 1 }}>{item.desc}</div>
                              </div>
                              <span style={{ opacity: 0.3 }}><IcArrow /></span>
                            </Link>
                          ))}
                          <div className="nav-dropdown-divider" />
                          <button onClick={logout} className="nav-dropdown-item" style={{ color: 'var(--err)', width: '100%' }}>
                            <IcLogout />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--err)', lineHeight: 1.2 }}>Sign Out</div>
                              <div style={{ fontSize: '0.7rem', color: 'rgba(220,38,38,0.55)', marginTop: 1 }}>Logout from account</div>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login"
                    style={{ padding: '7px 15px', borderRadius: 99, fontSize: '0.84rem', fontWeight: 500, color: isGlass ? 'rgba(255,255,255,0.85)' : 'var(--text-2)', border: `1px solid ${isGlass ? 'rgba(255,255,255,0.20)' : 'var(--border-mid)'}`, background: isGlass ? 'rgba(255,255,255,0.08)' : 'transparent', textDecoration: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => (e.currentTarget.style.background = isGlass ? 'rgba(255,255,255,0.15)' : 'var(--bg)')}
                    onMouseLeave={e => (e.currentTarget.style.background = isGlass ? 'rgba(255,255,255,0.08)' : 'transparent')}>
                    Sign In
                  </Link>
                  <Link href="/book" className={`btn btn-sm ${isGlass ? 'btn-primary' : 'btn-forest'}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <IcCalPen />
                    <span className="btn-label">Book Now</span>
                  </Link>
                </>
              )}

              {/* Hamburger */}
              <button onClick={() => setMobileOpen(p => !p)} id="hamburger"
                style={{ display: 'none', width: 38, height: 38, borderRadius: 10, border: 'none', background: isGlass ? 'rgba(255,255,255,0.09)' : 'var(--bg)', color: isGlass ? '#fff' : 'var(--text)', cursor: 'pointer', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                {mobileOpen ? <IcClose /> : <IcMenu />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 850, background: 'rgba(8,16,12,0.52)', backdropFilter: 'blur(6px)' }} onClick={() => setMobileOpen(false)}>
          <div style={{ position: 'absolute', top: 'var(--nav-h)', left: 0, right: 0, background: '#fff', borderBottom: '1px solid var(--border)', boxShadow: '0 16px 48px rgba(11,61,46,0.14)', padding: '12px 0 24px', animation: 'drawer-down 0.28s cubic-bezier(0.22,1,0.36,1)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '0 16px' }}>
              {NAV_LINKS.map(({ href, label, Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link key={href} href={href}
                    style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '13px 12px', borderRadius: 13, textDecoration: 'none', color: active ? 'var(--forest)' : 'var(--text-2)', fontWeight: active ? 600 : 500, fontSize: '0.93rem', background: active ? 'rgba(11,61,46,0.06)' : 'transparent', marginBottom: 4, transition: 'background 0.15s' }}>
                    <span style={{ opacity: 0.65, display: 'flex' }}><Icon /></span>
                    {label}
                    {active && <span style={{ marginLeft: 'auto', opacity: 0.4 }}><IcArrow /></span>}
                  </Link>
                );
              })}
            </div>
            <div style={{ height: 1, background: 'var(--border)', margin: '12px 16px' }} />
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {isAuthenticated ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'var(--bg)', borderRadius: 13 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1rem', overflow: 'hidden', flexShrink: 0 }}>
                      {user?.profile_image ? <img src={user.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }} className="truncate">{user?.name}</div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>+91 {user?.phone}</div>
                    </div>
                  </div>
                  <Link href="/dashboard" className="btn btn-forest" style={{ justifyContent: 'center' }}>Dashboard</Link>
                  <Link href="/book" className="btn btn-primary" style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <IcCalPen /> Book a Gardener
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn btn-outline" style={{ justifyContent: 'center' }}>Sign In</Link>
                  <Link href="/book" className="btn btn-forest" style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <IcCalPen /> Book a Gardener
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .desktop-nav { display: flex !important; }
        #hamburger   { display: none !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          #hamburger   { display: flex !important; }
          .btn-label   { display: none; }
        }
        @media (max-width: 480px) { .btn-label { display: none; } }
      `}</style>
    </>
  );
}
