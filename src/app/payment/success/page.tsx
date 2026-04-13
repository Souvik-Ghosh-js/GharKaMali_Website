'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function SuccessContent() {
  const searchParams = useSearchParams();
  const txnid = searchParams.get('txnid');
  const amount = searchParams.get('amount');

  return (
    <div style={{ background: 'var(--bg)', paddingTop: 'var(--nav-h)', minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div className="hero-bg-grid" />
      <div className="hero-orb hero-orb-1" style={{ opacity: 0.15 }} />
      <div className="container" style={{ maxWidth: 600, textAlign: 'center', padding: '60px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ 
          width: 120, height: 120, borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', border: '2px solid #86EFAC',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px',
          fontSize: '3rem', fontWeight: 900, boxShadow: '0 12px 40px rgba(22,163,74,0.15)',
          animation: 'scale-up 0.5s var(--ease)' 
        }}>
          ✓
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 900, color: 'var(--forest)', marginBottom: 14 }}>
          Payment Successful!
        </h1>
        <p style={{ color: 'var(--sage)', fontSize: '1.15rem', marginBottom: 40, lineHeight: 1.7, fontWeight: 500 }}>
          Your booking has been confirmed. Our expert gardener will arrive at the scheduled time.
        </p>

        <div className="card" style={{ padding: 28, textAlign: 'left', marginBottom: 48, borderRadius: 24, border: '2px solid #86EFAC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ color: 'var(--sage)', fontWeight: 700 }}>Transaction ID</span>
            <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--forest)' }}>{txnid}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--sage)', fontWeight: 700 }}>Amount Paid</span>
            <span style={{ fontWeight: 900, color: '#16A34A', fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>₹{amount}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link href="/bookings" className="btn btn-primary" style={{ padding: '14px 28px' }}>
            View My Bookings
          </Link>
          <Link href="/" className="btn btn-outline" style={{ padding: '14px 28px' }}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div style={{ minHeight: '100svh', background: 'var(--bg)' }} />}>
        <SuccessContent />
      </Suspense>
      <Footer />
      <style>{`
        @keyframes scale-up {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
