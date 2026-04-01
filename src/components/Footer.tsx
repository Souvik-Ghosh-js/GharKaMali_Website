'use client';
import Link from 'next/link';

const IcArrow = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
const IcWhatsApp = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>;
const IcInsta = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" /></svg>;
const IcYT = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>;

const WA_URL = 'https://wa.me/919876543210?text=Hi%20GharKaMali!%20I%20want%20to%20book%20a%20gardener%20visit.';

const NAV_COLS = [
  {
    title: 'Services',
    links: [
      { href: '/plans', label: 'Subscription Plans' },
      { href: '/book', label: 'Book a Visit' },
      { href: '/shop', label: 'Marketplace' },
      { href: '/plantopedia', label: 'AI Plantopedia' },
      { href: '/blogs', label: 'Plant Journal' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/bookings', label: 'My Bookings' },
      { href: '/subscriptions', label: 'Subscriptions' },
      { href: '/wallet', label: 'Wallet' },
      { href: '/profile', label: 'Profile' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '/complaints', label: 'Help Center' },
      { href: '/notifications', label: 'Notifications' },
      { href: '/shop/orders', label: 'Track Orders' },
      { href: '/login', label: 'Sign In' },
    ],
  },
];

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: '0.875rem',
      color: 'var(--sage)',
      textDecoration: 'none',
      padding: '5px 0',
      transition: 'color 0.25s',
      lineHeight: 1.6,
    }}
      onMouseEnter={e => (e.currentTarget.style.color = 'var(--earth)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'var(--sage)')}>
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)', opacity: 0.1, transition: 'opacity 0.25s', flexShrink: 0 }} />
      {label}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer style={{
      background: '#fff',
      borderTop: '1px solid var(--border)',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Ambient glow orbs */}
      <div style={{ position: 'absolute', bottom: -80, left: -60, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(11,61,46,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -100, right: -80, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(237,207,135,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Large watermark text (Light theme subtle) */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'var(--font-display)',
        fontWeight: 900,
        fontSize: 'clamp(4rem, 12vw, 10rem)',
        color: 'rgba(3,65,26,0.03)',
        letterSpacing: '-0.02em',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        userSelect: 'none',
        lineHeight: 1,
      }}>
        GHARKAMALI
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: 80, paddingBottom: 0 }}>

        {/* Top: CTA strip */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '40px 48px',
          background: 'var(--bg-elevated)',
          borderRadius: 32,
          border: '1px solid var(--border-gold)',
          marginBottom: 64,
          flexWrap: 'wrap',
          gap: 24,
          boxShadow: 'var(--sh-sm)'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--earth)', fontFamily: 'var(--font-mono)', fontWeight: 800, marginBottom: 8 }}>Ready to start?</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: 'var(--forest)', margin: 0 }}>
              Your garden deserves <em style={{ color: 'var(--earth)', fontStyle: 'normal' }}>the best</em>
            </h3>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/book" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 36px' }}>
              Book Now <IcArrow />
            </Link>
            <a href={WA_URL} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 36px', background: '#fff', border: '2px solid var(--gold)', borderRadius: 99, fontSize: '0.9rem', fontWeight: 800, color: 'var(--forest)', textDecoration: 'none', transition: 'all 0.3s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
              <IcWhatsApp /> WhatsApp Us
            </a>
          </div>
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 64 }}>

          {/* Brand column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <Link href="/">
                <img src="/logo.png" alt="GharKaMali" style={{ width: 64, height: 64, objectFit: 'contain' }} />
              </Link>
            </div>

            <p style={{ color: 'var(--sage)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: 28, maxWidth: 300 }}>
              Redefining home gardening with realistic, professional plant care. Certified malis, modern tracking, and guaranteed growth.
            </p>

            {/* Socials */}
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { Icon: IcInsta, href: '#', label: 'Instagram' },
                { Icon: IcYT, href: '#', label: 'YouTube' },
                { Icon: IcWhatsApp, href: WA_URL, label: 'WhatsApp' },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', transition: 'all 0.3s' }}
                  onMouseEnter={e => { (e.currentTarget.style.background = 'var(--bg-elevated)'); (e.currentTarget.style.borderColor = 'var(--gold)'); (e.currentTarget.style.transform = 'translateY(-4px)'); }}
                  onMouseLeave={e => { (e.currentTarget.style.background = 'var(--bg)'); (e.currentTarget.style.borderColor = 'var(--border)'); (e.currentTarget.style.transform = ''); }}>
                  <s.Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {NAV_COLS.map(col => (
            <div key={col.title}>
              <div style={{
                fontSize: '0.7rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 800,
                color: 'var(--forest)',
                fontFamily: 'var(--font-mono)',
                marginBottom: 24,
              }}>{col.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {col.links.map(l => <FooterLink key={l.href} href={l.href} label={l.label} />)}
              </div>
            </div>
          ))}
        </div>

        {/* Divider line */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent 0%, var(--border-mid) 50%, transparent 100%)', marginBottom: 40 }} />

        {/* Bottom bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            &copy; {new Date().getFullYear()} GharKaMali. Redefining Botanicals.
          </span>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', boxShadow: '0 0 10px rgba(22,163,74,0.4)', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Operational in Noida & G. Noida</span>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Built by <strong style={{ color: 'var(--forest)', fontWeight: 800 }}>Gobt</strong>
            </span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse-dot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(1.2); } }
        @media (max-width: 1024px) {
          footer .container > div[style*="grid-template-columns: 2fr 1fr 1fr 1fr"] {
            grid-template-columns: 1fr 1fr !important;
            gap: 40px !important;
          }
        }
        @media (max-width: 640px) {
          footer .container > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
          footer .container > div[style*="justify-content: space-between"] {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
