'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/store/auth';
import { getComplaintDetail, addComplaintComment } from '@/lib/api';

const STATUS_MAP: Record<string, [string, string]> = {
  open: ['#FEE2E2', '#DC2626'],
  in_progress: ['#DBEAFE', '#2563EB'],
  awaiting_customer: ['#F3E8FF', '#7E22CE'],
  in_review: ['#FEF9C3', '#CA8A04'],
  resolved: ['#DCFCE7', '#16A34A'],
  closed: ['#F3F4F6', '#4B5563'],
  reopened: ['#FFEDD5', '#EA580C'],
};

const fmt = (d?: string) =>
  d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();
  const [comment, setComment] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => { if (!isLoading && !isAuthenticated) router.replace(`/login?redirect=/complaints/${id}`); }, [isAuthenticated, isLoading]);

  const { data: ticket, isLoading: load, error } = useQuery({
    queryKey: ['complaint', id],
    queryFn: () => getComplaintDetail(Number(id)),
    enabled: isAuthenticated && !!id,
  });

  const sendMut = useMutation({
    mutationFn: () => addComplaintComment(Number(id), comment.trim(), files),
    onSuccess: () => {
      setComment(''); setFiles([]);
      toast.success('Reply sent');
      qc.invalidateQueries({ queryKey: ['complaint', id] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading || load) {
    return <><Navbar /><div style={{ paddingTop: 'var(--nav-h)', minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading…</div><Footer /></>;
  }
  if (error || !ticket) {
    return <><Navbar /><div style={{ paddingTop: 'var(--nav-h)', minHeight: '100svh', padding: 40 }}>
      <p>Ticket not found.</p>
      <Link href="/complaints" className="btn btn-outline" style={{ marginTop: 16 }}>← All Tickets</Link>
    </div><Footer /></>;
  }

  const t: any = ticket;
  const [bg, color] = STATUS_MAP[t.status] ?? ['#F3F4F6', '#4B5563'];
  const events = [
    ...((t.comments || []).filter((c: any) => !c.is_internal).map((c: any) => ({ kind: 'comment', at: c.created_at, data: c }))),
    ...((t.history || []).map((h: any) => ({ kind: 'status', at: h.created_at, data: h }))),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return (
    <>
      <Navbar />
      <div style={{ background: 'var(--bg)', paddingTop: 'var(--nav-h)', minHeight: '100svh' }}>
        <div className="container" style={{ padding: '32px 0 80px', maxWidth: 900 }}>
          <Link href="/complaints" style={{ fontSize: '0.85rem', color: 'var(--sage)', textDecoration: 'none', fontWeight: 600 }}>← All Tickets</Link>

          {/* Header */}
          <div className="card" style={{ padding: 28, marginTop: 16, borderRadius: 24 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 800, color: 'var(--earth)' }}>
                {t.ticket_number || `#${t.id}`}
              </span>
              <span style={{ padding: '4px 14px', borderRadius: 99, fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', background: bg, border: `1px solid ${color}40`, color }}>
                {t.status?.replace(/_/g, ' ')}
              </span>
              <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700, background: 'var(--bg-elevated)', color: 'var(--sage)' }}>
                {t.priority}
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 900, color: 'var(--forest)', marginBottom: 8 }}>
              {t.subject || t.type?.replace(/_/g, ' ')}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--sage)', marginBottom: 16 }}>
              Filed on {fmt(t.created_at)}
              {t.department?.name && <> · Department: <strong>{t.department.name}</strong></>}
              {t.assignedTo?.name && <> · Assigned: <strong>{t.assignedTo.name}</strong></>}
            </p>
            <div style={{ padding: 18, background: 'var(--bg-elevated)', borderRadius: 16, fontSize: '0.95rem', color: 'var(--forest)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {t.description}
            </div>
            {t.attachments?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
                {t.attachments.map((a: any) => <Attach key={a.id} a={a} />)}
              </div>
            )}
          </div>

          {/* Timeline */}
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--forest)', marginTop: 32, marginBottom: 16 }}>Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {events.length === 0 && (
              <p style={{ fontSize: '0.9rem', color: 'var(--sage)', fontStyle: 'italic' }}>No replies yet. Our team will respond shortly.</p>
            )}
            {events.map((ev: any, i) => ev.kind === 'comment' ? (
              <CommentCard key={i} c={ev.data} />
            ) : (
              <div key={i} style={{ fontSize: '0.8rem', color: 'var(--sage)', padding: '8px 12px', textAlign: 'center' }}>
                Status changed: <strong>{ev.data.from_status || '—'}</strong> → <strong>{ev.data.to_status}</strong> · {fmt(ev.at)}
              </div>
            ))}
          </div>

          {/* Composer */}
          {t.status !== 'closed' && (
            <div className="card" style={{ padding: 24, marginTop: 24, borderRadius: 20 }}>
              <h3 style={{ fontWeight: 800, marginBottom: 12, color: 'var(--forest)' }}>Reply to this ticket</h3>
              <textarea value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Type your reply…"
                style={{ width: '100%', minHeight: 100, border: '1px solid var(--border-mid)', borderRadius: 14, padding: 14, fontSize: '0.95rem', outline: 'none', resize: 'vertical', color: 'var(--forest)' }} />
              <div style={{ marginTop: 12 }}>
                <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  onChange={e => setFiles(Array.from(e.target.files || []))} style={{ fontSize: '0.85rem' }} />
                {files.length > 0 && <span style={{ marginLeft: 12, fontSize: '0.8rem', color: 'var(--sage)' }}>{files.length} file(s)</span>}
              </div>
              <button onClick={() => sendMut.mutate()}
                disabled={(!comment.trim() && files.length === 0) || sendMut.isPending}
                className="btn btn-primary" style={{ marginTop: 16, opacity: ((!comment.trim() && files.length === 0) || sendMut.isPending) ? 0.5 : 1 }}>
                {sendMut.isPending ? 'Sending…' : 'Send Reply'}
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

function CommentCard({ c }: any) {
  const isStaff = c.user_role === 'admin' || c.user_role === 'supervisor';
  return (
    <div style={{
      padding: 18, borderRadius: 16,
      background: isStaff ? 'var(--bg-elevated)' : '#fff',
      border: `1px solid ${isStaff ? '#A7D7C5' : 'var(--border)'}`,
      borderLeft: `4px solid ${isStaff ? 'var(--forest)' : 'var(--gold)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: '0.8rem' }}>
        <strong style={{ color: 'var(--forest)' }}>{c.user?.name || (isStaff ? 'Support Team' : 'You')}</strong>
        <span style={{ color: 'var(--sage)', fontWeight: 700, fontSize: '0.7rem', background: isStaff ? '#DCFCE7' : '#FEF3C7', padding: '2px 8px', borderRadius: 99 }}>
          {isStaff ? 'Support' : c.user_role}
        </span>
        <span style={{ marginLeft: 'auto', color: 'var(--sage)', fontSize: '0.75rem' }}>{fmt(c.created_at)}</span>
      </div>
      <p style={{ fontSize: '0.95rem', color: 'var(--forest)', whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: 0 }}>{c.comment}</p>
      {c.attachments?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {c.attachments.map((a: any) => <Attach key={a.id} a={a} />)}
        </div>
      )}
    </div>
  );
}

function Attach({ a }: { a: any }) {
  const isImage = (a.file_type || '').startsWith('image/');
  return (
    <a href={a.file_url} target="_blank" rel="noopener noreferrer"
      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#fff', border: '1px solid var(--border)', borderRadius: 12, textDecoration: 'none', color: 'var(--forest)', fontSize: '0.85rem', fontWeight: 600 }}>
      {isImage && <img src={a.file_url} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 8 }} />}
      <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.file_name}</span>
    </a>
  );
}
