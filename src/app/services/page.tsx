'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';

/* ── ICONS ── */
const IcLeaf = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>;
const IcCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>;
const IcX = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const IcChevron = ({ open }: { open: boolean }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease', flexShrink: 0 }}><polyline points="6 9 12 15 18 9" /></svg>;
const IcArrow = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
const IcTool = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>;
const IcCalendar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const IcHome = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
const IcSun = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>;
const IcDroplet = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>;
const IcBug = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 2l1.5 1.5" /><path d="M14.5 3.5L16 2" /><path d="M9 9h6" /><path d="M10 20h4" /><path d="M12 9v11" /><path d="M6.5 6.5A4.5 4.5 0 0 0 7.5 15H16.5a4.5 4.5 0 0 0 1-8.91" /><path d="M3.5 9H7" /><path d="M17 9h3.5" /><path d="M3.5 15H7" /><path d="M17 15h3.5" /></svg>;
const IcGrid = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>;
const IcTruck = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>;
const IcOffice = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>;
const IcMap = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const IcPot = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 2h6l1 5H8z" /><path d="M8 7c0 0-2 1.5-2 7a6 6 0 0 0 12 0c0-5.5-2-7-2-7" /></svg>;
const IcStethoscope = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" /><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" /><circle cx="20" cy="10" r="2" /></svg>;
const IcWall = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 10h20M2 16h20M7 4v6M12 10v6M17 4v6" /></svg>;

/* ── DATA ── */
const SERVICES = [
  {
    id: 'one-time',
    Icon: IcLeaf,
    title: 'One-Time Plant Care',
    overview: 'Professional visit for complete plant maintenance and basic plantation.',
    includes: [
      'Watering plants', 'Dry leaf removal', 'Cleaning pots', 'Soil loosening',
      'Basic pruning', 'Basic weeding', 'Plant rearrangement', 'Garden cleanup',
      'Plant health inspection',
      'Plantation of customer-provided or GharKaMali purchased plants',
    ],
    excludes: ['Landscape design', 'Tree cutting', 'Civil work', 'Heavy pruning', 'Repotting (unless booked)'],
    steps: ['Garden inspection', 'Plant care & plantation', 'Final cleanup'],
    faqs: [
      { q: 'Do you bring tools?', a: 'Yes, our gardeners carry essential gardening tools.' },
      { q: 'Do I need to provide water?', a: 'Yes, please ensure water access is available.' },
      { q: 'Can I buy plants and fertilizers from GharKaMali?', a: 'Yes, these can be added during booking or purchased separately.' },
      { q: 'Can I reschedule?', a: 'Yes, subject to availability.' },
      { q: 'Is new plantation included?', a: 'Yes. Our gardener can plant new plants during the visit. Plants, pots and soil can be purchased from GharKaMali or provided by the customer.' },
    ],
  },
  {
    id: 'monthly',
    Icon: IcCalendar,
    title: 'Monthly Plant Care Subscription',
    overview: 'Regular scheduled visits to keep your garden healthy throughout the month.',
    includes: [
      'Scheduled maintenance visits', 'Watering', 'Pruning', 'Weeding',
      'Cleaning', 'Soil loosening', 'Plant inspection', 'Garden cleanup',
      'Plantation of newly purchased plants during scheduled visits',
    ],
    excludes: ['Landscape execution', 'Civil work', 'Major tree cutting'],
    steps: ['Scheduled visit', 'Maintenance & plantation', 'Health check', 'Next visit scheduled'],
    faqs: [
      { q: 'Do you bring tools?', a: 'Yes, our gardeners carry essential gardening tools.' },
      { q: 'Do I need to provide water?', a: 'Yes, please ensure water access is available.' },
      { q: 'Can I buy plants and fertilizers from GharKaMali?', a: 'Yes, these can be added during booking or purchased separately.' },
      { q: 'Can I reschedule?', a: 'Yes, subject to availability.' },
      { q: 'Can I add new plants anytime?', a: 'Yes. New plantation is included during your scheduled maintenance visit.' },
    ],
  },
  {
    id: 'balcony-setup',
    Icon: IcHome,
    title: 'Balcony Garden Setup',
    overview: 'Design and installation of balcony gardens.',
    includes: ['Professional service', 'Site inspection', 'Expert guidance'],
    excludes: ['Items outside selected package'],
    steps: ['Inspection', 'Execution', 'Final quality check'],
    faqs: [
      { q: 'Do you bring tools?', a: 'Yes, our gardeners carry essential gardening tools.' },
      { q: 'Do I need to provide water?', a: 'Yes, please ensure water access is available.' },
      { q: 'Can I buy plants and fertilizers from GharKaMali?', a: 'Yes, these can be added during booking or purchased separately.' },
      { q: 'Can I reschedule?', a: 'Yes, subject to availability.' },
    ],
  },
  {
    id: 'terrace-setup',
    Icon: IcSun,
    title: 'Terrace Garden Setup',
    overview: 'Complete terrace garden creation.',
    includes: ['Professional service', 'Site inspection', 'Expert guidance'],
    excludes: ['Items outside selected package'],
    steps: ['Inspection', 'Execution', 'Final quality check'],
    faqs: [
      { q: 'Do you bring tools?', a: 'Yes, our gardeners carry essential gardening tools.' },
      { q: 'Do I need to provide water?', a: 'Yes, please ensure water access is available.' },
      { q: 'Can I buy plants and fertilizers from GharKaMali?', a: 'Yes, these can be added during booking or purchased separately.' },
      { q: 'Can I reschedule?', a: 'Yes, subject to availability.' },
    ],
  },
  {
    id: 'lawn-install',
    Icon: IcDroplet,
    title: 'Lawn Installation',
    overview: 'Natural lawn installation.',
    includes: ['Professional service', 'Site inspection', 'Expert guidance'],
    excludes: ['Items outside selected package'],
    steps: ['Inspection', 'Execution', 'Final quality check'],
    faqs: [
      { q: 'Do you bring tools?', a: 'Yes, our gardeners carry essential gardening tools.' },
      { q: 'Do I need to provide water?', a: 'Yes, please ensure water access is available.' },
      { q: 'Can I buy plants and fertilizers from GharKaMali?', a: 'Yes, these can be added during booking or purchased separately.' },
      { q: 'Can I reschedule?', a: 'Yes, subject to availability.' },
    ],
  },
  {
    id: 'lawn-maintenance',
    Icon: IcTool,
    title: 'Lawn Maintenance',
    overview: 'Routine lawn care.',
    includes: ['Professional service', 'Site inspection', 'Expert guidance'],
    excludes: ['Items outside selected package'],
    steps: ['Inspection', 'Execution', 'Final quality check'],
    faqs: [
      { q: 'Do you bring tools?', a: 'Yes, our gardeners carry essential gardening tools.' },
      { q: 'Do I need to provide water?', a: 'Yes, please ensure water access is available.' },
      { q: 'Can I buy plants and fertilizers from GharKaMali?', a: 'Yes, these can be added during booking or purchased separately.' },
      { q: 'Can I reschedule?', a: 'Yes, subject to availability.' },
    ],
  },
  {
    id: 'repotting',
    Icon: IcPot,
    title: 'Plant Repotting',
    overview: 'Repotting with fresh soil.',
    includes: ['Professional service', 'Site inspection', 'Expert guidance'],
    excludes: ['Items outside selected package'],
    steps: ['Inspection', 'Execution', 'Final quality check'],
    faqs: [
      { q: 'Do you bring tools?', a: 'Yes, our gardeners carry essential gardening tools.' },
      { q: 'Do I need to provide water?', a: 'Yes, please ensure water access is available.' },
      { q: 'Can I buy plants and fertilizers from GharKaMali?', a: 'Yes, these can be added during booking or purchased separately.' },
      { q: 'Can I reschedule?', a: 'Yes, subject to availability.' },
    ],
  },
  {
    id: 'plant-doctor',
    Icon: IcStethoscope,
    title: 'Plant Doctor',
    overview: 'Plant diagnosis and treatment advice.',
    includes: ['Professional service', 'Site inspection', 'Expert guidance'],
    excludes: ['Items outside selected package'],
    steps: ['Inspection', 'Execution', 'Final quality check'],
    faqs: [
      { q: 'Do you bring tools?', a: 'Yes, our gardeners carry essential gardening tools.' },
      { q: 'Do I need to provide water?', a: 'Yes, please ensure water access is available.' },
      { q: 'Can I buy plants and fertilizers from GharKaMali?', a: 'Yes, these can be added during booking or purchased separately.' },
      { q: 'Can I reschedule?', a: 'Yes, subject to availability.' },
    ],
  },
  {
    id: 'pest-control',
    Icon: IcBug,
    title: 'Plant Pest Control',
    overview: 'Treatment for pests and insects.',
    includes: ['Professional service', 'Site inspection', 'Expert guidance'],
    excludes: ['Items outside selected package'],
    steps: ['Inspection', 'Execution', 'Final quality check'],
    faqs: [
      { q: 'Do you bring tools?', a: 'Yes, our gardeners carry essential gardening tools.' },
      { q: 'Do I need to provide water?', a: 'Yes, please ensure water access is available.' },
      { q: 'Can I buy plants and fertilizers from GharKaMali?', a: 'Yes, these can be added during booking or purchased separately.' },
      { q: 'Can I reschedule?', a: 'Yes, subject to availability.' },
    ],
  },
  {
    id: 'kitchen-garden',
    Icon: IcGrid,
    title: 'Kitchen Garden Setup',
    overview: 'Vegetable garden installation.',
    includes: ['Professional service', 'Site inspection', 'Expert guidance'],
    excludes: ['Items outside selected package'],
    steps: ['Inspection', 'Execution', 'Final quality check'],
    faqs: [
      { q: 'Do you bring tools?', a: 'Yes, our gardeners carry essential gardening tools.' },
      { q: 'Do I need to provide water?', a: 'Yes, please ensure water access is available.' },
      { q: 'Can I buy plants and fertilizers from GharKaMali?', a: 'Yes, these can be added during booking or purchased separately.' },
      { q: 'Can I reschedule?', a: 'Yes, subject to availability.' },
    ],
  },
  {
    id: 'vertical-garden',
    Icon: IcWall,
    title: 'Vertical Garden',
    overview: 'Vertical green wall installation.',
    includes: ['Professional service', 'Site inspection', 'Expert guidance'],
    excludes: ['Items outside selected package'],
    steps: ['Inspection', 'Execution', 'Final quality check'],
    faqs: [
      { q: 'Do you bring tools?', a: 'Yes, our gardeners carry essential gardening tools.' },
      { q: 'Do I need to provide water?', a: 'Yes, please ensure water access is available.' },
      { q: 'Can I buy plants and fertilizers from GharKaMali?', a: 'Yes, these can be added during booking or purchased separately.' },
      { q: 'Can I reschedule?', a: 'Yes, subject to availability.' },
    ],
  },
  {
    id: 'office-plants',
    Icon: IcOffice,
    title: 'Office Plant Maintenance',
    overview: 'Office plant care.',
    includes: ['Professional service', 'Site inspection', 'Expert guidance'],
    excludes: ['Items outside selected package'],
    steps: ['Inspection', 'Execution', 'Final quality check'],
    faqs: [
      { q: 'Do you bring tools?', a: 'Yes, our gardeners carry essential gardening tools.' },
      { q: 'Do I need to provide water?', a: 'Yes, please ensure water access is available.' },
      { q: 'Can I buy plants and fertilizers from GharKaMali?', a: 'Yes, these can be added during booking or purchased separately.' },
      { q: 'Can I reschedule?', a: 'Yes, subject to availability.' },
    ],
  },
  {
    id: 'society-garden',
    Icon: IcMap,
    title: 'Society Garden Maintenance',
    overview: 'Garden maintenance contracts.',
    includes: ['Professional service', 'Site inspection', 'Expert guidance'],
    excludes: ['Items outside selected package'],
    steps: ['Inspection', 'Execution', 'Final quality check'],
    faqs: [
      { q: 'Do you bring tools?', a: 'Yes, our gardeners carry essential gardening tools.' },
      { q: 'Do I need to provide water?', a: 'Yes, please ensure water access is available.' },
      { q: 'Can I buy plants and fertilizers from GharKaMali?', a: 'Yes, these can be added during booking or purchased separately.' },
      { q: 'Can I reschedule?', a: 'Yes, subject to availability.' },
    ],
  },
  {
    id: 'plant-shifting',
    Icon: IcTruck,
    title: 'Plant Shifting',
    overview: 'Safe relocation of plants.',
    includes: ['Professional service', 'Site inspection', 'Expert guidance'],
    excludes: ['Items outside selected package'],
    steps: ['Inspection', 'Execution', 'Final quality check'],
    faqs: [
      { q: 'Do you bring tools?', a: 'Yes, our gardeners carry essential gardening tools.' },
      { q: 'Do I need to provide water?', a: 'Yes, please ensure water access is available.' },
      { q: 'Can I buy plants and fertilizers from GharKaMali?', a: 'Yes, these can be added during booking or purchased separately.' },
      { q: 'Can I reschedule?', a: 'Yes, subject to availability.' },
    ],
  },
  {
    id: 'landscape-design',
    Icon: IcGrid,
    title: 'Landscape Design',
    overview: 'Custom landscape planning.',
    includes: ['Professional service', 'Site inspection', 'Expert guidance'],
    excludes: ['Items outside selected package'],
    steps: ['Inspection', 'Execution', 'Final quality check'],
    faqs: [
      { q: 'Do you bring tools?', a: 'Yes, our gardeners carry essential gardening tools.' },
      { q: 'Do I need to provide water?', a: 'Yes, please ensure water access is available.' },
      { q: 'Can I buy plants and fertilizers from GharKaMali?', a: 'Yes, these can be added during booking or purchased separately.' },
      { q: 'Can I reschedule?', a: 'Yes, subject to availability.' },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #e8f0ec' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, padding: '14px 0', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#03411a', lineHeight: 1.4 }}>{q}</span>
        <IcChevron open={open} />
      </button>
      {open && (
        <div style={{ paddingBottom: 14, fontSize: '0.875rem', color: '#4a6b5a', lineHeight: 1.75, fontWeight: 500 }}>
          {a}
        </div>
      )}
    </div>
  );
}

function ServiceCard({ svc, active, onClick }: { svc: typeof SERVICES[0]; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', borderRadius: 14, border: 'none',
        background: active ? '#03411a' : '#fff',
        color: active ? '#fff' : '#03411a',
        fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
        fontFamily: 'inherit', textAlign: 'left', width: '100%',
        transition: 'all 0.2s ease',
        boxShadow: active ? '0 4px 16px rgba(3,65,26,0.2)' : '0 1px 4px rgba(0,0,0,0.05)',
        borderLeft: active ? '3px solid #4ade80' : '3px solid transparent',
      }}
    >
      <span style={{ opacity: active ? 1 : 0.6, flexShrink: 0 }}><svc.Icon /></span>
      <span style={{ lineHeight: 1.3 }}>{svc.title}</span>
    </button>
  );
}

export default function ServicesPage() {
  const [activeId, setActiveId] = useState(SERVICES[0].id);
  const svc = SERVICES.find(s => s.id === activeId)!;

  return (
    <SmoothScrollProvider>
      <Navbar />

      {/* Hero */}
      <section style={{
        paddingTop: 'clamp(110px, 14vw, 170px)',
        paddingBottom: 'clamp(40px, 5vw, 64px)',
        background: 'linear-gradient(160deg, #021a09 0%, #03411a 60%, #065e28 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>

          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3.2rem)', fontWeight: 900, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Everything your garden<br />
            <span style={{ color: '#4ade80' }}>needs, done right</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 28px' }}>
            15 professional services — from a one-time care visit to full landscape design. Browse what's included, what's not, and get answers instantly.
          </p>
          <Link href="/book" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#4ade80', color: '#03411a', padding: '13px 28px', borderRadius: 12, fontWeight: 800, textDecoration: 'none', fontSize: '0.92rem', transition: 'all 0.2s' }}>
            Book a Service <IcArrow />
          </Link>
        </div>
        <style>{`@keyframes svc-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }`}</style>
      </section>

      {/* Main layout */}
      <section style={{ background: '#f4f8f5', padding: 'clamp(32px, 5vw, 64px) 0' }}>
        <div className="container">
          <div className="svc-layout">

            {/* Sidebar */}
            <aside className="svc-sidebar">
              <div style={{ background: '#fff', borderRadius: 20, padding: '8px', boxShadow: '0 2px 16px rgba(3,65,26,0.06)', border: '1px solid #e0ebe4' }}>
                <div style={{ padding: '12px 16px 8px', fontSize: '0.65rem', fontWeight: 900, color: '#7a9e8a', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                  Select a service
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {SERVICES.map(s => (
                    <ServiceCard key={s.id} svc={s} active={s.id === activeId} onClick={() => setActiveId(s.id)} />
                  ))}
                </div>
              </div>
            </aside>

            {/* Detail panel */}
            <div className="svc-detail" key={svc.id}>
              {/* Header */}
              <div style={{ background: '#03411a', borderRadius: '20px 20px 0 0', padding: 'clamp(24px, 3vw, 36px)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: -30, top: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(74,222,128,0.07)', pointerEvents: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, position: 'relative', zIndex: 1 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(74,222,128,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80', flexShrink: 0 }}>
                    <svc.Icon />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.7rem)', fontWeight: 900, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>{svc.title}</h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>{svc.overview}</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ background: '#fff', borderRadius: '0 0 20px 20px', padding: 'clamp(20px, 3vw, 36px)', border: '1px solid #e0ebe4', borderTop: 'none' }}>

                {/* Includes / Excludes */}
                <div className="svc-cols">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}><IcCheck /></div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#03411a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>What's Included</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {svc.includes.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}><IcCheck /></span>
                          <span style={{ fontSize: '0.875rem', color: '#2d4a38', fontWeight: 500, lineHeight: 1.5 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}><IcX /></div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#03411a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Not Included</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {svc.excludes.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}><IcX /></span>
                          <span style={{ fontSize: '0.875rem', color: '#4a6b5a', fontWeight: 500, lineHeight: 1.5 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#e8f0ec', margin: '28px 0' }} />

                {/* How it's done */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#03411a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>How It's Done</div>
                  <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
                    {svc.steps.map((step, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#03411a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem', flexShrink: 0 }}>
                            {i + 1}
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2d4a38', textAlign: 'center', maxWidth: 90, lineHeight: 1.35 }}>{step}</span>
                        </div>
                        {i < svc.steps.length - 1 && (
                          <div style={{ width: 'clamp(16px, 4vw, 36px)', height: 2, background: '#c8e6d4', margin: '-18px 6px 0', flexShrink: 0 }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#e8f0ec', margin: '0 0 24px' }} />

                {/* FAQs */}
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#03411a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                    Frequently Asked Questions
                  </div>
                  {svc.faqs.map((faq, i) => (
                    <FaqItem key={i} q={faq.q} a={faq.a} />
                  ))}
                </div>

                {/* CTA */}
                <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link href="/book" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#03411a', color: '#fff', padding: '13px 24px', borderRadius: 12, fontWeight: 800, textDecoration: 'none', fontSize: '0.9rem' }}>
                    Book {svc.title} <IcArrow />
                  </Link>
                  <Link href="/plans" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f4f8f5', color: '#03411a', padding: '13px 24px', borderRadius: 12, fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem', border: '1.5px solid #c8e6d4' }}>
                    View Plans
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        .svc-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 24px;
          align-items: start;
        }
        .svc-sidebar {
          position: sticky;
          top: calc(var(--nav-h) + 20px);
          max-height: calc(100vh - var(--nav-h) - 40px);
          overflow-y: auto;
          scrollbar-width: none;
        }
        .svc-sidebar::-webkit-scrollbar { display: none; }
        .svc-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
        }
        @media (max-width: 900px) {
          .svc-layout {
            grid-template-columns: 1fr !important;
          }
          .svc-sidebar {
            position: static !important;
            max-height: none !important;
            overflow-y: visible !important;
          }
          .svc-sidebar > div {
            display: grid;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0;
          }
          .svc-sidebar > div > div:first-child {
            grid-column: 1 / -1;
          }
          .svc-sidebar > div > div:last-child {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 4px;
          }
        }
        @media (max-width: 600px) {
          .svc-cols {
            grid-template-columns: 1fr !important;
          }
          .svc-sidebar > div > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </SmoothScrollProvider>
  );
}
