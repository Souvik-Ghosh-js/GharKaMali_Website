'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/store/auth';
import { submitContact } from '@/lib/api';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import Spinner from '@/components/Spinner';

export default function ContactPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.message) {
      setError('Name and message are required');
      return;
    }
    setSubmitting(true);
    try {
      await submitContact({ ...form, geofence_id: user?.geofence_id });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <SmoothScrollProvider>
      <Navbar />
      <section style={{ paddingTop: 'clamp(120px, 15vw, 180px)', paddingBottom: 'clamp(60px, 8vw, 120px)', minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 5vw, 56px)' }}>
            <div className="section-divider-line" />
            <span className="overline overline-dot">Get In Touch</span>
            <h1 className="display-2" style={{ color: 'var(--forest)', marginTop: 12 }}>Contact Us</h1>
            <p style={{ color: 'var(--text-2)', fontSize: '1.05rem', maxWidth: 520, margin: '12px auto 0', lineHeight: 1.7 }}>
              Have a question about our gardening services? We'd love to hear from you!
            </p>
          </div>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: 'clamp(40px, 6vw, 80px)', background: 'rgba(255,255,255,0.82)', borderRadius: 28, border: '1.5px solid rgba(201,168,76,0.35)', boxShadow: '0 4px 24px rgba(3,65,26,0.08)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🌿</div>
              <h2 style={{ color: 'var(--forest)', fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Thank You!</h2>
              <p style={{ color: 'var(--text-2)', fontSize: '1rem', lineHeight: 1.7 }}>
                Your message has been received. Our team will get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(12px)', borderRadius: 28, border: '1.5px solid rgba(201,168,76,0.35)', padding: 'clamp(24px, 4vw, 48px)', boxShadow: '0 4px 24px rgba(3,65,26,0.08)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--forest)', marginBottom: 6 }}>Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your name"
                    style={{ width: '100%', padding: '14px 18px', borderRadius: 14, border: '1.5px solid var(--border)', background: '#fff', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--forest)', marginBottom: 6 }}>Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    style={{ width: '100%', padding: '14px 18px', borderRadius: 14, border: '1.5px solid var(--border)', background: '#fff', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s' }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--forest)', marginBottom: 6 }}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  style={{ width: '100%', padding: '14px 18px', borderRadius: 14, border: '1.5px solid var(--border)', background: '#fff', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s' }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--forest)', marginBottom: 6 }}>Message *</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Tell us how we can help..."
                  rows={5}
                  style={{ width: '100%', padding: '14px 18px', borderRadius: 14, border: '1.5px solid var(--border)', background: '#fff', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', resize: 'vertical', transition: 'border-color 0.2s' }}
                />
              </div>
              {error && (
                <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>{error}</div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1rem', opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? <><Spinner size={16} color="#fff" /> Sending...</> : 'Send Message'}
              </button>
            </form>
          )}

          {/* Contact Info Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: 'clamp(32px, 5vw, 56px)' }}>
            {[
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>, title: 'Address', desc: 'Noida & Greater Noida, UP, India' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>, title: 'Phone', desc: '+91 98765 43210' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3" /><polyline points="22 6 12 13 2 6" /></svg>, title: 'Email', desc: 'support@gharkamali.com' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="v-glass" style={{ textAlign: 'center', padding: '24px 16px', borderRadius: 22, boxShadow: '0 4px 12px rgba(3,65,26,0.06)' }}>
                <div className="v-orb" style={{ margin: '0 auto 12px' }}>{icon}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--ink)', fontSize: '1.1rem', marginBottom: 4 }}>{title}</div>
                <div style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </SmoothScrollProvider>
  );
}
