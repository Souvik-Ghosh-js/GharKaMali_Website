'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/store/auth';
import { getProfile, updateProfile } from '@/lib/api';

const IcWallet  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>;
const IcCalendar= () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcStar    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcCamera  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IcWarning = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcLogout  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

const STATS = [
  { key: 'wallet',   Icon: IcWallet,   label: 'Wallet Balance', color: 'var(--earth)',  bg: 'rgba(139,98,69,0.07)' },
  { key: 'bookings', Icon: IcCalendar, label: 'Total Bookings', color: 'var(--forest)', bg: 'rgba(11,61,46,0.07)' },
  { key: 'rating',   Icon: IcStar,     label: 'Avg Rating',     color: 'var(--gold)',   bg: 'rgba(201,168,76,0.10)' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, updateUser, logout } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login?redirect=/profile');
  }, [isAuthenticated, isLoading, router]);

  const { data: profileRaw, refetch } = useQuery({ queryKey: ['profile'], queryFn: getProfile, enabled: isAuthenticated });
  const profile: any = profileRaw;

  useEffect(() => {
    if (profile) { setName(profile.name ?? ''); setEmail(profile.email ?? ''); }
  }, [profile]);

  const saveMut = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      if (name.trim()) fd.append('name', name.trim());
      if (email.trim()) fd.append('email', email.trim());
      if (imgFile) fd.append('profile_image', imgFile);
      return updateProfile(fd);
    },
    onSuccess: (res: any) => {
      toast.success('Profile updated successfully');
      updateUser({ name: res?.name ?? name, email: res?.email ?? email, profile_image: res?.profile_image ?? user?.profile_image });
      setEditing(false); setImgFile(null); setPreview(null);
      refetch();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    setImgFile(f);
    const r = new FileReader();
    r.onload = e => setPreview(e.target?.result as string);
    r.readAsDataURL(f);
  };

  if (isLoading) return null;

  const avatarSrc = preview ?? profile?.profile_image ?? null;
  const initials = (user?.name ?? 'U')[0].toUpperCase();

  const statValues = {
    wallet: `₹${(profile?.wallet_balance ?? 0).toLocaleString('en-IN')}`,
    bookings: profile?.total_bookings ?? 0,
    rating: profile?.avg_rating_given ? `${Number(profile.avg_rating_given).toFixed(1)}/5` : '—',
  };

  return (
    <>
      <Navbar />
      <div style={{ background: 'var(--bg)', paddingTop: 'var(--nav-h)', minHeight: '100svh' }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, var(--forest), var(--forest-mid))', padding: '48px 0 100px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none' }} />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '3px solid rgba(255,255,255,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '2.4rem', overflow: 'hidden', fontFamily: 'var(--font-display)' }}>
                  {avatarSrc ? <img src={avatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                </div>
                {editing && (
                  <button onClick={() => fileRef.current?.click()}
                    style={{ position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: '50%', background: 'var(--gold)', border: '2px solid #fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)' }}>
                    <IcCamera />
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 900, color: '#fff', marginBottom: 4, letterSpacing: '-0.02em' }}>{user?.name}</h1>
                <div style={{ color: 'rgba(255,255,255,0.58)', fontSize: '0.88rem', marginBottom: 8 }}>+91 {user?.phone}</div>
                {user?.referral_code && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(201,168,76,0.14)', border: '1px solid rgba(201,168,76,0.28)', borderRadius: 99, padding: '4px 14px' }}>
                    <span style={{ color: 'var(--gold-light)', fontSize: '0.73rem', fontWeight: 700 }}>Referral: {user.referral_code}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container-sm" style={{ marginTop: -44, paddingBottom: 80 }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
            {STATS.map(s => (
              <div key={s.key} style={{ background: '#fff', borderRadius: 20, padding: '22px 18px', border: '1px solid var(--border)', textAlign: 'center', boxShadow: 'var(--sh-xs)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: s.color }}>
                  <s.Icon />
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.4rem', color: s.color, marginBottom: 4, lineHeight: 1 }}>
                  {(statValues as any)[s.key]}
                </div>
                <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Profile form */}
          <div style={{ background: '#fff', borderRadius: 24, padding: '28px', border: '1px solid var(--border)', marginBottom: 16, boxShadow: 'var(--sh-xs)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>Personal Information</h2>
              {!editing
                ? <button onClick={() => setEditing(true)} className="btn btn-outline btn-sm">Edit Profile</button>
                : <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setEditing(false); setImgFile(null); setPreview(null); }} className="btn btn-outline btn-sm">Cancel</button>
                    <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending || !name.trim()} className="btn btn-forest btn-sm">
                      {saveMut.isPending ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
              }
            </div>

            {editing ? (
              <div>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Phone <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>(cannot be changed)</span></label>
                  <input className="form-input" value={`+91 ${user?.phone}`} disabled style={{ opacity: 0.55 }} />
                </div>
              </div>
            ) : (
              <div>
                {[
                  { label: 'Full Name',    value: profile?.name ?? user?.name },
                  { label: 'Phone',        value: `+91 ${user?.phone}` },
                  { label: 'Email',        value: profile?.email ?? 'Not provided' },
                  { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—' },
                ].map((row, i, arr) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.875rem' }}>{row.label}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Danger zone */}
          <div style={{ background: 'rgba(220,38,38,0.03)', borderRadius: 20, padding: '22px', border: '1px solid rgba(220,38,38,0.10)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--err)', marginBottom: 6 }}>
              <IcWarning />
              <h3 style={{ fontWeight: 700, fontSize: '0.93rem' }}>Account Actions</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: 16 }}>Signing out will require you to verify your phone number again.</p>
            <button onClick={() => { if (window.confirm('Are you sure you want to sign out?')) logout(); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 99, background: 'rgba(220,38,38,0.07)', color: 'var(--err)', border: '1.5px solid rgba(220,38,38,0.18)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.07)')}>
              <IcLogout /> Sign Out
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
