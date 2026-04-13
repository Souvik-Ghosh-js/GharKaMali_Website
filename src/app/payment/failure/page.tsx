'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function FailureContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  return (
    <div style={{ background: 'var(--bg)', paddingTop: 'var(--nav-h)', minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', position:'relative' }}>
      <div className="hero-bg-grid" />
      <div className="hero-orb hero-orb-1" style={{ opacity: 0.1, background: 'radial-gradient(circle, rgba(220,38,38,0.2) 0%, transparent 60%)' }} />
      <div className="container" style={{ maxWidth: 600, textAlign: 'center', padding: '60px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ 
          width: 120, height: 120, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', border: '2px solid #FCA5A5',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px',
          fontSize: '3rem', fontWeight: 900, boxShadow: '0 12px 40px rgba(220,38,38,0.15)',
          animation: 'shake 0.5s var(--ease)' 
        }}>
          !
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 900, color: 'var(--forest)', marginBottom: 14 }}>
          Payment Failed
        </h1>
        <p style={{ color: 'var(--sage)', fontSize: '1.15rem', marginBottom: 40, lineHeight: 1.7, fontWeight: 500 }}>
          {reason === 'hash_mismatch' 
            ? 'Security verification failed. Please try again.' 
            : 'Your transaction could not be completed. Please check your payment details and retry.'}
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link href="/book?type=on-demand" className="btn btn-primary" style={{ padding: '14px 28px' }}>
            Retry Payment
          </Link>
          <Link href="/" className="btn btn-outline" style={{ padding: '14px 28px' }}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div style={{ minHeight: '100svh', background: 'var(--bg)' }} />}>
        <FailureContent />
      </Suspense>
      <Footer />
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `}</style>
    </>
  );
}
