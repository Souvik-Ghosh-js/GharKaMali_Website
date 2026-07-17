'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';

const TABS = [
  { id: 'company', label: 'Company Info' },
  { id: 'policies', label: 'Policies' },
  { id: 'terms', label: 'Terms & Conditions' },
  { id: 'privacy', label: 'Privacy Policy' },
];

const IcBuilding = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
  </svg>
);
const IcDoc = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IcShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IcLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const TAB_ICONS = [IcBuilding, IcDoc, IcShield, IcLock];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{
        fontSize: 'clamp(1rem, 2vw, 1.2rem)',
        fontWeight: 800,
        color: 'var(--forest)',
        marginBottom: 16,
        paddingBottom: 10,
        borderBottom: '2px solid var(--border-gold)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>{title}</h2>
      <div style={{ color: 'var(--text-2)', fontSize: '0.92rem', lineHeight: 1.9 }}>
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '10px 0',
      borderBottom: '1px solid var(--border)',
      flexWrap: 'wrap',
    }}>
      <span style={{ minWidth: 200, fontWeight: 700, color: 'var(--forest)', fontSize: '0.88rem', flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'var(--text-2)', fontSize: '0.88rem', flex: 1 }}>{value}</span>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--earth)', flexShrink: 0, marginTop: 7 }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function CompanyTab() {
  return (
    <>
      <Section title="Legal Entity">
        <InfoRow label="Legal Entity Name" value="Plantura Care Private Limited" />
        <InfoRow label="Brand Name" value="GharKaMali" />
        <InfoRow label="CIN" value="U91030UW2026PTC249726" />
        <InfoRow label="GSTIN" value="09AAQCP7633P1ZD" />
        <InfoRow label="PAN" value="AAQCP7633P" />
        <InfoRow label="Date of Incorporation" value="25 February 2026" />
      </Section>

      <Section title="Legal Statement">
        <p style={{ margin: 0 }}>
          GharKaMali is a registered brand and business operated by <strong style={{ color: 'var(--forest)' }}>Plantura Care Private Limited</strong> ("Plantura Care", "Company", "we", "our", or "us"). All services offered through the GharKaMali website, mobile application, WhatsApp, and associated platforms are provided by Plantura Care Private Limited.
        </p>
      </Section>

      <Section title="Registered Office">
        <div style={{ background: 'var(--bg-elevated)', border: '1.5px solid var(--border)', borderRadius: 16, padding: '20px 24px', fontStyle: 'normal', lineHeight: 2 }}>
          <strong style={{ color: 'var(--forest)', display: 'block', marginBottom: 4 }}>Plantura Care Private Limited</strong>
          T3, A20, UGF, NX One,<br />
          Tech Zone IV, Greater Noida West,<br />
          Gautam Buddha Nagar,<br />
          Uttar Pradesh – 201306, India
        </div>
      </Section>

      <Section title="Contact Details">
        <InfoRow label="Customer Support Email" value={<a href="mailto:support@gharkamali.com" style={{ color: 'var(--earth)', textDecoration: 'none' }}>support@gharkamali.com</a>} />
        <InfoRow label="Business Email" value={<a href="mailto:info@gharkamali.com" style={{ color: 'var(--earth)', textDecoration: 'none' }}>info@gharkamali.com</a>} />
        <InfoRow label="Website" value={<a href="https://gharkamali.com" style={{ color: 'var(--earth)', textDecoration: 'none' }}>https://gharkamali.com</a>} />
        <InfoRow label="Customer Care" value="+91 8920 201701" />
        <InfoRow label="Business Hours" value="Monday – Saturday, 9:00 AM – 7:00 PM IST" />
      </Section>

      <Section title="Grievance Officer">
        <div style={{ background: 'var(--bg-elevated)', border: '1.5px solid var(--border)', borderRadius: 16, padding: '20px 24px', lineHeight: 2 }}>
          <strong style={{ color: 'var(--forest)', display: 'block', marginBottom: 4 }}>Plantura Care Private Limited</strong>
          T3, A20, UGF, NX One, Tech Zone IV,<br />
          Greater Noida West, Gautam Buddha Nagar,<br />
          Uttar Pradesh – 201306, India<br />
          <span style={{ marginTop: 8, display: 'block' }}>
            Email: <a href="mailto:grievance@gharkamali.com" style={{ color: 'var(--earth)', textDecoration: 'none' }}>grievance@gharkamali.com</a>
          </span>
          Response Time: Within 48 hours<br />
          Resolution Target: Within 15 business days
        </div>
      </Section>

      <Section title="Legal Jurisdiction">
        <p style={{ margin: 0 }}>
          These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the competent courts at <strong style={{ color: 'var(--forest)' }}>Noida, Uttar Pradesh</strong>, unless otherwise required by applicable law.
        </p>
      </Section>

      <Section title="Copyright Notice">
        <div style={{ background: 'rgba(3,65,26,0.04)', border: '1.5px solid var(--border-gold)', borderRadius: 16, padding: '20px 24px' }}>
          <p style={{ margin: '0 0 8px' }}>© 2026 Plantura Care Private Limited. All rights reserved.</p>
          <p style={{ margin: 0 }}>
            GharKaMali®, its logo, website, mobile application, graphics, photographs, software, and content are the exclusive property of Plantura Care Private Limited and are protected under applicable intellectual property laws.
          </p>
        </div>
      </Section>
    </>
  );
}

function PoliciesTab() {
  return (
    <>
      <Section title="1. Refund & Cancellation Policy">
        <BulletList items={[
          'Service bookings may be cancelled free of charge up to 24 hours before the scheduled visit.',
          'Cancellations made within 24 hours may attract a cancellation fee.',
          'If GharKaMali cancels a booking, customers may choose a full refund or free rescheduling.',
          'Refunds for eligible orders are processed to the original payment method within 5–7 business days.',
          'Banks/payment partners may take an additional 2–7 business days to credit the amount.',
          'Live plants are perishable products and are non-returnable unless delivered damaged, defective, or incorrect.',
          'Customers must report damaged products within 24 hours of delivery with supporting photographs.',
        ]} />
      </Section>

      <Section title="2. Shipping & Delivery Policy">
        <BulletList items={[
          'Plants, pots, compost and gardening products are delivered to serviceable locations.',
          'Delivery timelines are estimates and may vary due to weather, traffic or supplier availability.',
          'Customers must provide a complete delivery address and contact number.',
          'Risk transfers upon successful delivery.',
          'Installation services, where purchased, are scheduled separately if required.',
        ]} />
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 700, color: 'var(--forest)', marginBottom: 8 }}>Currently Serviceable Areas:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Noida', 'Greater Noida', 'Greater Noida West', 'Ghaziabad', 'Delhi', 'Gurugram'].map(city => (
              <span key={city} style={{ background: 'rgba(3,65,26,0.08)', color: 'var(--forest)', borderRadius: 99, padding: '4px 14px', fontSize: '0.82rem', fontWeight: 600 }}>
                {city}
              </span>
            ))}
          </div>
        </div>
      </Section>

      <Section title="3. Subscription Terms">
        <BulletList items={[
          'Subscription begins after successful payment.',
          'Visits are scheduled according to the selected package.',
          'Unused visits generally expire at the end of the billing cycle unless otherwise specified.',
          'Emergency visits are available only in eligible plans.',
          'Rescheduling requires at least 24 hours\' notice.',
          'Customers can cancel renewal anytime before the next billing cycle.',
          'Auto-renewal (if enabled) will charge the registered payment method automatically.',
          'Refunds are not available once a monthly maintenance cycle has commenced, except where required by law.',
        ]} />
      </Section>

      <Section title="4. Cookie Policy">
        <BulletList items={[
          'GharKaMali uses cookies and similar technologies to improve website functionality, remember preferences, analyse traffic and enhance user experience.',
          'Users can manage cookie preferences through their browser settings.',
          'Disabling cookies may affect certain website features.',
        ]} />
      </Section>

      <Section title="5. Community Guidelines">
        <p style={{ marginBottom: 10 }}>Users agree not to:</p>
        <BulletList items={[
          'Abuse, threaten or harass gardeners, employees or other users.',
          'Upload false, illegal or harmful content.',
          'Attempt fraud or misuse promotional offers.',
          'Interfere with the platform\'s operation.',
        ]} />
        <p style={{ marginTop: 12, margin: '12px 0 0' }}>Violation may result in suspension or termination of the account.</p>
      </Section>

      <Section title="6. Vendor & Gardener Terms">
        <BulletList items={[
          'Vendors and gardeners must provide accurate identity and qualification details.',
          'Services must be delivered professionally and safely.',
          'Vendors must comply with applicable laws, labour regulations and tax requirements.',
          'Customer information is confidential and may not be used outside GharKaMali assignments.',
          'Repeated poor service, misconduct or policy violations may result in suspension or termination.',
        ]} />
      </Section>

      <Section title="7. Data Deletion Policy">
        <p style={{ margin: '0 0 10px' }}>
          Users may request deletion of their account and personal data through the app, website or by emailing <a href="mailto:support@gharkamali.com" style={{ color: 'var(--earth)' }}>support@gharkamali.com</a>.
        </p>
        <BulletList items={[
          'Requests are generally processed within 30 days unless data must be retained for legal, tax, fraud prevention or regulatory purposes.',
          'Order records required by law may be retained even after account deletion.',
        ]} />
      </Section>

      <Section title="8. Account Deletion Policy">
        <p style={{ margin: '0 0 10px' }}>Users can permanently delete their account from the app settings or by contacting customer support.</p>
        <BulletList items={[
          'Account deletion removes profile information and disables future access.',
          'Certain information may be retained where legally required or necessary to resolve disputes, prevent fraud or comply with statutory obligations.',
        ]} />
      </Section>
    </>
  );
}

function TermsTab() {
  return (
    <>
      <div style={{ background: 'var(--bg-elevated)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '12px 20px', marginBottom: 28, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        <strong style={{ color: 'var(--forest)' }}>Effective Date:</strong> July 11, 2026
      </div>

      {[
        { n: '1', title: 'Acceptance', body: 'By accessing or using the GharKaMali website or mobile application, you agree to these Terms & Conditions.' },
        { n: '2', title: 'Services', body: 'GharKaMali provides gardening services, gardeners on demand, garden setup, maintenance, plant and gardening product sales, consultations, and related services.' },
        { n: '3', title: 'User Accounts', body: 'Users must provide accurate information and are responsible for maintaining account confidentiality.' },
        { n: '4', title: 'Bookings & Payments', body: 'Bookings are subject to availability. Prices displayed at booking apply. Payments may be collected online or through approved methods.' },
        { n: '5', title: 'Cancellations & Refunds', body: 'Cancellation and refund eligibility depends on the timing of cancellation and the nature of the service or product. Perishable plants may not be eligible for return except where damaged or incorrect.' },
        { n: '6', title: 'Customer Responsibilities', body: 'Customers must provide safe access to the property and disclose any relevant site conditions.' },
        { n: '7', title: 'Intellectual Property', body: 'All logos, content, photographs, trademarks and software belong to GharKaMali or its licensors.' },
        { n: '8', title: 'Limitation of Liability', body: 'To the maximum extent permitted by law, GharKaMali is not liable for indirect or consequential damages. Liability is limited to the amount paid for the affected order where permitted by law.' },
        { n: '9', title: 'Governing Law', body: 'These terms are governed by the laws of India. Courts having jurisdiction over the company\'s registered office shall have jurisdiction.' },
      ].map(item => (
        <Section key={item.n} title={`${item.n}. ${item.title}`}>
          <p style={{ margin: 0 }}>{item.body}</p>
        </Section>
      ))}

      <Section title="10. Contact">
        <InfoRow label="Email" value={<a href="mailto:support@gharkamali.com" style={{ color: 'var(--earth)', textDecoration: 'none' }}>support@gharkamali.com</a>} />
        <InfoRow label="Website" value={<a href="https://gharkamali.com" style={{ color: 'var(--earth)', textDecoration: 'none' }}>https://gharkamali.com</a>} />
      </Section>
    </>
  );
}

function PrivacyTab() {
  return (
    <>
      <div style={{ background: 'var(--bg-elevated)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '12px 20px', marginBottom: 28, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        <strong style={{ color: 'var(--forest)' }}>Effective Date:</strong> July 11, 2026
      </div>

      {[
        {
          title: 'Information We Collect',
          body: 'Name, phone number, email, address, booking details, payment information (processed by payment partners), device and usage information.',
        },
        {
          title: 'How We Use Information',
          body: 'To provide services, manage bookings, improve products, process payments, communicate updates, and comply with legal obligations.',
        },
        {
          title: 'Sharing',
          body: 'Information may be shared with service partners, payment processors, logistics providers, and authorities where legally required. We do not sell personal information.',
        },
        {
          title: 'Data Security',
          body: 'Reasonable technical and organizational safeguards are used, but no online system is completely secure.',
        },
        {
          title: 'Cookies',
          body: 'The website may use cookies and analytics technologies to improve user experience.',
        },
        {
          title: 'Your Rights',
          body: 'Users may request access, correction, or deletion of personal information, subject to applicable law.',
        },
        {
          title: 'Children',
          body: 'The services are not directed to children under applicable legal age without parental involvement.',
        },
        {
          title: 'Policy Updates',
          body: 'This policy may be updated periodically. Continued use indicates acceptance of the revised policy.',
        },
      ].map(item => (
        <Section key={item.title} title={item.title}>
          <p style={{ margin: 0 }}>{item.body}</p>
        </Section>
      ))}

      <Section title="Contact">
        <InfoRow label="Email" value={<a href="mailto:support@gharkamali.com" style={{ color: 'var(--earth)', textDecoration: 'none' }}>support@gharkamali.com</a>} />
      </Section>
    </>
  );
}

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState('company');

  const renderTab = () => {
    switch (activeTab) {
      case 'company': return <CompanyTab />;
      case 'policies': return <PoliciesTab />;
      case 'terms': return <TermsTab />;
      case 'privacy': return <PrivacyTab />;
      default: return null;
    }
  };

  return (
    <SmoothScrollProvider>
      <Navbar />

      {/* Hero */}
      <section style={{
        paddingTop: 'clamp(120px, 15vw, 180px)',
        paddingBottom: 'clamp(40px, 6vw, 64px)',
        background: 'linear-gradient(160deg, #f0f7f4 0%, #fff 60%)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container" style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <div className="section-divider-line" />
          <span className="overline overline-dot">Legal Information</span>
          <h1 className="display-2" style={{ color: 'var(--forest)', marginTop: 12, marginBottom: 16 }}>
            Plantura Care Private Limited
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 'clamp(0.9rem, 2vw, 1rem)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
            Official company information, policies, terms, and privacy details for GharKaMali.
          </p>
        </div>
      </section>

      {/* Tab bar + content */}
      <section style={{ padding: 'clamp(32px, 5vw, 72px) 0', background: '#fff', minHeight: '60vh' }}>
        <div className="container" style={{ maxWidth: 900, margin: '0 auto' }}>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: 8,
            marginBottom: 40,
            overflowX: 'auto',
            paddingBottom: 4,
            scrollbarWidth: 'none',
          }}>
            {TABS.map((tab, i) => {
              const Icon = TAB_ICONS[i];
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 20px',
                    borderRadius: 99,
                    border: isActive ? '2px solid var(--forest)' : '2px solid var(--border)',
                    background: isActive ? 'var(--forest)' : '#fff',
                    color: isActive ? '#fff' : 'var(--forest)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit',
                    flexShrink: 0,
                  }}
                >
                  <Icon />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content card */}
          <div style={{
            background: '#fff',
            border: '1.5px solid var(--border)',
            borderRadius: 24,
            padding: 'clamp(24px, 4vw, 48px)',
            boxShadow: '0 4px 32px rgba(3,65,26,0.06)',
          }}>
            {renderTab()}
          </div>

          {/* Footer note */}
          <div style={{
            marginTop: 32,
            textAlign: 'center',
            padding: '20px 24px',
            background: 'var(--bg-elevated)',
            borderRadius: 16,
            border: '1px solid var(--border-gold)',
          }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              GharKaMali is a brand of <strong style={{ color: 'var(--forest)' }}>Plantura Care Private Limited</strong> ·
              CIN: U91030UW2026PTC249726 · GSTIN: 09AAQCP7633P1ZD<br />
              Registered Office: T3, A20, UGF, NX One, Tech Zone IV, Greater Noida West, Gautam Buddha Nagar, Uttar Pradesh – 201306, India<br />
              © 2026 Plantura Care Private Limited. All Rights Reserved.
            </p>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        div[style*="scrollbarWidth"] { -ms-overflow-style: none; }
        div[style*="scrollbarWidth"]::-webkit-scrollbar { display: none; }
      `}</style>
    </SmoothScrollProvider>
  );
}
