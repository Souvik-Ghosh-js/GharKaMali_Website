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
  { key: 'wallet',   Icon: IcWallet,   label: 'Wallet Balance', color: 'var(--forest)',  bg: 'var(--bg-elevated)', border: 'var(--border)' },
  { key: 'bookings', Icon: IcCalendar, label: 'Total Bookings', color: 'var(--forest)', bg: 'var(--bg-elevated)', border: 'var(--border)' },
  { key: 'rating',   Icon: IcStar,     label: 'Avg Rating',     color: 'var(--gold-deep)',   bg: 'var(--bg-elevated)', border: 'var(--border-gold)' },
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

  // Address fields
  const [addrF, setAddrF] = useState({ roomNo: '', building: '', city: '', state: 'Uttar Pradesh', pincode: '' });
  const [editingAddr, setEditingAddr] = useState(false);

  const parseAddress = (full: string) => {
    if (!full) return;
    const parts = full.split(',').map(s => s.trim());
    if (parts.length >= 5) {
      setAddrF({ roomNo: parts[0], building: parts[1], city: parts[2], state: parts[3], pincode: parts[4] });
    } else {
      setAddrF(prev => ({ ...prev, building: full }));
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login?redirect=/profile');
  }, [isAuthenticated, isLoading, router]);

  const { data: profileRaw, refetch } = useQuery({ queryKey: ['profile'], queryFn: getProfile, enabled: isAuthenticated });
  const profile: any = profileRaw;

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setEmail(profile.email ?? '');
      if (profile.address) parseAddress(profile.address);
    }
  }, [profile]);

  const saveMut = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      if (name.trim()) fd.append('name', name.trim());
      if (email.trim()) fd.append('email', email.trim());
      if (imgFile) fd.append('profile_image', imgFile);

      // Add address to the profile update
      const fullAddr = [addrF.roomNo, addrF.building, addrF.city, addrF.state, addrF.pincode].filter(Boolean).join(', ');
      if (fullAddr.trim()) fd.append('address', fullAddr.trim());

      return updateProfile(fd);
    },
    onSuccess: (res: any) => {
      toast.success('Profile updated successfully');
      updateUser({
        name: res?.name ?? name,
        email: res?.email ?? email,
        profile_image: res?.profile_image ?? user?.profile_image,
        address: res?.address ?? [addrF.roomNo, addrF.building, addrF.city, addrF.state, addrF.pincode].filter(Boolean).join(', ')
      });
      setEditing(false);
      setEditingAddr(false);
      setImgFile(null);
      setPreview(null);
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
      <div style={{ background: 'var(--bg)', paddingTop: 'var(--nav-h)', minHeight: '100svh', position: 'relative' }}>
        <div className="hero-bg-grid" />
        <div className="hero-orb hero-orb-1" style={{ opacity: 0.15 }} />
        {/* Hero */}
        <div style={{ padding: '60px 0 100px', position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(16px,5vw,40px)', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 140, height: 140, borderRadius: '50%', background: 'var(--bg)', border: '4px solid #fff', boxShadow: 'var(--sh-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', fontWeight: 900, fontSize: '3rem', overflow: 'hidden', fontFamily: 'var(--font-display)' }}>
                  {avatarSrc ? <img src={avatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                </div>
                {editing && (
                  <button onClick={() => fileRef.current?.click()}
                    style={{ position: 'absolute', bottom: 4, right: 4, width: 44, height: 44, borderRadius: '50%', background: 'var(--forest)', border: '4px solid #fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: 'var(--sh-sm)' }}>
                    <IcCamera />
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,5vw,3.6rem)', fontWeight: 900, color: 'var(--forest)', marginBottom: 6, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{user?.name}</h1>
                <div style={{ color: 'var(--sage)', fontSize: '1.1rem', marginBottom: 20, fontWeight: 600 }}>+91 {user?.phone}</div>
                {user?.referral_code && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid var(--border-gold)', borderRadius: 99, padding: '8px 20px', boxShadow: 'var(--sh-xs)' }}>
                    <span style={{ color: 'var(--gold-deep)', fontSize: '0.85rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>REFERRAL: {user.referral_code}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container" style={{ marginTop: -50, paddingBottom: 80, position: 'relative', zIndex: 10 }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 36 }}>
            {STATS.map(s => (
              <div key={s.key} className="card" style={{ padding: '28px 24px', textAlign: 'center', borderRadius: 28 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: s.color, border: `1px solid ${s.border}` }}>
                  <s.Icon />
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2rem', color: 'var(--forest)', marginBottom: 8, lineHeight: 1 }}>
                  {(statValues as any)[s.key]}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--sage)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Profile form */}
          <div className="card profile-card" style={{ padding: 'clamp(20px,5vw,40px)', marginBottom: 28, borderRadius: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.6rem', color: 'var(--forest)' }}>Personal Information</h2>
              {!editing
                ? <button onClick={() => setEditing(true)} className="btn btn-outline" style={{ padding: '10px 20px' }}>Edit Profile</button>
                : <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => { setEditing(false); setImgFile(null); setPreview(null); }} className="btn btn-outline">Cancel</button>
                    <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending || !name.trim()} className="btn btn-primary" style={{ boxShadow: 'var(--sh-md)' }}>
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
                  <div key={row.label} className="profile-info-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--sage)', fontWeight: 600, fontSize: '0.9rem', flexShrink: 0 }}>{row.label}</span>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--forest)', textAlign: 'right', wordBreak: 'break-all' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Address Management card */}
          <div className="card profile-card" style={{ padding: 'clamp(20px,5vw,40px)', marginBottom: 28, borderRadius: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(3,65,26,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.6rem', color: 'var(--forest)', margin: 0 }}>Saved Address</h2>
              </div>
              {!editingAddr
                ? <button onClick={() => setEditingAddr(true)} className="btn btn-outline" style={{ padding: '10px 20px' }}>Edit Address</button>
                : <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => { setEditingAddr(false); if(profile?.address) parseAddress(profile.address); }} className="btn btn-outline">Cancel</button>
                    <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending || !addrF.building} className="btn btn-primary" style={{ boxShadow: 'var(--sh-md)' }}>
                      {saveMut.isPending ? 'Saving…' : 'Save Address'}
                    </button>
                  </div>
              }
            </div>

            {editingAddr ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Room / Flat No. *</label>
                    <input className="form-input" value={addrF.roomNo} onChange={e => setAddrF({ ...addrF, roomNo: e.target.value })} placeholder="e.g. B-204" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Block / Building / Society *</label>
                    <input className="form-input" value={addrF.building} onChange={e => setAddrF({ ...addrF, building: e.target.value })} placeholder="e.g. ATS Pristine" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">City *</label>
                    <input className="form-input" value={addrF.city} onChange={e => setAddrF({ ...addrF, city: e.target.value })} placeholder="e.g. Noida" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Pincode *</label>
                    <input className="form-input" value={addrF.pincode} onChange={e => setAddrF({ ...addrF, pincode: e.target.value.replace(/\D/g,'') })} placeholder="e.g. 201301" maxLength={6} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">State *</label>
                  <select className="form-input" value={addrF.state} onChange={e => setAddrF({ ...addrF, state: e.target.value })} style={{ cursor: 'pointer' }}>
                    {['Uttar Pradesh','Delhi','Haryana','Rajasthan','Maharashtra','Karnataka','Tamil Nadu','West Bengal','Gujarat','Telangana','Other'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(3,65,26,0.03)', border: '1px dashed var(--border)', borderRadius: 20, padding: 24 }}>
                {profile?.address ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { label: 'Room / Flat', value: addrF.roomNo },
                      { label: 'Building / Locality', value: addrF.building },
                      { label: 'City', value: addrF.city },
                      { label: 'State', value: addrF.state },
                      { label: 'Pincode', value: addrF.pincode },
                    ].filter(r => r.value).map((row, i, arr) => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: i < arr.length - 1 ? 8 : 0, borderBottom: i < arr.length - 1 ? '1px solid rgba(3,65,26,0.08)' : 'none' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--sage)', fontWeight: 600 }}>{row.label}</span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--forest)', fontWeight: 800 }}>{row.value}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 8, paddingTop: 12, borderTop: '2px solid #fff', fontSize: '0.95rem', color: 'var(--forest)', fontWeight: 700 }}>
                      📍 {profile.address}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--sage)', padding: '10px 0' }}>
                    No address saved. Add one to speed up your bookings!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Danger zone */}
          <div className="card profile-card" style={{ padding: 'clamp(20px,5vw,32px)', border: '1px solid #FCA5A5', background: '#FEF2F2', borderRadius: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#DC2626', marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IcWarning />
              </div>
              <h3 style={{ fontWeight: 900, fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>Account Actions</h3>
            </div>
            <p style={{ color: '#991B1B', fontSize: '0.95rem', marginBottom: 24, fontWeight: 500 }}>Signing out will require you to verify your phone number again on your next visit.</p>
            <button onClick={() => { if (window.confirm('Are you sure you want to sign out?')) logout(); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 99, background: '#DC2626', color: '#fff', border: 'none', fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s var(--ease)', boxShadow: '0 4px 12px rgba(220,38,38,0.2)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(220,38,38,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(220,38,38,0.2)'; }}>
              <IcLogout /> Sign Out
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

