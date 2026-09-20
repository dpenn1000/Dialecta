/**
 * dialecta-quotes-app.jsx
 *
 * The Dialecta Quote Library admin and browse UI.
 *
 * Auth tiers, resolved client-side via /api/quotes/admins:
 *   • No member         → browse live library only
 *   • Member            → browse + suggest (lands as draft)
 *   • Admin             → browse + suggest + add + edit + archive
 *                         + drafts queue + admins management
 */

import React, { useState, useMemo } from 'react';
import {
  useQuoteList,
  useAdminStatus,
  useAdminList,
  createQuote,
  suggestQuote,
  updateQuote,
  archiveQuote,
  grantAdmin,
  revokeAdmin,
  aiSuggestQuotes,
  suggestSlug,
} from './dialecta-quotes-data.js';

// ─── Design tokens (mirrors the project palette) ──────────────────────────

const TOKENS = {
  gold:        '#b8862e',
  goldSoft:    '#d4a84a',
  goldFaint:   'rgba(184, 134, 46, 0.18)',
  goldBg:      'rgba(184, 134, 46, 0.06)',
  cream:       '#f7f2e8',
  ink:         '#2a2520',
  inkMid:      '#4a4239',
  inkSoft:     '#6a6058',
  label:       '#8a7e72',
  hairline:    '#c0b8ae',
  red:         '#b8372e',
  green:       '#3aa564',
  white:       '#ffffff',
};

const F = {
  display: "'Cormorant Garamond', serif",
  body:    "'DM Sans', system-ui, sans-serif",
  mono:    "'DM Mono', ui-monospace, monospace",
  serif:   "'Source Serif 4', serif",
};

// ─── Top-level app ────────────────────────────────────────────────────────

export function QuotesApp({ memberId, memberName }) {
  const { isAdmin, loading: authLoading } = useAdminStatus(memberId);
  const [tab, setTab] = useState('live'); // 'live' | 'draft' | 'archived'
  const [filters, setFilters] = useState({});
  const [showAddOrSuggest, setShowAddOrSuggest] = useState(false);
  const [showAdminsPanel, setShowAdminsPanel] = useState(false);
  const [showAISuggest, setShowAISuggest] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);

  const listFilters = useMemo(() => ({
    status: tab,
    memberId,
    ...filters,
  }), [tab, memberId, filters]);

  const { quotes, total, loading, error, reload } = useQuoteList(listFilters);

  const isMember = !!memberId;
  const canSeeNonLive = isAdmin;
  const effectiveTab = canSeeNonLive ? tab : 'live';

  return (
    <div style={S.page}>
      <Header
        memberName={memberName}
        isMember={isMember}
        isAdmin={isAdmin}
        authLoading={authLoading}
        onOpenAddOrSuggest={() => setShowAddOrSuggest(true)}
        onOpenAdminsPanel={() => setShowAdminsPanel(true)}
        onOpenAISuggest={() => setShowAISuggest(true)}
      />

      {canSeeNonLive && (
        <Tabs current={effectiveTab} onChange={setTab} />
      )}

      <Filters filters={filters} onChange={setFilters} />

      <ResultsBar total={total} loading={loading} effectiveTab={effectiveTab} />

      {error && <ErrorState message={error} onRetry={reload} />}

      <div style={S.list}>
        {quotes.map(q => (
          <QuoteCard
            key={q.quote_id}
            quote={q}
            isAdmin={isAdmin}
            onEdit={() => setEditingQuote(q)}
            onArchive={async () => {
              if (!window.confirm(`Archive "${q.text.slice(0, 60)}..."?`)) return;
              try {
                await archiveQuote(memberId, q.quote_id);
                reload();
              } catch (err) {
                alert('Archive failed: ' + err.message);
              }
            }}
            onPromote={async () => {
              try {
                await updateQuote(memberId, q.quote_id, { status: 'live' });
                reload();
              } catch (err) {
                alert('Promote failed: ' + err.message);
              }
            }}
            onRestore={async () => {
              try {
                await updateQuote(memberId, q.quote_id, { status: 'live' });
                reload();
              } catch (err) {
                alert('Restore failed: ' + err.message);
              }
            }}
          />
        ))}
        {!loading && quotes.length === 0 && (
          <EmptyState tab={effectiveTab} />
        )}
      </div>

      {showAddOrSuggest && (
        <AddOrSuggestModal
          memberId={memberId}
          isAdmin={isAdmin}
          onClose={() => setShowAddOrSuggest(false)}
          onSubmitted={() => { setShowAddOrSuggest(false); reload(); }}
        />
      )}

      {editingQuote && isAdmin && (
        <EditModal
          memberId={memberId}
          quote={editingQuote}
          onClose={() => setEditingQuote(null)}
          onSaved={() => { setEditingQuote(null); reload(); }}
        />
      )}

      {showAdminsPanel && isAdmin && (
        <AdminsPanel
          memberId={memberId}
          onClose={() => setShowAdminsPanel(false)}
        />
      )}

      {showAISuggest && isAdmin && (
        <AISuggestModal
          memberId={memberId}
          onClose={() => setShowAISuggest(false)}
          onComplete={reload}
        />
      )}
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────

function Header({ memberName, isMember, isAdmin, authLoading, onOpenAddOrSuggest, onOpenAdminsPanel, onOpenAISuggest }) {
  return (
    <header style={S.header}>
      <div>
        <h1 style={S.h1}>The Quote Library</h1>
        <div style={S.subtitle}>
          {authLoading
            ? 'Loading...'
            : isAdmin
              ? `Admin: ${memberName || 'signed in'}`
              : isMember
                ? `Signed in as ${memberName || 'member'}`
                : 'Browsing as visitor'}
        </div>
      </div>
      <div style={S.headerActions}>
        {isAdmin && (
          <button style={S.buttonGhost} onClick={onOpenAdminsPanel}>
            Manage Admins
          </button>
        )}
        {isAdmin && (
          <button style={S.buttonGhost} onClick={onOpenAISuggest}>
            AI Suggest
          </button>
        )}
        {isMember && (
          <button style={S.buttonPrimary} onClick={onOpenAddOrSuggest}>
            {isAdmin ? 'Add Quote' : 'Suggest a Quote'}
          </button>
        )}
      </div>
    </header>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────

function Tabs({ current, onChange }) {
  return (
    <div style={S.tabs}>
      {[
        { key: 'live', label: 'Live' },
        { key: 'draft', label: 'Drafts' },
        { key: 'archived', label: 'Archive' },
      ].map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{ ...S.tab, ...(current === t.key ? S.tabActive : null) }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Filters ──────────────────────────────────────────────────────────────

const SURFACES   = ['', 'consent', 'reflecting', 'posted', 'pact', 'recommitment'];
const PILLARS    = ['', 'acuity', 'calibration', 'magnanimity', 'discourse', 'consistency', 'reach'];
const ARCHETYPES = ['', 'skeptic', 'synthesizer', 'advocate', 'builder', 'empiricist', 'contextualist', 'illuminator', 'reviser'];
const TRADITIONS = ['', 'stoic', 'classical', 'philosophical', 'modern', 'scientific', 'jewish', 'christian', 'mystical', 'medieval', 'african', 'indigenous', 'sci-fi', 'literary', 'civic-humanist', 'editorial'];

function Filters({ filters, onChange }) {
  const set = (k, v) => onChange({ ...filters, [k]: v || undefined });
  return (
    <div style={S.filters}>
      <FilterSelect label="Surface"   value={filters.surface || ''}   options={SURFACES}   onChange={v => set('surface', v)} />
      <FilterSelect label="Pillar"    value={filters.pillar || ''}    options={PILLARS}    onChange={v => set('pillar', v)} />
      <FilterSelect label="Archetype" value={filters.archetype || ''} options={ARCHETYPES} onChange={v => set('archetype', v)} />
      <FilterSelect label="Tradition" value={filters.tradition || ''} options={TRADITIONS} onChange={v => set('tradition', v)} />
      <input
        type="text"
        placeholder="Search text or source..."
        value={filters.search || ''}
        onChange={e => set('search', e.target.value)}
        style={S.searchInput}
      />
      <input
        type="text"
        placeholder="Author..."
        value={filters.author || ''}
        onChange={e => set('author', e.target.value)}
        style={{ ...S.searchInput, maxWidth: 180 }}
      />
      {Object.values(filters).some(Boolean) && (
        <button style={S.buttonClear} onClick={() => onChange({})}>Clear</button>
      )}
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <label style={S.filterLabel}>
      <span style={S.filterLabelText}>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} style={S.filterSelect}>
        {options.map(o => (
          <option key={o} value={o}>{o ? o : 'any'}</option>
        ))}
      </select>
    </label>
  );
}

// ─── Results bar ──────────────────────────────────────────────────────────

function ResultsBar({ total, loading, effectiveTab }) {
  return (
    <div style={S.resultsBar}>
      {loading
        ? 'Loading...'
        : `${total} ${effectiveTab === 'live' ? 'live' : effectiveTab} ${total === 1 ? 'entry' : 'entries'}`}
    </div>
  );
}

// ─── Quote card ───────────────────────────────────────────────────────────

function QuoteCard({ quote, isAdmin, onEdit, onArchive, onPromote, onRestore }) {
  const status = quote.status || 'live'; // public list omits status field
  return (
    <article style={S.quote}>
      <p style={S.quoteText}>"{quote.text}"</p>
      <div style={S.attribution}>
        {quote.author || 'Unknown'}
        {quote.year ? `, ${quote.year}` : ''}
      </div>
      {quote.source && <div style={S.source}>{quote.source}</div>}
      <div style={S.tags}>
        {(quote.tags || []).map(t => (
          <span key={t} style={S.tag}>{t}</span>
        ))}
        <span style={S.idTag}>{quote.quote_id}</span>
      </div>
      {isAdmin && (
        <div style={S.cardActions}>
          {status === 'draft' && (
            <button style={S.actionBtnGreen} onClick={onPromote}>Promote to Live</button>
          )}
          {status === 'archived' && (
            <button style={S.actionBtn} onClick={onRestore}>Restore to Live</button>
          )}
          <button style={S.actionBtn} onClick={onEdit}>Edit</button>
          {status !== 'archived' && (
            <button style={S.actionBtnRed} onClick={onArchive}>Archive</button>
          )}
          {quote.created_by && (
            <span style={S.audit}>added by {quote.created_by}</span>
          )}
        </div>
      )}
    </article>
  );
}

// ─── Empty / error / ───────────────────────────────────────────────────────

function EmptyState({ tab }) {
  const messages = {
    live:     'No live quotes match the current filters.',
    draft:    'No drafts pending review.',
    archived: 'No archived quotes.',
  };
  return <div style={S.empty}>{messages[tab] || 'No results.'}</div>;
}

function ErrorState({ message, onRetry }) {
  return (
    <div style={S.error}>
      <span>Error: {message}</span>
      {onRetry && <button style={S.buttonGhost} onClick={onRetry}>Retry</button>}
    </div>
  );
}

// ─── Add or Suggest modal ─────────────────────────────────────────────────

function AddOrSuggestModal({ memberId, isAdmin, onClose, onSubmitted }) {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [source, setSource] = useState('');
  const [year, setYear] = useState('');
  const [tagsRaw, setTagsRaw] = useState('');
  const [quoteId, setQuoteId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  // Auto-suggest slug as author/text are typed (only if user hasn't customized)
  const [slugTouched, setSlugTouched] = useState(false);
  React.useEffect(() => {
    if (!slugTouched) setQuoteId(suggestSlug(author, text));
  }, [author, text, slugTouched]);

  const submit = async () => {
    setErr(null);
    setSubmitting(true);
    try {
      const tags = tagsRaw.split(',').map(s => s.trim()).filter(Boolean);
      const body = {
        quote_id: quoteId,
        text,
        author: author || null,
        source: source || null,
        year: year ? parseInt(year, 10) : null,
        tags,
      };
      if (isAdmin) {
        await createQuote(memberId, body);
      } else {
        await suggestQuote(memberId, body);
      }
      onSubmitted();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={isAdmin ? 'Add Quote' : 'Suggest a Quote'} onClose={onClose}>
      <p style={S.modalIntro}>
        {isAdmin
          ? 'New quote will be added to the live library immediately.'
          : 'Your suggestion will be submitted as a draft for admin review.'}
      </p>
      <Field label="Quote text" required>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={3} style={S.input} />
      </Field>
      <Field label="Author">
        <input value={author} onChange={e => setAuthor(e.target.value)} style={S.input} />
      </Field>
      <Field label="Source">
        <input value={source} onChange={e => setSource(e.target.value)} style={S.input} />
      </Field>
      <Field label="Year (optional)">
        <input type="number" value={year} onChange={e => setYear(e.target.value)} style={S.input} />
      </Field>
      <Field label="Tags (comma-separated)">
        <input
          value={tagsRaw}
          onChange={e => setTagsRaw(e.target.value)}
          placeholder="surface-consent, theme-courage, tradition-stoic"
          style={S.input}
        />
      </Field>
      <Field label="Quote ID (slug)" required>
        <input
          value={quoteId}
          onChange={e => { setQuoteId(e.target.value); setSlugTouched(true); }}
          style={S.input}
        />
        <div style={S.fieldHint}>Lowercase letters, digits, hyphens. Auto-generated from author and first words; edit if you want a specific slug.</div>
      </Field>
      {err && <div style={S.modalError}>{err}</div>}
      <div style={S.modalActions}>
        <button style={S.buttonGhost} onClick={onClose} disabled={submitting}>Cancel</button>
        <button style={S.buttonPrimary} onClick={submit} disabled={submitting || !text || !quoteId}>
          {submitting ? 'Submitting...' : isAdmin ? 'Add' : 'Submit Suggestion'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Edit modal ───────────────────────────────────────────────────────────

function EditModal({ memberId, quote, onClose, onSaved }) {
  const [text, setText] = useState(quote.text || '');
  const [author, setAuthor] = useState(quote.author || '');
  const [source, setSource] = useState(quote.source || '');
  const [year, setYear] = useState(quote.year ?? '');
  const [tagsRaw, setTagsRaw] = useState((quote.tags || []).join(', '));
  const [status, setStatus] = useState(quote.status || 'live');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  const save = async () => {
    setErr(null);
    setSubmitting(true);
    try {
      const tags = tagsRaw.split(',').map(s => s.trim()).filter(Boolean);
      await updateQuote(memberId, quote.quote_id, {
        text, author, source, year: year ? parseInt(year, 10) : null, tags, status,
      });
      onSaved();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={`Edit: ${quote.quote_id}`} onClose={onClose}>
      <Field label="Quote text" required>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={3} style={S.input} />
      </Field>
      <Field label="Author"><input value={author} onChange={e => setAuthor(e.target.value)} style={S.input} /></Field>
      <Field label="Source"><input value={source} onChange={e => setSource(e.target.value)} style={S.input} /></Field>
      <Field label="Year"><input type="number" value={year} onChange={e => setYear(e.target.value)} style={S.input} /></Field>
      <Field label="Tags">
        <input value={tagsRaw} onChange={e => setTagsRaw(e.target.value)} style={S.input} />
      </Field>
      <Field label="Status">
        <select value={status} onChange={e => setStatus(e.target.value)} style={S.input}>
          <option value="live">live</option>
          <option value="draft">draft</option>
          <option value="archived">archived</option>
        </select>
      </Field>
      {err && <div style={S.modalError}>{err}</div>}
      <div style={S.modalActions}>
        <button style={S.buttonGhost} onClick={onClose} disabled={submitting}>Cancel</button>
        <button style={S.buttonPrimary} onClick={save} disabled={submitting}>
          {submitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Admins panel ─────────────────────────────────────────────────────────

function AdminsPanel({ memberId, onClose }) {
  const { admins, loading, error, reload } = useAdminList(memberId);
  const [grantId, setGrantId] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const grant = async () => {
    if (!grantId.trim()) return;
    setBusy(true); setErr(null);
    try {
      await grantAdmin(memberId, grantId.trim());
      setGrantId('');
      reload();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (targetId, targetName) => {
    if (!window.confirm(`Revoke admin from ${targetName || targetId}?`)) return;
    setBusy(true); setErr(null);
    try {
      await revokeAdmin(memberId, targetId);
      reload();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Manage Quote Admins" onClose={onClose}>
      <p style={S.modalIntro}>
        Quote admins can add, edit, archive, and review draft submissions. Revoking the last admin is blocked to prevent lockout.
      </p>
      {loading && <div style={S.empty}>Loading admins...</div>}
      {error && <div style={S.modalError}>{error}</div>}
      <div style={S.adminList}>
        {admins.map(a => (
          <div key={a.ghost_member_id} style={S.adminRow}>
            <div>
              <div style={S.adminName}>{a.display_name || '(unnamed)'}</div>
              <div style={S.adminId}>{a.ghost_member_id}</div>
            </div>
            <button
              style={S.actionBtnRed}
              onClick={() => revoke(a.ghost_member_id, a.display_name)}
              disabled={busy}
            >
              Revoke
            </button>
          </div>
        ))}
      </div>
      <div style={S.divider} />
      <Field label="Grant admin (Ghost member uuid)">
        <input
          value={grantId}
          onChange={e => setGrantId(e.target.value)}
          placeholder="2f0d5ff2-570e-405a-8b40-..."
          style={S.input}
        />
        <div style={S.fieldHint}>The target member must have visited the site at least once (lazy-create requirement).</div>
      </Field>
      {err && <div style={S.modalError}>{err}</div>}
      <div style={S.modalActions}>
        <button style={S.buttonGhost} onClick={onClose}>Close</button>
        <button style={S.buttonPrimary} onClick={grant} disabled={busy || !grantId.trim()}>
          {busy ? 'Working...' : 'Grant'}
        </button>
      </div>
    </Modal>
  );
}

// ─── AI Suggest modal ─────────────────────────────────────────────────────

function AISuggestModal({ memberId, onClose, onComplete }) {
  const [targetSurface, setTargetSurface] = useState('');
  const [targetPillar, setTargetPillar] = useState('');
  const [targetArchetype, setTargetArchetype] = useState('');
  const [targetTradition, setTargetTradition] = useState('');
  const [count, setCount] = useState(5);
  const [notes, setNotes] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);

  const hasTarget = !!(targetSurface || targetPillar || targetArchetype || targetTradition);

  const generate = async () => {
    setErr(null);
    setGenerating(true);
    try {
      const r = await aiSuggestQuotes(memberId, {
        target_surface:   targetSurface   || undefined,
        target_pillar:    targetPillar    || undefined,
        target_archetype: targetArchetype || undefined,
        target_tradition: targetTradition || undefined,
        count: parseInt(count, 10),
        notes: notes || undefined,
      });
      setResult(r);
    } catch (e) {
      setErr(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const promote = async (qid) => {
    try {
      await updateQuote(memberId, qid, { status: 'live' });
      setResult({ ...result, inserted: result.inserted.filter(q => q.quote_id !== qid) });
      onComplete?.();
    } catch (e) { alert('Promote failed: ' + e.message); }
  };

  const reject = async (qid) => {
    try {
      await archiveQuote(memberId, qid);
      setResult({ ...result, inserted: result.inserted.filter(q => q.quote_id !== qid) });
      onComplete?.();
    } catch (e) { alert('Reject failed: ' + e.message); }
  };

  if (result) {
    return (
      <Modal title="AI Suggestions" onClose={onClose}>
        <p style={S.modalIntro}>
          {result.inserted.length} draft{result.inserted.length === 1 ? '' : 's'} created from {result.received} candidate{result.received === 1 ? '' : 's'}{result.skipped.length > 0 ? ` (${result.skipped.length} skipped)` : ''}. Review below or in the Drafts tab.
        </p>
        {result.inserted.map(q => (
          <div key={q.quote_id} style={{ ...S.quote, marginBottom: 14 }}>
            <p style={S.quoteText}>"{q.text}"</p>
            <div style={S.attribution}>
              {q.author || 'Unknown'}
              {q.year ? `, ${q.year}` : ''}
            </div>
            {q.source && <div style={S.source}>{q.source}</div>}
            <div style={S.tags}>
              {(q.tags || []).map(t => <span key={t} style={S.tag}>{t}</span>)}
              <span style={S.idTag}>{q.quote_id}</span>
            </div>
            <div style={S.cardActions}>
              <button style={S.actionBtnGreen} onClick={() => promote(q.quote_id)}>Promote to Live</button>
              <button style={S.actionBtnRed}   onClick={() => reject(q.quote_id)}>Reject</button>
            </div>
          </div>
        ))}
        {result.skipped.length > 0 && (
          <div style={{ ...S.modalIntro, marginTop: 16 }}>
            Skipped: {result.skipped.map(s => `${s.quote_id || '?'} (${s.reason})`).join(', ')}
          </div>
        )}
        <div style={S.modalActions}>
          <button style={S.buttonPrimary} onClick={() => setResult(null)}>Generate More</button>
          <button style={S.buttonGhost}   onClick={onClose}>Done</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="AI Suggest" onClose={onClose}>
      <p style={S.modalIntro}>
        Pick one or more targets. Claude Haiku will propose candidates following the Three Tests, avoiding existing entries. Drafts land in the review queue automatically.
      </p>
      <Field label="Target Surface">
        <select value={targetSurface} onChange={e => setTargetSurface(e.target.value)} style={S.input}>
          {SURFACES.map(s => <option key={s} value={s}>{s || 'any'}</option>)}
        </select>
      </Field>
      <Field label="Target Pillar">
        <select value={targetPillar} onChange={e => setTargetPillar(e.target.value)} style={S.input}>
          {PILLARS.map(s => <option key={s} value={s}>{s || 'any'}</option>)}
        </select>
      </Field>
      <Field label="Target Archetype">
        <select value={targetArchetype} onChange={e => setTargetArchetype(e.target.value)} style={S.input}>
          {ARCHETYPES.map(s => <option key={s} value={s}>{s || 'any'}</option>)}
        </select>
      </Field>
      <Field label="Target Tradition">
        <select value={targetTradition} onChange={e => setTargetTradition(e.target.value)} style={S.input}>
          {TRADITIONS.map(s => <option key={s} value={s}>{s || 'any'}</option>)}
        </select>
      </Field>
      <Field label="Count (1-10)">
        <input type="number" min={1} max={10} value={count} onChange={e => setCount(e.target.value)} style={S.input} />
      </Field>
      <Field label="Curator notes (optional)">
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="e.g. focus on Eastern traditions, avoid Western philosophers"
          style={S.input}
        />
      </Field>
      {err && <div style={S.modalError}>{err}</div>}
      <div style={S.modalActions}>
        <button style={S.buttonGhost} onClick={onClose} disabled={generating}>Cancel</button>
        <button style={S.buttonPrimary} onClick={generate} disabled={generating || !hasTarget}>
          {generating ? 'Generating...' : 'Generate'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────

function Modal({ title, onClose, children }) {
  return (
    <div style={S.modalBackdrop} onClick={onClose}>
      <div style={S.modalPanel} onClick={e => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <h2 style={S.modalTitle}>{title}</h2>
          <button style={S.modalClose} onClick={onClose}>×</button>
        </div>
        <div style={S.modalBody}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div style={S.field}>
      <label style={S.fieldLabel}>
        {label}
        {required && <span style={{ color: TOKENS.red, marginLeft: 4 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Styles (inline, isolated from any sitewide CSS bleed) ────────────────

const S = {
  page: {
    maxWidth: 1100, margin: '0 auto', padding: '40px 36px 100px',
    fontFamily: F.body, color: TOKENS.ink, lineHeight: 1.55,
  },
  header: {
    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingBottom: 24, marginBottom: 28, borderBottom: `1px solid ${TOKENS.gold}`,
    flexWrap: 'wrap', gap: 16,
  },
  // Visual styling (font, size, gradient, shadow) is handled by the sitewide
  // theme treatment for h1 elements. Only structural spacing here.
  h1: { margin: '0 0 8px 0' },
  subtitle: {
    fontFamily: F.mono, fontSize: 11, color: TOKENS.inkSoft,
    textTransform: 'uppercase', letterSpacing: '0.15em',
  },
  headerActions: { display: 'flex', gap: 10 },

  tabs: { display: 'flex', gap: 0, marginBottom: 18, borderBottom: `1px solid ${TOKENS.hairline}` },
  tab: {
    background: 'transparent', border: 'none', borderBottom: '2px solid transparent',
    padding: '10px 18px', fontFamily: F.mono, fontSize: 11, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: TOKENS.inkSoft, cursor: 'pointer',
  },
  tabActive: {
    color: TOKENS.gold, borderBottomColor: TOKENS.gold, fontWeight: 700,
  },

  filters: {
    display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end',
    marginBottom: 18, padding: '14px 18px', background: TOKENS.goldBg,
    border: `1px solid ${TOKENS.goldFaint}`,
  },
  filterLabel: { display: 'flex', flexDirection: 'column', gap: 4 },
  filterLabelText: {
    fontFamily: F.mono, fontSize: 9, color: TOKENS.label,
    textTransform: 'uppercase', letterSpacing: '0.1em',
  },
  filterSelect: {
    fontFamily: F.body, fontSize: 13, padding: '6px 10px',
    background: TOKENS.white, border: `1px solid ${TOKENS.hairline}`,
    color: TOKENS.ink, minWidth: 130,
  },
  searchInput: {
    fontFamily: F.body, fontSize: 13, padding: '7px 12px', minWidth: 240,
    background: TOKENS.white, border: `1px solid ${TOKENS.hairline}`, color: TOKENS.ink,
  },

  resultsBar: {
    fontFamily: F.mono, fontSize: 10, color: TOKENS.label,
    textTransform: 'uppercase', letterSpacing: '0.12em',
    margin: '0 0 14px 4px',
  },

  list: { display: 'flex', flexDirection: 'column', gap: 16 },

  quote: {
    padding: '22px 26px', background: 'rgba(255,255,255,0.5)',
    borderLeft: `3px solid ${TOKENS.gold}`,
  },
  quoteText: {
    fontFamily: F.display, fontSize: '1.3rem', fontStyle: 'italic',
    color: TOKENS.ink, lineHeight: 1.45, margin: '0 0 14px 0',
  },
  attribution: { fontFamily: F.body, fontSize: 14, fontWeight: 500, color: TOKENS.inkMid },
  source: { fontFamily: F.body, fontSize: 12, color: TOKENS.inkSoft, marginTop: 2 },
  tags: {
    marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: '4px 12px',
    fontFamily: F.mono, fontSize: 9, color: TOKENS.label,
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  tag: {},
  idTag: { color: TOKENS.hairline, marginLeft: 'auto' },

  cardActions: {
    marginTop: 14, paddingTop: 12, borderTop: `1px solid ${TOKENS.goldFaint}`,
    display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
  },
  audit: {
    marginLeft: 'auto', fontFamily: F.mono, fontSize: 9,
    color: TOKENS.label, textTransform: 'uppercase', letterSpacing: '0.1em',
  },

  empty: {
    padding: '60px 20px', textAlign: 'center',
    fontFamily: F.serif, fontSize: 14, fontStyle: 'italic', color: TOKENS.inkSoft,
  },
  error: {
    padding: '14px 18px', marginBottom: 16, background: 'rgba(184, 55, 46, 0.08)',
    border: `1px solid ${TOKENS.red}`, color: TOKENS.red,
    fontFamily: F.body, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },

  buttonPrimary: {
    fontFamily: F.mono, fontSize: 11, padding: '8px 18px',
    background: TOKENS.gold, color: TOKENS.white, border: 'none',
    textTransform: 'uppercase', letterSpacing: '0.12em', cursor: 'pointer',
  },
  buttonGhost: {
    fontFamily: F.mono, fontSize: 11, padding: '8px 16px',
    background: 'transparent', color: TOKENS.inkMid,
    border: `1px solid ${TOKENS.hairline}`,
    textTransform: 'uppercase', letterSpacing: '0.12em', cursor: 'pointer',
  },
  buttonClear: {
    fontFamily: F.mono, fontSize: 9, padding: '6px 12px',
    background: 'transparent', color: TOKENS.gold,
    border: `1px solid ${TOKENS.gold}`,
    textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
  },
  actionBtn: {
    fontFamily: F.mono, fontSize: 9, padding: '5px 11px',
    background: 'transparent', color: TOKENS.inkMid,
    border: `1px solid ${TOKENS.hairline}`,
    textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
  },
  actionBtnRed: {
    fontFamily: F.mono, fontSize: 9, padding: '5px 11px',
    background: 'transparent', color: TOKENS.red,
    border: `1px solid ${TOKENS.red}`,
    textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
  },
  actionBtnGreen: {
    fontFamily: F.mono, fontSize: 9, padding: '5px 11px',
    background: TOKENS.green, color: TOKENS.white, border: 'none',
    textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
  },

  modalBackdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    padding: '60px 20px', zIndex: 1000, overflow: 'auto',
  },
  modalPanel: {
    background: TOKENS.cream, maxWidth: 600, width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 24px', borderBottom: `1px solid ${TOKENS.gold}`,
  },
  modalTitle: {
    fontFamily: F.display, fontSize: '1.6rem', fontWeight: 500,
    color: TOKENS.gold, margin: 0,
  },
  modalClose: {
    background: 'transparent', border: 'none', fontSize: 24,
    color: TOKENS.inkSoft, cursor: 'pointer', padding: 0, lineHeight: 1,
  },
  modalBody: { padding: 24 },
  modalIntro: {
    fontFamily: F.serif, fontStyle: 'italic', fontSize: 13,
    color: TOKENS.inkSoft, marginBottom: 20,
  },
  modalActions: {
    marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 10,
  },
  modalError: {
    padding: '10px 14px', marginBottom: 16, background: 'rgba(184, 55, 46, 0.08)',
    border: `1px solid ${TOKENS.red}`, color: TOKENS.red,
    fontFamily: F.body, fontSize: 13,
  },

  field: { marginBottom: 16 },
  fieldLabel: {
    display: 'block', marginBottom: 6, fontFamily: F.mono, fontSize: 10,
    color: TOKENS.label, textTransform: 'uppercase', letterSpacing: '0.1em',
  },
  fieldHint: {
    marginTop: 4, fontFamily: F.body, fontSize: 11,
    fontStyle: 'italic', color: TOKENS.inkSoft,
  },
  input: {
    width: '100%', fontFamily: F.body, fontSize: 14, padding: '8px 12px',
    background: TOKENS.white, border: `1px solid ${TOKENS.hairline}`, color: TOKENS.ink,
  },

  divider: { height: 1, background: TOKENS.goldFaint, margin: '24px 0' },
  adminList: { display: 'flex', flexDirection: 'column', gap: 10 },
  adminRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', background: TOKENS.white, border: `1px solid ${TOKENS.hairline}`,
  },
  adminName: { fontFamily: F.body, fontSize: 14, fontWeight: 500, color: TOKENS.ink },
  adminId: { fontFamily: F.mono, fontSize: 10, color: TOKENS.label, marginTop: 2 },
};
