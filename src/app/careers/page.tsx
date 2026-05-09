'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import { API_BASE } from '@/lib/api';

const EXPERIENCE_OPTIONS = [
  '0–1 years (fresher)',
  '1–3 years',
  '3–5 years',
  '5–10 years',
  '10+ years',
];

const PERKS = [
  { icon: '💰', title: 'Competitive Pay', desc: 'Earn ₹500–₹1,500 per visit plus tips.' },
  { icon: '📅', title: 'Flexible Schedule', desc: 'Work on your own time. Morning or evening slots.' },
  { icon: '📍', title: 'Local Jobs', desc: 'Jobs close to home. No long commutes.' },
  { icon: '📱', title: 'App Support', desc: 'Manage all jobs from our gardener app.' },
  { icon: '🌱', title: 'Training Provided', desc: 'Learn modern plant care techniques with us.' },
  { icon: '⭐', title: 'Grow with Us', desc: 'Top gardeners earn team-lead roles.' },
];

export default function CareersPage() {
  const [form, setForm] = useState({
    name: '', phone: '', whatsapp: '', email: '',
    experience: '', cities: '', bio: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.phone.trim() || !form.experience || !form.cities.trim()) {
      setError('Please fill all required fields.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/careers/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Submission failed');
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    }
    setSubmitting(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    border: '1.5px solid var(--border)', fontSize: '0.92rem',
    color: 'var(--forest)', background: '#fff', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.82rem', fontWeight: 700,
    color: 'var(--forest)', marginBottom: 6,
  };

  return (
    <SmoothScrollProvider>
      <Navbar />

      {/* Hero */}
      <section style={{
        paddingTop: 'clamp(120px, 15vw, 180px)',
        paddingBottom: 'clamp(48px, 7vw, 80px)',
        background: 'linear-gradient(160deg, #f0f7f4 0%, #fff 60%)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container" style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div className="section-divider-line" />
          <span className="overline overline-dot">Join Our Team</span>
          <h1 className="display-2" style={{ color: 'var(--forest)', marginTop: 12, marginBottom: 16 }}>
            Become a GharKaMali Gardener
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', lineHeight: 1.8, maxWidth: 600, margin: '0 auto' }}>
            Love plants? Join our growing team of certified gardeners. Earn well, work flexibly,
            and help hundreds of families enjoy beautiful green spaces.
          </p>
        </div>
      </section>

      {/* Perks */}
      <section style={{ padding: 'clamp(40px, 6vw, 80px) 0', background: '#fff' }}>
        <div className="container" style={{ maxWidth: 960 }}>
          <h2 style={{ textAlign: 'center', color: 'var(--forest)', fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800, marginBottom: 'clamp(28px, 4vw, 48px)' }}>
            Why gardeners love working with us
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'clamp(14px, 2vw, 24px)',
          }}>
            {PERKS.map(p => (
              <div key={p.title} style={{
                padding: 'clamp(18px, 2.5vw, 28px)',
                borderRadius: 20,
                border: '1.5px solid var(--border)',
                background: 'var(--bg-elevated)',
                display: 'flex', gap: 14, alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{p.icon}</span>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--forest)', fontSize: '0.95rem', marginBottom: 4 }}>{p.title}</div>
                  <div style={{ color: 'var(--text-2)', fontSize: '0.85rem', lineHeight: 1.6 }}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section style={{
        padding: 'clamp(40px, 6vw, 80px) 0',
        background: 'linear-gradient(160deg, #f0f7f4 0%, #fff 100%)',
      }}>
        <div className="container" style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 4vw, 44px)' }}>
            <h2 style={{ color: 'var(--forest)', fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800, marginBottom: 10 }}>
              Apply Now
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.7 }}>
              Fill in the form below and our team will get back to you within 48 hours.
            </p>
          </div>

          {submitted ? (
            <div style={{
              textAlign: 'center',
              padding: 'clamp(40px, 6vw, 72px) clamp(24px, 4vw, 56px)',
              background: '#fff', borderRadius: 28,
              border: '1.5px solid rgba(201,168,76,0.35)',
              boxShadow: '0 4px 32px rgba(3,65,26,0.08)',
            }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🌿</div>
              <h3 style={{ color: 'var(--forest)', fontSize: '1.5rem', fontWeight: 800, marginBottom: 10 }}>
                Application Received!
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: '1rem', lineHeight: 1.8, maxWidth: 440, margin: '0 auto' }}>
                Thank you for applying to join the GharKaMali team. We'll review your application
                and reach out within 48 hours.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                background: '#fff', borderRadius: 28,
                border: '1.5px solid rgba(201,168,76,0.35)',
                padding: 'clamp(24px, 4vw, 48px)',
                boxShadow: '0 4px 24px rgba(3,65,26,0.08)',
              }}
            >
              {/* Name + Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input
                    type="text" placeholder="Ramesh Kumar" required
                    value={form.name} onChange={set('name')}
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = 'var(--forest)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Mobile Number *</label>
                  <input
                    type="tel" placeholder="98XXXXXXXX" maxLength={10} required
                    value={form.phone} onChange={set('phone')}
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = 'var(--forest)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
              </div>

              {/* WhatsApp + Email */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>WhatsApp Number <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(if different)</span></label>
                  <input
                    type="tel" placeholder="Same as mobile" maxLength={10}
                    value={form.whatsapp} onChange={set('whatsapp')}
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = 'var(--forest)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email Address <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
                  <input
                    type="email" placeholder="you@example.com"
                    value={form.email} onChange={set('email')}
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = 'var(--forest)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
              </div>

              {/* Experience */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Years of Experience *</label>
                <select
                  required value={form.experience} onChange={set('experience')}
                  style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--forest)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                >
                  <option value="">Select experience</option>
                  {EXPERIENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              {/* Cities */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Cities / Areas you can serve *</label>
                <input
                  type="text" placeholder="e.g. Sector 62 Noida, Greater Noida West" required
                  value={form.cities} onChange={set('cities')}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--forest)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 5, marginBottom: 0 }}>
                  List the areas where you are comfortable working.
                </p>
              </div>

              {/* Bio */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>About You <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
                <textarea
                  rows={4}
                  placeholder="Tell us a bit about your gardening experience, specialities (e.g. bonsai, terrace gardens, organic methods)…"
                  value={form.bio} onChange={set('bio')}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
                  onFocus={e => (e.target.style.borderColor = 'var(--forest)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              {error && (
                <div style={{
                  padding: '10px 14px', borderRadius: 10, marginBottom: '1rem',
                  background: 'rgba(220,38,38,0.08)', color: '#DC2626',
                  fontSize: '0.85rem', fontWeight: 600,
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit" disabled={submitting}
                style={{
                  width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                  background: 'var(--forest)', color: '#fff', fontWeight: 800,
                  fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1, transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
              >
                {submitting ? 'Submitting…' : 'Submit Application 🌱'}
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 14, marginBottom: 0 }}>
                We respect your privacy. Your details are only used for hiring purposes.
              </p>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </SmoothScrollProvider>
  );
}
