'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';

const TABS = [
  { id: 'terms', label: 'Terms & Conditions' },
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'gardener', label: 'Gardener App Terms' },
];

const Section = ({ num, title, children }: { num: string; title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 40, paddingBottom: 40, borderBottom: '1px solid var(--border)' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
      <span style={{ flexShrink: 0, width: 36, height: 36, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900 }}>{num}</span>
      <h2 style={{ color: 'var(--forest)', fontSize: '1.2rem', fontWeight: 800, margin: 0, paddingTop: 6 }}>{title}</h2>
    </div>
    <div style={{ paddingLeft: 52 }}>{children}</div>
  </div>
);

const Bullet = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
    <span style={{ flexShrink: 0, width: 6, height: 6, borderRadius: '50%', background: 'var(--earth)', marginTop: 7 }} />
    <span style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.7 }}>{children}</span>
  </div>
);

const Para = ({ children }: { children: React.ReactNode }) => (
  <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: 12 }}>{children}</p>
);

export default function TermsPage() {
  const [active, setActive] = useState('terms');

  return (
    <SmoothScrollProvider>
      <Navbar />

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, var(--forest) 0%, #065e28 100%)', padding: 'clamp(80px,12vw,140px) 0 clamp(48px,7vw,80px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 99, padding: '6px 20px', marginBottom: 20 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(201,168,76,0.9)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Legal Documents</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(2rem,5vw,3.4rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 16, lineHeight: 1.15 }}>
            Terms, Privacy &amp; Policies
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', maxWidth: 520, margin: '0 auto', lineHeight: 1.8 }}>
            Please read these documents carefully. By using GharKaMali services, you agree to all terms listed here.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: 16 }}>Effective Date: May 2025</p>
        </div>
      </section>

      {/* Tab Bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: '#fff', borderBottom: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div className="container" style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              style={{
                padding: '16px 28px',
                fontWeight: 700,
                fontSize: '0.88rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                color: active === tab.id ? 'var(--forest)' : 'var(--text-2)',
                borderBottom: active === tab.id ? '2.5px solid var(--forest)' : '2.5px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <section style={{ background: 'var(--bg)', padding: 'clamp(40px,6vw,80px) 0 clamp(60px,8vw,100px)' }}>
        <div className="container" style={{ maxWidth: 860 }}>

          {/* ── TERMS & CONDITIONS ── */}
          {active === 'terms' && (
            <div>
              <div style={{ marginBottom: 40 }}>
                <h1 style={{ color: 'var(--forest)', fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 900, marginBottom: 8 }}>Terms &amp; Conditions</h1>
                <p style={{ color: 'var(--sage)', fontSize: '0.88rem' }}>Effective Date: May 2025 &nbsp;·&nbsp; GharKaMali (GKM)</p>
                <Para>Welcome to GharKaMali ("Company", "we", "our", "us"). By accessing our website, mobile application, or services, you agree to be bound by these Terms.</Para>
              </div>

              <Section num="1" title="Services">
                <Para>GharKaMali provides gardening services including:</Para>
                <Bullet>Plant supply and installation</Bullet>
                <Bullet>Gardening maintenance subscriptions</Bullet>
                <Bullet>One-time gardening visits</Bullet>
                <Bullet>Landscaping and setup projects</Bullet>
              </Section>

              <Section num="2" title="User Responsibilities">
                <Bullet>Provide accurate address and contact details</Bullet>
                <Bullet>Ensure safe working conditions for gardeners</Bullet>
                <Bullet>Provide access to water/electricity (if required)</Bullet>
                <Bullet>Avoid misuse of services</Bullet>
              </Section>

              <Section num="3" title="Booking & Payments">
                <Bullet>All bookings must be prepaid unless agreed otherwise</Bullet>
                <Bullet>Prices may vary based on scope and location</Bullet>
                <Bullet>Subscription plans are billed monthly/quarterly</Bullet>
              </Section>

              <Section num="4" title="Cancellation & Refund Policy">
                <Bullet>Cancellation allowed up to 12 hours before service</Bullet>
                <Bullet>Refunds processed within 5–7 working days</Bullet>
                <Bullet>No refund for completed services</Bullet>
              </Section>

              <Section num="5" title="Service Limitations">
                <Bullet>Plant survival depends on customer care and environment</Bullet>
                <Bullet>We are not liable for plant damage due to neglect, weather, or pests</Bullet>
                <Bullet>Gardener services are limited to agreed scope</Bullet>
              </Section>

              <Section num="6" title="Liability">
                <Para>GharKaMali is not responsible for:</Para>
                <Bullet>Damage due to misuse of tools/products</Bullet>
                <Bullet>Pre-existing plant conditions</Bullet>
                <Bullet>External environmental factors</Bullet>
              </Section>

              <Section num="7" title="Intellectual Property">
                <Para>All content, branding, and materials belong to GharKaMali. Unauthorized reproduction or use is strictly prohibited.</Para>
              </Section>

              <Section num="8" title="Termination">
                <Para>We reserve the right to suspend services for misuse, non-payment, or policy violations.</Para>
              </Section>

              <Section num="9" title="Governing Law">
                <Para>These terms are governed by Indian laws. Jurisdiction: Noida, Uttar Pradesh.</Para>
              </Section>

              <Section num="10" title="Contact">
                <Bullet>📞 +91 96437 01701</Bullet>
                <Bullet>🌐 www.gharkamali.com</Bullet>
              </Section>
            </div>
          )}

          {/* ── PRIVACY POLICY ── */}
          {active === 'privacy' && (
            <div>
              <div style={{ marginBottom: 40 }}>
                <h1 style={{ color: 'var(--forest)', fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 900, marginBottom: 8 }}>Privacy Policy</h1>
                <p style={{ color: 'var(--sage)', fontSize: '0.88rem' }}>Effective Date: May 2025 &nbsp;·&nbsp; GharKaMali (GKM)</p>
                <Para>GharKaMali respects your privacy and is committed to protecting your personal data.</Para>
              </div>

              <Section num="1" title="Information We Collect">
                <Bullet>Name, phone number, email</Bullet>
                <Bullet>Address / location</Bullet>
                <Bullet>Payment details (processed via secure gateways)</Bullet>
                <Bullet>App usage data</Bullet>
              </Section>

              <Section num="2" title="How We Use Data">
                <Bullet>Service booking &amp; delivery</Bullet>
                <Bullet>Customer support</Bullet>
                <Bullet>Improving services</Bullet>
                <Bullet>Marketing (only with your consent)</Bullet>
              </Section>

              <Section num="3" title="Data Sharing">
                <Para>We do <strong style={{ color: 'var(--forest)' }}>NOT</strong> sell your data. We may share with:</Para>
                <Bullet>Gardeners (for service fulfillment only)</Bullet>
                <Bullet>Payment gateways</Bullet>
                <Bullet>Legal authorities if required by law</Bullet>
              </Section>

              <Section num="4" title="Data Security">
                <Para>We use secure servers and encryption to protect your personal data at all times.</Para>
              </Section>

              <Section num="5" title="User Rights">
                <Para>You have the right to:</Para>
                <Bullet>Request data deletion</Bullet>
                <Bullet>Update your personal details</Bullet>
                <Bullet>Opt-out of marketing communications</Bullet>
              </Section>

              <Section num="6" title="Cookies">
                <Para>Our website may use cookies to improve your browsing experience. You can disable cookies in your browser settings at any time.</Para>
              </Section>

              <Section num="7" title="Third-Party Services">
                <Para>We may use third-party tools (payments, analytics) which have their own privacy policies. We encourage you to review them.</Para>
              </Section>

              <Section num="8" title="Changes to Policy">
                <Para>We may update this policy periodically. Users will be notified of major changes via email or app notification.</Para>
              </Section>

              <Section num="9" title="Contact">
                <Bullet>📞 +91 96437 01701</Bullet>
                <Bullet>📧 support@gharkamali.com</Bullet>
              </Section>
            </div>
          )}

          {/* ── GARDENER APP TERMS ── */}
          {active === 'gardener' && (
            <div>
              <div style={{ marginBottom: 40 }}>
                <h1 style={{ color: 'var(--forest)', fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 900, marginBottom: 8 }}>Gardener App Terms</h1>
                <p style={{ color: 'var(--sage)', fontSize: '0.88rem' }}>GharKaMali (GKM) &nbsp;·&nbsp; For Registered Gardeners</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.1)', border: '1px solid var(--border-gold)', borderRadius: 10, padding: '10px 16px', marginTop: 16 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--forest)', fontWeight: 600, lineHeight: 1.6 }}>
                    GharKaMali is a managed gardening service platform. Gardeners are trained professionals but <strong>not employees</strong>.
                  </span>
                </div>
              </div>

              <Section num="1" title="Role of Gardener">
                <Bullet>Provide gardening services assigned via the app</Bullet>
                <Bullet>Maintain professionalism and punctuality at all times</Bullet>
                <Bullet>Follow Standard Operating Procedures (SOPs) defined by GKM</Bullet>
              </Section>

              <Section num="2" title="Payments & Incentives">
                <Bullet>Earnings based on completed jobs</Bullet>
                <Bullet>Performance-based incentives apply</Bullet>
                <Bullet>Payments processed weekly/monthly as per agreement</Bullet>
              </Section>

              <Section num="3" title="Code of Conduct">
                <Bullet>No direct dealing with customers outside the GKM platform</Bullet>
                <Bullet>No misconduct, negligence, or willful damage</Bullet>
                <Bullet>Maintain uniform/branding where applicable</Bullet>
              </Section>

              <Section num="4" title="Penalties">
                <Bullet>Late arrival or unjustified cancellation → penalty deduction</Bullet>
                <Bullet>Misbehavior with customer or team → suspension</Bullet>
                <Bullet>Fraud or data misuse → immediate termination</Bullet>
              </Section>

              <Section num="5" title="Tools & Materials">
                <Bullet>Must handle all tools and materials responsibly</Bullet>
                <Bullet>Report any damage or loss immediately to GKM</Bullet>
              </Section>

              <Section num="6" title="Account Termination">
                <Para>GKM can suspend or permanently terminate gardener access for any violation of these terms without prior notice.</Para>
              </Section>

              <Section num="7" title="Liability">
                <Para>The gardener is responsible for:</Para>
                <Bullet>On-site behavior and customer interactions</Bullet>
                <Bullet>Proper and complete service delivery</Bullet>
              </Section>

              <Section num="8" title="Agreement">
                <Para>By using the GharKaMali Gardener App, you confirm that you have read, understood, and agreed to all terms listed here.</Para>
              </Section>
            </div>
          )}

          {/* Footer note */}
          <div style={{ marginTop: 48, padding: '24px 28px', background: '#fff', borderRadius: 16, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 700, color: 'var(--forest)', marginBottom: 4 }}>Have questions about our policies?</div>
              <div style={{ color: 'var(--text-2)', fontSize: '0.88rem' }}>Reach out to us — we're happy to help.</div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/book" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '10px 20px' }}>Book a Visit</Link>
              <a href="https://wa.me/919643701701" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '10px 20px', borderColor: 'var(--forest)', color: 'var(--forest)' }}>
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </SmoothScrollProvider>
  );
}
