'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { sendOtp, verifyOtp } from '@/lib/api';
import { useAuth } from '@/store/auth';

// Two-step phone OTP login: phone → send OTP (MSG91) → enter 6-digit code → verify.
function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') ?? '/dashboard';
  const { login, isAuthenticated, isLoading } = useAuth();

  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!isLoading && isAuthenticated) router.replace(redirect); }, [isAuthenticated, isLoading]);

  // Resend cooldown countdown.
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const getLocation = () => new Promise<{ lat: number; lng: number }>((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });

  // Step 1 — send the OTP to the entered phone number.
  const handleSendOtp = async () => {
    const c = phone.replace(/\D/g, '');
    if (c.length !== 10) { toast.error('Enter a valid 10-digit number'); return; }
    setLoading(true);
    try {
      await sendOtp(c);
      setStep('otp');
      setResendIn(30);
      toast.success('OTP sent to your phone');
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (e: any) {
      toast.error(e?.message || 'Could not send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — verify the entered OTP and log in.
  const handleVerifyOtp = async () => {
    const c = phone.replace(/\D/g, '');
    const code = otp.replace(/\D/g, '');
    if (code.length < 4) { toast.error('Enter the OTP you received'); return; }
    setLoading(true);
    let loc: { lat: number; lng: number } | null = null;
    try { loc = await getLocation(); setLocation(loc); } catch { /* location optional */ }
    try {
      const res: any = await verifyOtp(c, code, undefined, loc?.lat, loc?.lng);
      if (res?.requires_name) {
        setStep('name');
        toast.success('Please enter your name to continue');
        return;
      }
      login(res.user, res.token);
      toast.success('Welcome to GharKaMali!');
      router.replace(redirect);
    } catch (e: any) {
      toast.error(e?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitName = async () => {
    const c = phone.replace(/\D/g, '');
    const code = otp.replace(/\D/g, '');
    const trimmed = name.trim();
    if (!trimmed) { toast.error('Enter your full name'); return; }
    setLoading(true);
    try {
      const res: any = await verifyOtp(c, code, trimmed, location?.lat, location?.lng);
      if (res?.requires_name) {
        toast.error('Name is still required. Please enter a valid name.');
        return;
      }
      login(res.user, res.token);
      toast.success('Welcome to GharKaMali!');
      router.replace(redirect);
    } catch (e: any) {
      toast.error(e?.message || 'Could not complete login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gk-login">
      {/* Brand side — deep-green pod with contour orbit (visual only) */}
      <aside className="gk-login-art" data-anim>
        <div className="gk-login-orbit" aria-hidden><i /><i /><i /></div>
        <div className="fx-spores" aria-hidden><i /><i /><i /><i /><i /><i /></div>
        <Link href="/" className="gk-login-logo" aria-label="GharKaMali home">
          <img src="/logo.png" alt="GharKaMali" />
        </Link>
      </aside>

      <main className="gk-login-panel">
        {/* Card */}
        <div className="gk-login-card">
          <div className="gk-login-steps" aria-hidden>
            {[0, 1, 2].map(i => <span key={i} className={i <= (step === 'phone' ? 0 : step === 'otp' ? 1 : 2) ? 'on' : ''} />)}
          </div>
          {step === 'phone' ? (
            <>
              <h1 style={{ fontWeight: 600, fontSize: 'clamp(1.8rem, 3vw, 2.2rem)', marginBottom: 6, letterSpacing: '-0.02em', color: 'var(--ink)' }}>Sign In</h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: '0.9rem' }}>Enter your phone number to continue</p>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', background: 'var(--bg-elevated)', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                  onFocusCapture={e => { (e.currentTarget as any).style.borderColor = 'var(--leaf)'; (e.currentTarget as any).style.boxShadow = '0 0 0 4px rgba(47,107,71,0.12)'; }}
                  onBlurCapture={e => { (e.currentTarget as any).style.borderColor = 'var(--border)'; (e.currentTarget as any).style.boxShadow = 'none'; }}>
                  <div style={{ padding: '12px 14px', fontWeight: 700, borderRight: '1px solid var(--border)', background: 'var(--mint)', color: 'var(--deep)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>🇮🇳 +91</div>
                  <input ref={inputRef} type="tel" inputMode="numeric" maxLength={10} value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                    placeholder="98765 43210" autoFocus
                    style={{ flex: 1, padding: '12px 14px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '1rem', letterSpacing: '0.05em', color: 'var(--text)' }} />
                </div>
              </div>
              <button onClick={handleSendOtp} disabled={loading || phone.replace(/\D/g, '').length !== 10}
                className="btn btn-forest w-full" style={{ justifyContent: 'center', padding: '14px' }}>
                {loading ? <div className="btn-spinner" style={{ borderTopColor: '#fff' }} /> : 'Send OTP →'}
              </button>
            </>
          ) : step === 'otp' ? (
            <>
              <h1 style={{ fontWeight: 600, fontSize: 'clamp(1.8rem, 3vw, 2.2rem)', marginBottom: 6, letterSpacing: '-0.02em', color: 'var(--ink)' }}>Verify OTP</h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: '0.9rem' }}>
                Enter the code sent to <strong style={{ color: 'var(--text)' }}>+91 {phone}</strong>{' '}
                <button onClick={() => { setStep('phone'); setOtp(''); }} style={{ background: 'none', border: 'none', color: 'var(--forest)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}>Change</button>
              </p>
              <div className="form-group">
                <label className="form-label">OTP</label>
                <input ref={inputRef} type="tel" inputMode="numeric" maxLength={6} value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                  placeholder="••••••" autoFocus
                  style={{ width: '100%', padding: '14px', border: '1px solid var(--border)', borderRadius: 16, background: 'var(--bg-elevated)', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '1.4rem', letterSpacing: '0.5em', textAlign: 'center', color: 'var(--text)', fontWeight: 700 }} />
              </div>
              <button onClick={handleVerifyOtp} disabled={loading || otp.replace(/\D/g, '').length < 4}
                className="btn btn-forest w-full" style={{ justifyContent: 'center', padding: '14px' }}>
                {loading ? <div className="btn-spinner" style={{ borderTopColor: '#fff' }} /> : 'Verify & Continue →'}
              </button>
              <button onClick={handleSendOtp} disabled={loading || resendIn > 0}
                style={{ background: 'none', border: 'none', color: resendIn > 0 ? 'var(--text-faint)' : 'var(--forest)', fontWeight: 600, cursor: resendIn > 0 ? 'default' : 'pointer', fontSize: '0.85rem', marginTop: 14, width: '100%', textAlign: 'center' }}>
                {resendIn > 0 ? `Resend OTP in ${resendIn}s` : 'Resend OTP'}
              </button>
            </>
          ) : (
            <>
              <h1 style={{ fontWeight: 600, fontSize: 'clamp(1.8rem, 3vw, 2.2rem)', marginBottom: 6, letterSpacing: '-0.02em', color: 'var(--ink)' }}>Complete your profile</h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: '0.9rem' }}>Enter your name to finish signing in.</p>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmitName()}
                  placeholder="John Doe" autoFocus
                  style={{ width: '100%', padding: '14px', border: '1px solid var(--border)', borderRadius: 16, background: 'var(--bg-elevated)', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--text)' }} />
              </div>
              <button onClick={handleSubmitName} disabled={loading || name.trim().length === 0}
                className="btn btn-forest w-full" style={{ justifyContent: 'center', padding: '14px' }}>
                {loading ? <div className="btn-spinner" style={{ borderTopColor: '#fff' }} /> : 'Continue →'}
              </button>
              <button onClick={() => setStep('otp')} disabled={loading}
                style={{ background: 'none', border: 'none', color: 'var(--forest)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', marginTop: 14, width: '100%', textAlign: 'center' }}>
                Back to OTP
              </button>
            </>
          )}
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.78rem', color: 'var(--text-faint)' }}>
            By continuing you agree to our <Link href="/terms" style={{ color: 'var(--forest)', fontWeight: 600 }}>Terms</Link> &amp; <Link href="/privacy" style={{ color: 'var(--forest)', fontWeight: 600 }}>Privacy</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div className="gk-login" />}><LoginForm /></Suspense>;
}
