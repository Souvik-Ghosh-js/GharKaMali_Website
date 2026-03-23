'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/store/auth';
import { getBooking, cancelBooking, rateBooking, rescheduleBooking } from '@/lib/api';

const TIMELINE_STEPS = [
  { status: 'pending',     label: 'Booking Received',    icon: '📋' },
  { status: 'assigned',    label: 'Gardener Assigned',   icon: '👨‍🌾' },
  { status: 'en_route',    label: 'Gardener On the Way', icon: '🚴' },
  { status: 'arrived',     label: 'Gardener Arrived',    icon: 'loc' },
  { status: 'in_progress', label: 'Work in Progress',    icon: 'leaf' },
  { status: 'completed',   label: 'Visit Complete',      icon: '✅' },
];

const STATUS_ORDER = ['pending','assigned','en_route','arrived','in_progress','completed'];

function StatusPill({ s }: { s: string }) {
  const MAP: Record<string,[string,string]> = {
    pending:     ['#FEF3C7','#92400E'],
    assigned:    ['#DBEAFE','#1E40AF'],
    en_route:    ['#E0F2FE','#0369A1'],
    arrived:     ['#DCFCE7','#166534'],
    in_progress: ['#FEF9C3','#854D0E'],
    completed:   ['#DCFCE7','#14532D'],
    cancelled:   ['#F3F4F6','#374151'],
    failed:      ['#FEE2E2','#991B1B'],
  };
  const [bg, color] = MAP[s] ?? ['#F3F4F6','#374151'];
  return <span style={{ display:'inline-flex', padding:'4px 14px', borderRadius:99, fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', background:bg, color }}>{s.replace(/_/g,' ')}</span>;
}

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display:'flex', gap:6 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => onChange(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          style={{ background:'none', border:'none', cursor:'pointer', padding:'2px', fontSize:'2rem', transition:'transform 0.15s', transform: (hover || value) >= n ? 'scale(1.2)' : 'scale(1)' }}>
          <span style={{ filter: (hover || value) >= n ? 'none' : 'grayscale(1)', transition:'filter 0.15s' }}><svg width="20" height="20" viewBox="0 0 24 24" fill={(hover || value) >= n ? '#C9A84C' : '#e5e7eb'}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>
        </button>
      ))}
    </div>
  );
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();

  const [showRating, setShowRating] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:00');

  useEffect(() => { if (!isLoading && !isAuthenticated) router.replace('/login'); }, [isAuthenticated, isLoading]);

  const { data, isLoading: bLoading, refetch } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => getBooking(parseInt(id)),
    enabled: isAuthenticated && !!id,
    refetchInterval: 30_000,
  });
  const booking: any = data;
  const status: string = booking?.status ?? '';
  const statusIdx = STATUS_ORDER.indexOf(status);

  const rateMut = useMutation({
    mutationFn: () => rateBooking(parseInt(id), rating, review),
    onSuccess: () => { toast.success('Thank you for your feedback! 🌟'); setShowRating(false); qc.invalidateQueries({ queryKey: ['booking', id] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const cancelMut = useMutation({
    mutationFn: () => cancelBooking(parseInt(id), cancelReason),
    onSuccess: () => { toast.success('Booking cancelled.'); setShowCancel(false); refetch(); },
    onError: (e: any) => toast.error(e.message),
  });

  const rescheduleMut = useMutation({
    mutationFn: () => rescheduleBooking(parseInt(id), newDate, newTime),
    onSuccess: () => { toast.success('Booking rescheduled! 📅'); setShowReschedule(false); refetch(); },
    onError: (e: any) => toast.error(e.message),
  });

  const minDate = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; };

  if (isLoading || bLoading) return (
    <>
      <Navbar />
      <div style={{ paddingTop:'var(--nav-h)', background:'var(--bg)', minHeight:'100svh' }}>
        <div className="container" style={{ paddingTop:40 }}>
          {Array(4).fill(null).map((_, i) => (
            <div key={i} className="skeleton" style={{ height:80, borderRadius:18, marginBottom:12 }} />
          ))}
        </div>
      </div>
    </>
  );

  if (!booking) return (
    <>
      <Navbar />
      <div style={{ paddingTop:'var(--nav-h)', background:'var(--bg)', minHeight:'100svh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'4rem', marginBottom:16, color:'var(--text-muted)', opacity:0.3 }}><svg width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'><circle cx='11' cy='11' r='8'/><line x1='21' y1='21' x2='16.65' y2='16.65'/></svg></div>
          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700 }}>Booking not found</h2>
          <Link href="/bookings" className="btn btn-forest" style={{ marginTop:24, display:'inline-flex' }}>← Back to Bookings</Link>
        </div>
      </div>
    </>
  );

  const canCancel = ['pending','assigned'].includes(status);
  const canReschedule = ['pending','assigned'].includes(status);
  const canRate = status === 'completed' && !booking.rating;

  return (
    <>
      <Navbar />
      <div style={{ background:'var(--bg)', paddingTop:'var(--nav-h)', minHeight:'100svh' }}>
        {/* Header */}
        <div style={{ background:'linear-gradient(135deg, var(--forest), var(--forest-mid))', padding:'48px 0 80px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize:'50px 50px', pointerEvents:'none' }} />
          <div className="container">
            <Link href="/bookings" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'rgba(255,255,255,0.6)', fontSize:'0.82rem', fontWeight:500, textDecoration:'none', marginBottom:16 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg> All Bookings
            </Link>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
              <div>
                <div style={{ fontFamily:'monospace', fontSize:'0.82rem', color:'rgba(255,255,255,0.5)', marginBottom:8 }}>{booking.booking_number}</div>
                <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                  <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.5rem,3vw,2.2rem)', fontWeight:900, color:'#fff', letterSpacing:'-0.02em' }}>{booking.plan?.name ?? 'Garden Visit'}</h1>
                  <StatusPill s={status} />
                </div>
              </div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:900, color:'var(--gold-light)' }}>
                ₹{booking.total_amount?.toLocaleString('en-IN') ?? '—'}
              </div>
            </div>
          </div>
        </div>

        <div className="container" style={{ marginTop:-44, paddingBottom:80 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:24, alignItems:'start' }}>
            {/* Left */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {/* Live OTP card — show when booking is active */}
              {['assigned','en_route','arrived'].includes(status) && booking.otp && (
                <div style={{ background:'linear-gradient(135deg, var(--forest), var(--forest-mid))', borderRadius:24, padding:28, animation:'slide-up 0.4s var(--ease)' }}>
                  <div style={{ fontSize:'0.7rem', fontWeight:700, color:'rgba(255,255,255,0.5)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:12 }}>
                    🔐 Share this OTP with your gardener to start the visit
                  </div>
                  <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                    {booking.otp.toString().split('').map((d: string, i: number) => (
                      <div key={i} style={{ width:52, height:62, borderRadius:14, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'monospace', fontSize:'2rem', fontWeight:900, color:'var(--gold-light)' }}>{d}</div>
                    ))}
                  </div>
                  <div style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.55)' }}>OTP expires after gardener scans arrival</div>
                </div>
              )}

              {/* Progress timeline */}
              <div style={{ background:'#fff', borderRadius:24, padding:'24px 28px', border:'1px solid var(--border)' }}>
                <h3 style={{ fontWeight:700, fontSize:'1rem', marginBottom:24 }}>Booking Progress</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                  {TIMELINE_STEPS.map((step, i) => {
                    const done = statusIdx >= STATUS_ORDER.indexOf(step.status);
                    const active = STATUS_ORDER.indexOf(step.status) === statusIdx;
                    const last = i === TIMELINE_STEPS.length - 1;
                    return (
                      <div key={step.status} style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                          <div style={{ width:40, height:40, borderRadius:'50%', background: done ? 'var(--forest)' : active ? 'var(--gold-pale)' : 'var(--bg)', border: active ? '2px solid var(--gold)' : done ? 'none' : '2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', transition:'all 0.3s', boxShadow: active ? '0 0 0 4px rgba(201,168,76,0.2)' : 'none' }}>
                            {done && !active ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : step.icon}
                          </div>
                          {!last && <div style={{ width:2, height:28, background: done ? 'var(--forest)' : 'var(--border)', margin:'4px 0', transition:'background 0.3s' }} />}
                        </div>
                        <div style={{ paddingTop:8, paddingBottom: last ? 0 : 20 }}>
                          <div style={{ fontWeight: done || active ? 700 : 500, fontSize:'0.9rem', color: done || active ? 'var(--text)' : 'var(--text-faint)' }}>{step.label}</div>
                          {active && <div style={{ fontSize:'0.75rem', color:'var(--forest)', fontWeight:600, marginTop:3, display:'flex', alignItems:'center', gap:4 }}><div style={{ width:6, height:6, borderRadius:'50%', background:'var(--forest)', animation:'pulse-dot 2s ease infinite' }} />In progress</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Gardener info */}
              {booking.gardener && (
                <div style={{ background:'#fff', borderRadius:24, padding:'22px 24px', border:'1px solid var(--border)' }}>
                  <h3 style={{ fontWeight:700, fontSize:'1rem', marginBottom:16 }}>Your Gardener</h3>
                  <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                    <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--forest)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'1.3rem', fontWeight:800, flexShrink:0, overflow:'hidden' }}>
                      {booking.gardener.profile_image
                        ? <img src={booking.gardener.profile_image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        : booking.gardener.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:'1rem' }}>{booking.gardener.name}</div>
                      {booking.gardener.avg_rating && (
                        <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:3 }}>
                          <span style={{ fontSize:'0.82rem', fontWeight:600 }}>{Number(booking.gardener.avg_rating).toFixed(1)}</span>
                          <span style={{ fontSize:'0.75rem', color:'var(--text-faint)' }}>avg rating</span>
                        </div>
                      )}
                      {booking.gardener.experience_years && (
                        <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:2 }}>{booking.gardener.experience_years} years experience</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Work photos */}
              {(booking.before_image || booking.after_image) && (
                <div style={{ background:'#fff', borderRadius:24, padding:'22px 24px', border:'1px solid var(--border)' }}>
                  <h3 style={{ fontWeight:700, fontSize:'1rem', marginBottom:16 }}>Work Photos</h3>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    {booking.before_image && (
                      <div>
                        <div style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.07em' }}>Before</div>
                        <img src={booking.before_image} alt="Before" style={{ width:'100%', aspectRatio:'4/3', objectFit:'cover', borderRadius:14 }} />
                      </div>
                    )}
                    {booking.after_image && (
                      <div>
                        <div style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.07em' }}>After</div>
                        <img src={booking.after_image} alt="After" style={{ width:'100%', aspectRatio:'4/3', objectFit:'cover', borderRadius:14 }} />
                      </div>
                    )}
                  </div>
                  {booking.gardener_notes && (
                    <div style={{ marginTop:14, padding:'12px 14px', background:'var(--bg)', borderRadius:12, fontSize:'0.85rem', color:'var(--text-2)', lineHeight:1.65 }}>
                      <strong>Gardener note:</strong> {booking.gardener_notes}
                    </div>
                  )}
                </div>
              )}

              {/* Rating received */}
              {booking.rating && (
                <div style={{ background:'linear-gradient(135deg, var(--gold-pale), #fffbef)', borderRadius:24, padding:'22px 24px', border:'1px solid rgba(201,168,76,0.3)' }}>
                  <div style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--earth)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:12 }}>Your Review</div>
                  <div style={{ display:'flex', gap:4, marginBottom:10 }}>
                    {[1,2,3,4,5].map(n => <span key={n} style={{ fontSize:'1.5rem', filter: n <= booking.rating ? 'none' : 'grayscale(1)' }}><svg width="22" height="22" viewBox="0 0 24 24" fill={n <= booking.rating ? '#C9A84C' : '#e5e7eb'}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>)}
                  </div>
                  {booking.review && <p style={{ fontSize:'0.9rem', color:'var(--text-2)', fontStyle:'italic', lineHeight:1.7 }}>&ldquo;{booking.review}&rdquo;</p>}
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div style={{ position:'sticky', top:'calc(var(--nav-h) + 20px)', display:'flex', flexDirection:'column', gap:14 }}>
              {/* Booking details */}
              <div style={{ background:'#fff', borderRadius:24, padding:'22px 24px', border:'1px solid var(--border)' }}>
                <h3 style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:18 }}>Booking Details</h3>
                {[
                  { icon:'loc', label:'Address', value: booking.service_address },
                  { icon:'📅', label:'Date', value: booking.scheduled_date ? new Date(booking.scheduled_date).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'long', year:'numeric' }) : '—' },
                  { icon:'⏰', label:'Time', value: booking.scheduled_time ?? 'Flexible' },
                  { icon:'plant', label:'Plants', value: `${booking.plant_count ?? '—'} plants` },
                  { icon:'loc', label:'Zone', value: booking.zone?.name ?? '—' },
                ].map(row => (
                  <div key={row.label} style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:14 }}>
                    <span style={{ fontSize:'1rem', flexShrink:0, marginTop:1 }}>{row.icon}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'0.68rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:2 }}>{row.label}</div>
                      <div style={{ fontSize:'0.875rem', fontWeight:500, lineHeight:1.5 }}>{row.value}</div>
                    </div>
                  </div>
                ))}

                {/* Addons */}
                {booking.addons?.length > 0 && (
                  <div style={{ marginTop:4, paddingTop:14, borderTop:'1px solid var(--border)' }}>
                    <div style={{ fontSize:'0.68rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Add-ons</div>
                    {booking.addons.map((a: any) => (
                      <div key={a.id} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.85rem', marginBottom:6 }}>
                        <span style={{ color:'var(--text-2)' }}>{a.addon?.name ?? a.name}</span>
                        <span style={{ fontWeight:600 }}>₹{a.addon?.price ?? '—'}</span>
                      </div>
                    ))}
                    <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:'0.95rem', borderTop:'1px solid var(--border)', paddingTop:10, marginTop:6 }}>
                      <span>Total</span>
                      <span style={{ color:'var(--forest)' }}>₹{booking.total_amount?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {canRate && (
                <button onClick={() => setShowRating(true)} className="btn btn-primary w-full" style={{ justifyContent:'center' }}>
                  ⭐ Rate this Visit
                </button>
              )}
              {canReschedule && (
                <button onClick={() => setShowReschedule(true)} className="btn btn-outline w-full" style={{ justifyContent:'center' }}>
                  📅 Reschedule
                </button>
              )}
              {canCancel && (
                <button onClick={() => setShowCancel(true)}
                  style={{ width:'100%', padding:'12px', borderRadius:99, background:'rgba(220,38,38,0.06)', color:'var(--err)', border:'1.5px solid rgba(220,38,38,0.15)', fontFamily:'var(--font-body)', fontWeight:600, fontSize:'0.875rem', cursor:'pointer', transition:'all 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as any).style.background = 'rgba(220,38,38,0.12)'; }}
                  onMouseLeave={e => { (e.currentTarget as any).style.background = 'rgba(220,38,38,0.06)'; }}>
                  ✕ Cancel Booking
                </button>
              )}

              {/* Help */}
              <div style={{ background:'var(--cream)', borderRadius:18, padding:'16px 18px', border:'1px solid var(--border)' }}>
                <div style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Need Help?</div>
                <Link href="/complaints" style={{ fontSize:'0.85rem', color:'var(--forest)', fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:5 }}>
                  Report an issue <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating modal */}
      {showRating && (
        <div className="modal-bg" onClick={() => setShowRating(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{ fontSize:'3.5rem', marginBottom:12 }}>⭐</div>
              <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.6rem', marginBottom:6 }}>How was your visit?</h2>
              <p style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>Your feedback helps us improve and rewards great gardeners</p>
            </div>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:24 }}>
              <StarRating value={rating} onChange={setRating} />
            </div>
            {rating > 0 && (
              <div style={{ marginBottom:20 }}>
                <div style={{ textAlign:'center', marginBottom:12, fontWeight:600, color: rating >= 4 ? 'var(--ok)' : rating >= 3 ? 'var(--warn)' : 'var(--err)' }}>
                  {['', 'Poor 😞', 'Below Average 😕', 'Average 😐', 'Good 😊', 'Excellent! 🎉'][rating]}
                </div>
                <textarea className="form-input" rows={3} placeholder="Tell us more about your experience (optional)..."
                  value={review} onChange={e => setReview(e.target.value)} style={{ resize:'none' }} />
              </div>
            )}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setShowRating(false)} className="btn btn-outline" style={{ flex:1, justifyContent:'center' }}>Cancel</button>
              <button onClick={() => rateMut.mutate()} disabled={!rating || rateMut.isPending} className="btn btn-primary" style={{ flex:2, justifyContent:'center' }}>
                {rateMut.isPending ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel modal */}
      {showCancel && (
        <div className="modal-bg" onClick={() => setShowCancel(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:'3rem', textAlign:'center', marginBottom:16 }}>⚠️</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.5rem', textAlign:'center', marginBottom:8 }}>Cancel Booking?</h2>
            <p style={{ color:'var(--text-muted)', textAlign:'center', marginBottom:24, fontSize:'0.9rem' }}>This action cannot be undone. A cancellation fee may apply.</p>
            <div className="form-group">
              <label className="form-label">Reason for cancellation</label>
              <textarea className="form-input" rows={3} placeholder="Please tell us why you're cancelling..."
                value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setShowCancel(false)} className="btn btn-forest" style={{ flex:1, justifyContent:'center' }}>Keep Booking</button>
              <button onClick={() => cancelMut.mutate()} disabled={cancelMut.isPending}
                style={{ flex:1, padding:'12px', borderRadius:99, background:'var(--err)', color:'#fff', border:'none', fontFamily:'var(--font-body)', fontWeight:700, cursor:'pointer', opacity: cancelMut.isPending ? 0.7 : 1 }}>
                {cancelMut.isPending ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule modal */}
      {showReschedule && (
        <div className="modal-bg" onClick={() => setShowReschedule(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.5rem', marginBottom:8 }}>Reschedule Visit</h2>
            <p style={{ color:'var(--text-muted)', marginBottom:24, fontSize:'0.9rem' }}>Choose a new date and time for your gardener</p>
            <div className="form-group">
              <label className="form-label">New Date</label>
              <input type="date" className="form-input" min={minDate()} value={newDate} onChange={e => setNewDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Preferred Time</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                {['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'].map(t => (
                  <button key={t} onClick={() => setNewTime(t)}
                    style={{ padding:'9px', borderRadius:10, border:`1.5px solid ${newTime === t ? 'var(--forest)' : 'var(--border)'}`, background: newTime === t ? 'rgba(11,61,46,0.06)' : '#fff', color: newTime === t ? 'var(--forest)' : 'var(--text-2)', fontWeight:600, fontSize:'0.82rem', cursor:'pointer', fontFamily:'var(--font-body)', transition:'all 0.15s' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setShowReschedule(false)} className="btn btn-outline" style={{ flex:1, justifyContent:'center' }}>Cancel</button>
              <button onClick={() => rescheduleMut.mutate()} disabled={!newDate || rescheduleMut.isPending}
                className="btn btn-forest" style={{ flex:2, justifyContent:'center', opacity: (!newDate || rescheduleMut.isPending) ? 0.5 : 1 }}>
                {rescheduleMut.isPending ? 'Rescheduling…' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <style>{`@media(max-width:900px){div[style*="grid-template-columns: 1fr 340px"]{grid-template-columns:1fr !important;}}`}</style>
    </>
  );
}
