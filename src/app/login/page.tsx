'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { sendOtp, verifyOtp } from '@/lib/api';
import { useAuth } from '@/store/auth';

type Step = 'phone' | 'otp' | 'name';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') ?? '/dashboard';
  const { login, isAuthenticated, isLoading } = useAuth();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [digits, setDigits] = useState(['','','','','','']);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!isLoading && isAuthenticated) router.replace(redirect); }, [isAuthenticated, isLoading]);
  useEffect(() => () => clearInterval(timerRef.current), []);

  const startTimer = () => {
    setCountdown(30);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(timerRef.current); return 0; } return c - 1; }), 1000);
  };

  const handleSend = async () => {
    const c = phone.replace(/\D/g, '');
    if (c.length !== 10) { toast.error('Enter a valid 10-digit number'); return; }
    setLoading(true);
    try {
      await sendOtp(c);
      setStep('otp'); startTimer();
      toast.success(`OTP sent to +91 ${c} 📱`);
      setTimeout(() => document.getElementById('otp-0')?.focus(), 100);
    } catch(e: any) { toast.error(e.message || 'Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const handleDigit = (i: number, val: string) => {
    const d = val.replace(/\D/g,'').slice(-1);
    const n = [...digits]; n[i] = d; setDigits(n);
    if (d && i < 5) document.getElementById(`otp-${i+1}`)?.focus();
    if (n.filter(Boolean).length === 6) handleVerify(n.join(''));
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) document.getElementById(`otp-${i-1}`)?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const v = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if (v.length === 6) { setDigits(v.split('')); setTimeout(() => handleVerify(v), 50); }
    e.preventDefault();
  };

  const handleVerify = async (otp: string) => {
    const c = phone.replace(/\D/g,'');
    setLoading(true);
    try {
      const res: any = await verifyOtp(c, otp);
      if (res?.is_new_user || !res?.user?.name) { setStep('name'); setLoading(false); return; }
      login(res.user, res.token);
      toast.success('Welcome back!');
      router.replace(redirect);
    } catch(e: any) {
      toast.error(e.message || 'Invalid OTP');
      setDigits(['','','','','','']);
      document.getElementById('otp-0')?.focus();
    }
    finally { setLoading(false); }
  };

  const handleName = async () => {
    if (!name.trim()) { toast.error('Please enter your name'); return; }
    const c = phone.replace(/\D/g,'');
    setLoading(true);
    try {
      const res: any = await verifyOtp(c, digits.join(''), name.trim());
      login(res.user, res.token);
      toast.success('Welcome to Ghar Ka Mali!');
      router.replace(redirect);
    } catch(e: any) { toast.error(e.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100svh', background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', position: 'relative', overflow: 'hidden' }}>
      {/* BG */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div style={{ position: 'absolute', top: '10%', right: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-5%', left: '-5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,122,88,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 460, animation: 'fade-up 0.5s var(--ease) both' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 36, textDecoration: 'none' }}>
          <div className="logo-mark" style={{ width: 60, height: 60, borderRadius: 18 }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M12 3C9.5 3 6 6 6 10c0 5 6 11 6 11s6-6 6-11c0-4-3.5-7-6-7z" fill="rgba(255,255,255,0.9)"/><path d="M12 7c-1.2 1.5-1.8 3-1.8 3.8 0 1.2.8 2 1.8 2.4.9-.4 1.8-1.2 1.8-2.4C13.8 10 13.2 8.5 12 7z" fill="#C9A84C"/></svg>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: '#fff', letterSpacing: '-0.01em' }}>Ghar Ka Mali</div>
        </Link>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 28, padding: 'clamp(28px,5vw,40px)', boxShadow: 'var(--sh-xl)' }}>
          {/* Progress */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 28 }}>
            {(['phone','otp','name'] as Step[]).map((s, i) => {
              const steps = ['phone','otp','name'];
              const current = steps.indexOf(step);
              return <div key={s} style={{ height: 4, borderRadius: 99, background: i <= current ? 'var(--forest)' : 'var(--cream-dark)', width: i === current ? 24 : 12, transition: 'all 0.3s' }} />;
            })}
          </div>

          {step === 'phone' && (
            <>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', marginBottom: 6, letterSpacing: '-0.02em' }}>Sign In</h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: '0.9rem' }}>Enter your phone number to get started</p>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div style={{ display: 'flex', border: '1.5px solid var(--border-mid)', borderRadius: 'var(--r)', overflow: 'hidden', background: 'var(--bg)', transition: 'all 0.2s' }}
                  onFocusCapture={e => { (e.currentTarget as any).style.borderColor = 'var(--forest)'; (e.currentTarget as any).style.boxShadow = '0 0 0 4px rgba(11,61,46,0.10)'; }}
                  onBlurCapture={e => { (e.currentTarget as any).style.borderColor = 'var(--border-mid)'; (e.currentTarget as any).style.boxShadow = 'none'; }}>
                  <div style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-2)', borderRight: '1.5px solid var(--border-mid)', background: 'var(--cream)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>🇮🇳 +91</div>
                  <input ref={inputRef} type="tel" inputMode="numeric" maxLength={10} value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g,''))}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="98765 43210" autoFocus
                    style={{ flex: 1, padding: '12px 14px', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '1rem', letterSpacing: '0.05em', color: 'var(--text)' }} />
                </div>
              </div>
              <button onClick={handleSend} disabled={loading || phone.replace(/\D/g,'').length !== 10}
                className="btn btn-forest w-full" style={{ justifyContent: 'center', padding: '14px' }}>
                {loading ? <div className="btn-spinner" style={{ borderTopColor: '#fff' }} /> : 'Continue →'}
              </button>
              <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.78rem', color: 'var(--text-faint)' }}>
                By continuing you agree to our <Link href="/terms" style={{ color: 'var(--forest)', fontWeight: 600 }}>Terms</Link> & <Link href="/privacy" style={{ color: 'var(--forest)', fontWeight: 600 }}>Privacy</Link>
              </p>
            </>
          )}

          {step === 'otp' && (
            <>
              <button onClick={() => { setStep('phone'); setDigits(['','','','','','']); }}
                style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.83rem', cursor: 'pointer', fontFamily: 'var(--font-body)', marginBottom: 20, padding: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                Change number
              </button>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', marginBottom: 6 }}>Check your phone</h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: '0.9rem' }}>
                6-digit OTP sent to <strong style={{ color: 'var(--text)' }}>+91 {phone}</strong>
              </p>
              <div className="otp-grid" onPaste={handlePaste} style={{ marginBottom: 24 }}>
                {digits.map((d, i) => (
                  <input key={i} id={`otp-${i}`} type="tel" inputMode="numeric" maxLength={1} value={d}
                    className={`otp-box ${d ? 'filled' : ''}`}
                    onChange={e => handleDigit(i, e.target.value)}
                    onKeyDown={e => handleKey(i, e)} />
                ))}
              </div>
              {loading && <div style={{ textAlign: 'center', padding: '8px 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Verifying…</div>}
              <button onClick={() => handleVerify(digits.join(''))} disabled={loading || digits.some(d => !d)}
                className="btn btn-forest w-full" style={{ justifyContent: 'center', padding: '14px' }}>
                {loading ? <div className="btn-spinner" style={{ borderTopColor: '#fff' }} /> : 'Verify OTP'}
              </button>
              <p style={{ textAlign: 'center', marginTop: 18, fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                {countdown > 0 ? <>Resend in <strong style={{ color: 'var(--text)' }}>{countdown}s</strong></> : <button onClick={handleSend} style={{ background: 'none', border: 'none', color: 'var(--forest)', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.83rem' }}>Resend OTP</button>}
              </p>
            </>
          )}

          {step === 'name' && (
            <>
              <div style={{ fontSize: '2.8rem', marginBottom: 16, textAlign: 'center' }}>👋</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', marginBottom: 6, textAlign: 'center' }}>Welcome!</h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: '0.9rem', textAlign: 'center' }}>You're new here — what should we call you?</p>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" placeholder="e.g. Priya Sharma" value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleName()} autoFocus />
              </div>
              <button onClick={handleName} disabled={loading || !name.trim()}
                className="btn btn-forest w-full" style={{ justifyContent: 'center', padding: '14px' }}>
                {loading ? <div className="btn-spinner" style={{ borderTopColor: '#fff' }} /> : 'Create Account →'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div style={{ minHeight: '100svh', background: 'var(--forest)' }} />}><LoginForm /></Suspense>;
}
