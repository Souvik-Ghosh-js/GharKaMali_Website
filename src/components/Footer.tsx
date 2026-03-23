import Link from 'next/link';

const IcApple  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.22 1.3-2.2 3.88.03 3.02 2.65 4.03 2.68 4.04l-.03.11zm-7.46-14.8c.39-1.6 1.6-2.83 2.72-3.42.04.01-.01 0 0 0-1.1 1.63-1.43 3.39-.9 4.94-.59-.15-1.82-.77-1.82-1.52z"/></svg>;
const IcPlay   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5v-17c0-.83 1.04-1.26 1.67-.64l13 8.5c.51.33.51 1.07 0 1.4l-13 8.5c-.63.62-1.67.19-1.67-.76z"/></svg>;

export default function Footer() {
  return (
    <footer className="footer">
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, overflow: 'hidden', pointerEvents: 'none', opacity: 0.05 }}>
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path d="M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,0 L0,0 Z" fill="#C9A84C"/>
        </svg>
      </div>

      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div className="logo-mark" style={{ width: 36, height: 36, borderRadius: 9 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ position: 'relative', zIndex: 1 }}>
                  <path d="M12 3C9.5 3 6 6 6 10c0 5 6 11 6 11s6-6 6-11c0-4-3.5-7-6-7z" fill="rgba(255,255,255,0.9)"/>
                  <path d="M12 7c-1.2 1.5-1.8 3-1.8 3.8 0 1.2.8 2 1.8 2.4.9-.4 1.8-1.2 1.8-2.4C13.8 10 13.2 8.5 12 7z" fill="#C9A84C"/>
                </svg>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.08rem', color: '#fff' }}>Ghar Ka Mali</span>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.8, maxWidth: 280, marginBottom: 24, color: 'rgba(255,255,255,0.52)' }}>
              Expert garden care delivered to your doorstep. Book certified gardeners, identify plants with AI, and shop premium garden products.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { Icon: IcApple, label: 'App Store',  href: '#' },
                { Icon: IcPlay,  label: 'Play Store', href: '#' },
              ].map(a => (
                <a key={a.label} href={a.href} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 13px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 9, fontSize: '0.76rem', fontWeight: 600, color: 'rgba(255,255,255,0.78)', transition: 'background 0.2s', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.11)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
                  <a.Icon />
                  {a.label}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <div className="footer-title">Services</div>
            {['Plant Watering', 'Pruning & Trimming', 'Lawn Mowing', 'Pest Control', 'Fertilization', 'Seasonal Planting'].map(s => (
              <span key={s} className="footer-link">{s}</span>
            ))}
          </div>

          {/* Company */}
          <div>
            <div className="footer-title">Company</div>
            {[
              { href: '/plans',      l: 'Pricing' },
              { href: '/shop',       l: 'Shop' },
              { href: '/blogs',      l: 'Blog' },
              { href: '/plantopedia',l: 'AI Plantopedia' },
            ].map(({ href, l }) => (
              <Link key={href} href={href} className="footer-link">{l}</Link>
            ))}
          </div>

          {/* Support */}
          <div>
            <div className="footer-title">Support</div>
            {[
              { href: '/complaints', l: 'Help Center' },
              { href: '/profile',    l: 'My Account' },
              { href: '/wallet',     l: 'Wallet' },
              { href: '/bookings',   l: 'My Bookings' },
            ].map(({ href, l }) => (
              <Link key={href} href={href} className="footer-link">{l}</Link>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Ghar Ka Mali. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 8px rgba(74,222,128,0.6)' }} />
              <span style={{ fontSize: '0.71rem', color: 'rgba(255,255,255,0.38)' }}>All systems operational</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
            <span>Built by <strong style={{ color: 'rgba(255,255,255,0.65)' }}>Gobt</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
