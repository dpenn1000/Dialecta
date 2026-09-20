/**
 * dialecta-dev-admin.jsx
 *
 * The /dev-admin/ dashboard. Sectioned admin surface gated by capabilities
 * from migration 017_admin_rbac. Each section is rendered iff the caller
 * holds at least one capability that grants it.
 *
 * Section status (v1):
 *   Team       functional. Lists current admins, grants/revokes roles.
 *                          Backed by /api/admin/team.
 *   Feedback   placeholder. The feedback_items table + submit form arrive
 *                          in the next milestone.
 *   Articles   placeholder. Re-polish/reclassify/archive UIs pending.
 *   Quotes     shortcut to existing /quotes/?admin=true tool.
 *   Members    placeholder. Member directory with PII pending.
 *   Tuning     placeholder. TUNING knob audit pending.
 *
 * Style register: brass+wood+paper tokens, Cormorant italic for display,
 * DM Mono uppercase for utility labels. Matches the existing /quotes/ and
 * /profile/ surfaces.
 */

import React, { useState, useEffect, useCallback } from 'react';

const API_BASE = window.__DIALECTA_API_URL__ || '';

const TABS = [
  { id: 'team',     label: 'Team',     test: (caps) => caps.includes('members.view') },
  { id: 'feedback', label: 'Feedback', test: (caps) => caps.includes('feedback.triage') },
  { id: 'articles', label: 'Articles', test: (caps) => ['articles.repolish','articles.reclassify','articles.archive'].some((c) => caps.includes(c)) },
  { id: 'quotes',   label: 'Quotes',   test: (caps) => caps.includes('quotes.curate') },
  { id: 'members',  label: 'Members',  test: (caps) => caps.includes('members.view') },
  { id: 'tuning',   label: 'Tuning',   test: (caps) => caps.includes('tuning.read') },
];

const ROLE_TINTS = {
  publisher: { bg: 'rgba(212,168,74,0.16)', border: 'rgba(184,115,42,0.40)', color: '#7a4a14' },
  editor:    { bg: 'rgba(38,116,212,0.10)', border: 'rgba(38,116,212,0.32)', color: '#1c4a87' },
  curator:   { bg: 'rgba(58,165,100,0.12)', border: 'rgba(58,165,100,0.32)', color: '#1f6a3a' },
  reviewer:  { bg: 'rgba(184,66,154,0.10)', border: 'rgba(184,66,154,0.32)', color: '#7a2a64' },
};

// ─── Root ──────────────────────────────────────────────────────────────────

export function DialectaDevAdmin({ memberUuid, memberName }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    fetch(API_BASE + '/api/profile/' + memberUuid)
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        setProfile(p);
        const caps = p?.effective_capabilities || [];
        // Honor ?tab=<id> from the URL when present and the caller has the
        // capability for it; otherwise land on the first visible tab.
        let landing = null;
        try {
          const urlTab = new URL(window.location.href).searchParams.get('tab');
          if (urlTab) {
            const requested = TABS.find((t) => t.id === urlTab && t.test(caps));
            if (requested) landing = requested.id;
          }
        } catch { /* ignore malformed URL */ }
        if (!landing) {
          const firstVisible = TABS.find((t) => t.test(caps));
          if (firstVisible) landing = firstVisible.id;
        }
        if (landing) setActiveTab(landing);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [memberUuid]);

  // Keep the URL ?tab= in sync with activeTab so deep links and the back
  // button work. replaceState (not pushState) so changing tabs doesn't
  // clutter history with intermediate states.
  useEffect(() => {
    if (!activeTab) return;
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('tab') !== activeTab) {
        url.searchParams.set('tab', activeTab);
        window.history.replaceState({}, '', url.pathname + '?' + url.searchParams.toString() + url.hash);
      }
    } catch { /* ignore */ }
  }, [activeTab]);

  if (loading) return <Loading />;
  if (error)   return <ErrorState message={error} />;

  const roles = profile?.admin_roles || [];
  const caps  = profile?.effective_capabilities || [];

  if (roles.length === 0) {
    return <NoAccess memberName={memberName} />;
  }

  const visibleTabs = TABS.filter((t) => t.test(caps));

  return (
    <div style={pageStyle}>
      <Header memberName={memberName} roles={roles} />
      <Nav tabs={visibleTabs} activeTab={activeTab} onTabClick={setActiveTab} />
      <Content
        tab={activeTab}
        caps={caps}
        memberUuid={memberUuid}
      />
    </div>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────

function Header({ memberName, roles }) {
  return (
    <>
      <div style={headerStyle}>
        <div style={kickerStyle}>The Dialecta Press</div>
        <h1 style={titleStyle}>Dev Admin</h1>
        <div style={subtitleStyle}>
          Signed in as{' '}
          <span style={{
            fontFamily:    "'Cormorant Garamond', Georgia, serif",
            fontStyle:     'italic',
            fontSize:      '1.05rem',
            color:         'var(--brass-deep, #7a4a14)',
            fontWeight:    500,
          }}>{memberName}</span>
          {roles.length > 0 && (
            <>
              <span style={{ margin: '0 10px', color: 'var(--brass-warm, #b8862e)' }}>·</span>
              <RoleChips roles={roles} />
            </>
          )}
        </div>
      </div>
      <div style={headerRuleStyle} />
    </>
  );
}

function RoleChips({ roles }) {
  return (
    <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', verticalAlign: 'middle' }}>
      {roles.map((r) => {
        const tint = ROLE_TINTS[r] || ROLE_TINTS.reviewer;
        return (
          <span
            key={r}
            style={{
              fontFamily:    "'DM Mono', monospace",
              fontSize:      9,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              padding:       '3px 8px',
              borderRadius:  3,
              background:    tint.bg,
              border:        '1px solid ' + tint.border,
              color:         tint.color,
            }}
          >
            {r}
          </span>
        );
      })}
    </span>
  );
}

// ─── Nav ───────────────────────────────────────────────────────────────────

function Nav({ tabs, activeTab, onTabClick }) {
  return (
    <div style={navStyle}>
      {tabs.map((t) => {
        const active = t.id === activeTab;
        return (
          <button
            key={t.id}
            onClick={() => onTabClick(t.id)}
            style={{
              ...navButtonStyle,
              ...(active ? navButtonActiveStyle : null),
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Section dispatcher ────────────────────────────────────────────────────

function Content({ tab, caps, memberUuid }) {
  switch (tab) {
    case 'team':
      return <TeamSection memberUuid={memberUuid} caps={caps} />;
    case 'feedback':
      return <FeedbackSection memberUuid={memberUuid} />;
    case 'articles':
      return <ArticlesSection memberUuid={memberUuid} caps={caps} />;
    case 'quotes':
      return <QuotesShortcut />;
    case 'members':
      return <MembersSection memberUuid={memberUuid} />;
    case 'tuning':
      return <TuningSection memberUuid={memberUuid} />;
    default:
      return null;
  }
}

// ─── Placeholder ───────────────────────────────────────────────────────────

function Placeholder({ title, body, status }) {
  return (
    <div style={sectionStyle}>
      <h2 style={sectionTitleStyle}>{title}</h2>
      <div style={sectionAccentStyle} />
      <p style={sectionBodyStyle}>{body}</p>
      <div style={statusBoxStyle}>{status}</div>
    </div>
  );
}

function QuotesShortcut() {
  return (
    <div style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Quote Library</h2>
      <div style={sectionAccentStyle} />
      <p style={sectionBodyStyle}>
        Quote curation has its own dedicated surface at <code>/quotes/</code>. Open it
        with admin tools enabled to add, edit, archive, and review member submissions.
      </p>
      <a
        href="/quotes/?admin=true"
        style={{
          display:       'inline-block',
          marginTop:     12,
          fontFamily:    "'DM Mono', monospace",
          fontSize:      11,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          color:         'var(--cream, #faf6ee)',
          backgroundColor: 'var(--brass-warm, #b8862e)',
          padding:       '10px 22px',
          borderRadius:  4,
          textDecoration: 'none',
          border:        '1px solid var(--brass-deep, #7a4a14)',
        }}
      >
        Open Quote Library →
      </a>
    </div>
  );
}

// ─── Team section ──────────────────────────────────────────────────────────

function TeamSection({ memberUuid, caps }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGrant, setShowGrant] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(null);

  const canManage = caps.includes('members.manage_roles');

  const reload = useCallback(() => {
    setLoading(true);
    fetch(API_BASE + '/api/admin/team?member_id=' + memberUuid)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [memberUuid]);

  useEffect(() => { reload(); }, [reload]);

  const handleRevoke = async (target_member_id, role_id) => {
    const ok = window.confirm('Revoke ' + role_id + ' from this member?');
    if (!ok) return;
    setActionInProgress(target_member_id + ':' + role_id);
    try {
      const res = await fetch(API_BASE + '/api/admin/team?member_id=' + memberUuid, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke', target_member_id, role_id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert('Revoke failed: ' + (err.error || res.status));
      }
      reload();
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading) return <Loading />;
  if (error)   return <ErrorState message={error} />;

  const admins = data?.admins || [];
  const roles  = data?.available_roles || [];

  return (
    <div style={sectionStyle}>
      <h2 style={sectionTitleStyle}>The Masthead</h2>
      <div style={sectionAccentStyle} />
      <p style={sectionBodyStyle}>
        Everyone with an admin role on the platform. Roles determine what
        each person can do; capabilities derive from roles and overrides.
      </p>

      {admins.length === 0 ? (
        <div style={emptyStateStyle}>No admins yet.</div>
      ) : (
        <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
          {admins.map((a) => (
            <AdminCard
              key={a.profile_id}
              admin={a}
              canManage={canManage}
              onRevoke={handleRevoke}
              actionInProgress={actionInProgress}
            />
          ))}
        </div>
      )}

      {canManage && (
        <div style={{ marginTop: 26 }}>
          <button onClick={() => setShowGrant(true)} style={primaryButtonStyle}>
            + Grant New Role
          </button>
        </div>
      )}

      {showGrant && canManage && (
        <GrantRoleModal
          memberUuid={memberUuid}
          availableRoles={roles}
          onClose={() => setShowGrant(false)}
          onSuccess={() => { setShowGrant(false); reload(); }}
        />
      )}
    </div>
  );
}

function AdminCard({ admin, canManage, onRevoke, actionInProgress }) {
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 8 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.3rem', fontWeight: 500, color: 'var(--ink, #2a2521)' }}>
          {admin.display_name || '(no name)'}
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#8c8780', letterSpacing: '0.06em' }}>
          {admin.ghost_member_id?.slice(0, 8)}…
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {admin.roles.map((r) => {
          const tint = ROLE_TINTS[r.role_id] || ROLE_TINTS.reviewer;
          const busy = actionInProgress === admin.ghost_member_id + ':' + r.role_id;
          return (
            <div key={r.role_id} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{
                fontFamily:    "'DM Mono', monospace",
                fontSize:      10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                padding:       '4px 10px',
                borderRadius:  3,
                background:    tint.bg,
                border:        '1px solid ' + tint.border,
                color:         tint.color,
              }}>
                {r.role_id}
              </span>
              <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 12, color: '#6e6963' }}>
                granted {r.granted_at ? new Date(r.granted_at).toLocaleDateString() : '?'}
                {r.granted_by_name ? ' by ' + r.granted_by_name : ''}
              </span>
              {r.note && (
                <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontStyle: 'italic', fontSize: 12, color: '#8c8780' }}>
                  "{r.note}"
                </span>
              )}
              {canManage && (
                <button
                  onClick={() => onRevoke(admin.ghost_member_id, r.role_id)}
                  disabled={busy}
                  style={{ ...subtleButtonStyle, marginLeft: 'auto', opacity: busy ? 0.5 : 1 }}
                >
                  {busy ? 'Revoking…' : 'Revoke'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Feedback section ──────────────────────────────────────────────────────

const FEEDBACK_STATUS_ORDER = ['new', 'triaged', 'approved', 'in_progress', 'shipped', 'declined', 'duplicate'];
const FEEDBACK_TYPE_LABELS = {
  bug:      'Bug',
  idea:     'Idea',
  content:  'Content',
  question: 'Question',
  nit:      'Nit',
};
const FEEDBACK_PRIORITY_TINTS = {
  critical: { bg: '#fbe9e2', border: 'rgba(140,74,47,0.40)', color: '#8c2a14' },
  high:     { bg: 'rgba(220,84,24,0.10)', border: 'rgba(220,84,24,0.32)', color: '#9c3a14' },
  medium:   { bg: 'rgba(212,168,74,0.12)', border: 'rgba(184,115,42,0.32)', color: '#7a4a14' },
  low:      { bg: 'rgba(120,120,120,0.08)', border: 'rgba(120,120,120,0.24)', color: '#6e6963' },
};
const FEEDBACK_STATUS_TINTS = {
  new:         { bg: 'rgba(38,116,212,0.10)', border: 'rgba(38,116,212,0.32)', color: '#1c4a87' },
  triaged:     { bg: 'rgba(212,168,74,0.10)', border: 'rgba(184,115,42,0.32)', color: '#7a4a14' },
  approved:    { bg: 'rgba(58,165,100,0.10)', border: 'rgba(58,165,100,0.32)', color: '#1f6a3a' },
  in_progress: { bg: 'rgba(184,66,154,0.10)', border: 'rgba(184,66,154,0.32)', color: '#7a2a64' },
  shipped:     { bg: 'rgba(58,165,100,0.18)', border: 'rgba(58,165,100,0.40)', color: '#0f4a24' },
  declined:    { bg: 'rgba(120,120,120,0.10)', border: 'rgba(120,120,120,0.32)', color: '#4e4944' },
  duplicate:   { bg: 'rgba(120,120,120,0.10)', border: 'rgba(120,120,120,0.32)', color: '#4e4944' },
};

function FeedbackSection({ memberUuid }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null); // null = all

  const reload = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ member_id: memberUuid });
    if (statusFilter) params.set('status', statusFilter);
    fetch(API_BASE + '/api/admin/feedback?' + params.toString())
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [memberUuid, statusFilter]);

  useEffect(() => { reload(); }, [reload]);

  if (error) return <ErrorState message={error} />;

  const items = data?.items || [];
  const counts = data?.status_counts || {};
  const totalAll = Object.values(counts).reduce((s, n) => s + n, 0);

  return (
    <div style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Feedback Queue</h2>
      <div style={sectionAccentStyle} />
      <p style={sectionBodyStyle}>
        Every submission lands here. No input is dismissed without review:
        items default to <code>new</code> and require a triage decision
        (including <code>declined</code> with a reason note) to leave that
        status. Triage controls ship in the next round.
      </p>

      {/* Status filter strip */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
        <FilterPill
          label={'All' + (totalAll ? ' (' + totalAll + ')' : '')}
          active={statusFilter === null}
          onClick={() => setStatusFilter(null)}
        />
        {FEEDBACK_STATUS_ORDER.map((s) => {
          const n = counts[s] || 0;
          if (n === 0 && statusFilter !== s) return null;
          return (
            <FilterPill
              key={s}
              label={s.replace('_', ' ') + ' (' + n + ')'}
              active={statusFilter === s}
              onClick={() => setStatusFilter(statusFilter === s ? null : s)}
            />
          );
        })}
      </div>

      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <div style={emptyStateStyle}>
          {statusFilter ? `No items in ${statusFilter}.` : 'No feedback yet.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {items.map((i) => (
            <FeedbackCard
              key={i.id}
              item={i}
              memberUuid={memberUuid}
              onUpdate={reload}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily:    "'DM Mono', monospace",
        fontSize:      10,
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        fontWeight:    500,
        color:         active ? 'var(--cream, #faf6ee)' : 'var(--brass-deep, #7a4a14)',
        background:    active ? 'var(--brass-warm, #b8862e)' : 'transparent',
        border:        '1px solid ' + (active ? 'var(--brass-deep, #7a4a14)' : 'rgba(184,115,42,0.32)'),
        borderRadius:  3,
        padding:       '6px 12px',
        cursor:        'pointer',
      }}
    >
      {label}
    </button>
  );
}

// SLA threshold in hours from submission to acknowledgment. Items past this
// surface as "overdue" red; halfway there as "approaching" amber. TUNING
// candidate: surface in the future tuning engine if the cohort grows.
const FEEDBACK_SLA_HOURS = 48;

const FEEDBACK_PRIORITY_ORDER = ['critical', 'high', 'medium', 'low'];

function formatTimeSince(date) {
  if (!date) return '';
  const ms = Date.now() - date.getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1)    return 'just now';
  if (minutes < 60)   return minutes + 'm';
  const hours = Math.floor(minutes / 60);
  if (hours < 24)     return hours + 'h';
  const days = Math.floor(hours / 24);
  if (days < 30)      return days + 'd';
  return date.toLocaleDateString();
}

function FeedbackCard({ item, memberUuid, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [showTriage, setShowTriage] = useState(false);
  const [acking, setAcking] = useState(false);
  const [ackError, setAckError] = useState(null);

  const priTint = FEEDBACK_PRIORITY_TINTS[item.priority] || FEEDBACK_PRIORITY_TINTS.medium;
  const stTint  = FEEDBACK_STATUS_TINTS[item.status] || FEEDBACK_STATUS_TINTS.new;
  const meta    = item.captured_metadata || {};
  const submittedAt = item.submitted_at ? new Date(item.submitted_at) : null;
  const ackedAt = item.acknowledged_at ? new Date(item.acknowledged_at) : null;

  // SLA computation: overdue if unacked + past SLA hours; approaching if
  // unacked + halfway past SLA. Acked items get a green "acknowledged" pill.
  const hoursSinceSubmit = submittedAt
    ? (Date.now() - submittedAt.getTime()) / 3600000
    : 0;
  const overdue     = !ackedAt && hoursSinceSubmit > FEEDBACK_SLA_HOURS;
  const approaching = !ackedAt && !overdue && hoursSinceSubmit > FEEDBACK_SLA_HOURS / 2;

  const slaTint = ackedAt
    ? { bg: 'rgba(58,165,100,0.10)', border: 'rgba(58,165,100,0.32)', color: '#1f6a3a' }
    : overdue
      ? { bg: '#fbe9e2', border: 'rgba(140,74,47,0.40)', color: '#8c2a14' }
      : approaching
        ? { bg: 'rgba(220,84,24,0.10)', border: 'rgba(220,84,24,0.32)', color: '#9c3a14' }
        : { bg: 'rgba(38,116,212,0.08)', border: 'rgba(38,116,212,0.24)', color: '#1c4a87' };

  const slaLabel = ackedAt
    ? 'Ack ' + formatTimeSince(ackedAt) + ' ago'
    : overdue
      ? 'Overdue · ' + formatTimeSince(submittedAt) + ' unacked'
      : approaching
        ? 'Approaching SLA · ' + formatTimeSince(submittedAt)
        : 'Awaiting ack · ' + formatTimeSince(submittedAt);

  const handleAck = async () => {
    setAcking(true);
    setAckError(null);
    try {
      const res = await fetch(API_BASE + '/api/admin/feedback/' + item.id + '?member_id=' + memberUuid, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledge: true }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'HTTP ' + res.status);
      }
      onUpdate();
    } catch (err) {
      setAckError(err.message);
    } finally {
      setAcking(false);
    }
  };

  return (
    <div style={cardStyle}>
      {/* Header row: badges + reporter + SLA */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Badge tint={priTint}>{item.priority}</Badge>
        <Badge tint={{ bg: 'rgba(120,120,120,0.08)', border: 'rgba(120,120,120,0.24)', color: '#4e4944' }}>
          {FEEDBACK_TYPE_LABELS[item.type] || item.type}
        </Badge>
        <Badge tint={stTint}>{item.status.replace('_', ' ')}</Badge>
        <Badge tint={slaTint}>{slaLabel}</Badge>
        <div style={{ marginLeft: 'auto', fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 11, color: '#8c8780' }}>
          {item.reporter_display_name || '(anonymous)'}
          {submittedAt && (
            <span style={{ color: '#b0aba4', marginLeft: 8 }}>
              · {submittedAt.toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      {item.title && (
        <div style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize:   '1.2rem',
          fontWeight: 500,
          fontStyle:  'italic',
          color:      'var(--ink, #2a2521)',
          marginBottom: 8,
        }}>
          {item.title}
        </div>
      )}

      {/* Body */}
      <div style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize:   13,
        lineHeight: 1.6,
        color:      '#3e3934',
        whiteSpace: 'pre-wrap',
      }}>
        {item.body}
      </div>

      {/* Screenshot thumbnail if the reporter attached one. Click to open
          full size in a new tab. Public bucket, non-guessable filename. */}
      {meta.screenshot_url && (
        <div style={{ marginTop: 12 }}>
          <a
            href={meta.screenshot_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-block', textDecoration: 'none' }}
          >
            <img
              src={meta.screenshot_url}
              alt="Submitted screenshot"
              style={{
                maxWidth:     280,
                maxHeight:    180,
                borderRadius: 4,
                border:       '1px solid rgba(184,115,42,0.24)',
                cursor:       'zoom-in',
                display:      'block',
              }}
            />
            <div style={{
              fontFamily:    "'DM Mono', monospace",
              fontSize:      9,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color:         '#8c8780',
              marginTop:     4,
            }}>
              Click to enlarge ↗
            </div>
          </a>
        </div>
      )}

      {/* Metadata drilldown */}
      {Object.keys(meta).length > 0 && (
        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              ...subtleButtonStyle,
              padding:    '4px 10px',
              fontSize:   9,
            }}
          >
            {expanded ? 'Hide' : 'Show'} metadata
          </button>
          {expanded && (
            <pre style={{
              marginTop:   8,
              padding:     '12px 14px',
              background:  'rgba(212,168,74,0.06)',
              border:      '1px solid rgba(184,115,42,0.14)',
              borderRadius: 3,
              fontFamily:  "'DM Mono', monospace",
              fontSize:    11,
              lineHeight:  1.5,
              color:       '#4e4944',
              whiteSpace:  'pre-wrap',
              overflowX:   'auto',
            }}>
              {JSON.stringify(meta, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* Triage note (if set) */}
      {item.triage_note && (
        <div style={{
          marginTop: 12,
          padding:   '10px 12px',
          background: 'rgba(212,168,74,0.06)',
          borderLeft: '2px solid var(--brass-warm, #b8862e)',
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontStyle:  'italic',
          fontSize:   12,
          color:      '#4e4944',
        }}>
          <span style={{ fontWeight: 500, fontStyle: 'normal' }}>Triage note: </span>
          {item.triage_note}
        </div>
      )}

      {/* Action row */}
      <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
        {!ackedAt && (
          <button
            onClick={handleAck}
            disabled={acking}
            style={{ ...subtleButtonStyle, opacity: acking ? 0.5 : 1 }}
          >
            {acking ? 'Acknowledging…' : 'Acknowledge'}
          </button>
        )}
        <button
          onClick={() => setShowTriage(true)}
          style={subtleButtonStyle}
        >
          Triage
        </button>
        {ackError && (
          <span style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize:   12,
            color:      '#8c2a14',
            alignSelf:  'center',
          }}>
            {ackError}
          </span>
        )}
      </div>

      {showTriage && (
        <TriageModal
          item={item}
          memberUuid={memberUuid}
          onClose={() => setShowTriage(false)}
          onSuccess={() => { setShowTriage(false); onUpdate(); }}
        />
      )}
    </div>
  );
}

function TriageModal({ item, memberUuid, onClose, onSuccess }) {
  const [status, setStatus] = useState(item.status);
  const [priority, setPriority] = useState(item.priority);
  const [triageNote, setTriageNote] = useState(item.triage_note || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const declineRequiresNote = status === 'declined';
  const noteOk = !declineRequiresNote || triageNote.trim().length >= 5;
  const dirty = status !== item.status ||
                priority !== item.priority ||
                (triageNote.trim() || null) !== (item.triage_note || null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const body = {};
      if (status !== item.status)     body.status = status;
      if (priority !== item.priority) body.priority = priority;
      if ((triageNote.trim() || null) !== (item.triage_note || null)) {
        body.triage_note = triageNote.trim() || '';
      }

      const res = await fetch(API_BASE + '/api/admin/feedback/' + item.id + '?member_id=' + memberUuid, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'HTTP ' + res.status);
      }
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={modalScrimStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{
          fontFamily:   "'Cormorant Garamond', Georgia, serif",
          fontStyle:    'italic',
          fontSize:     '1.5rem',
          fontWeight:   500,
          margin:       '0 0 6px',
          color:        'var(--ink, #2a2521)',
        }}>
          Triage
        </h3>
        <div style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize:   12,
          color:      '#6e6963',
          marginBottom: 18,
          fontStyle:  'italic',
        }}>
          {item.title || (item.body.length > 80 ? item.body.slice(0, 80) + '…' : item.body)}
        </div>

        <form onSubmit={handleSubmit}>
          <Label>Status</Label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={inputStyle}
          >
            {FEEDBACK_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>

          <Label style={{ marginTop: 16 }}>Priority</Label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={inputStyle}
          >
            {FEEDBACK_PRIORITY_ORDER.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <Label style={{ marginTop: 16 }}>
            Triage note {declineRequiresNote && (
              <span style={{ color: '#8c2a14', fontStyle: 'normal' }}>· required for decline</span>
            )}
          </Label>
          <textarea
            value={triageNote}
            onChange={(e) => setTriageNote(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder={declineRequiresNote
              ? 'Why declining? (must be at least 5 characters; visible to the reporter on their item)'
              : 'Optional context: why this priority, what to investigate, who to ping'}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 90 }}
          />

          {error && (
            <div style={{
              marginTop:    14,
              padding:      '10px 14px',
              borderRadius: 4,
              background:   '#fbe9e2',
              color:        '#8c2a14',
              fontSize:     13,
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 22 }}>
            <button type="button" onClick={onClose} style={subtleButtonStyle}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={!dirty || !noteOk || submitting}
              style={{ ...primaryButtonStyle, opacity: (!dirty || !noteOk || submitting) ? 0.5 : 1 }}
            >
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Badge({ children, tint }) {
  return (
    <span style={{
      fontFamily:    "'DM Mono', monospace",
      fontSize:      9,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      padding:       '3px 8px',
      borderRadius:  3,
      background:    tint.bg,
      border:        '1px solid ' + tint.border,
      color:         tint.color,
    }}>
      {children}
    </span>
  );
}

// ─── Members section ───────────────────────────────────────────────────────

const MEMBER_SORTS = [
  { id: 'last_active', label: 'Last active' },
  { id: 'comments',    label: 'Most comments' },
  { id: 'articles',    label: 'Most articles' },
  { id: 'graduations', label: 'Graduations' },
  { id: 'name',        label: 'Name (A–Z)' },
  { id: 'joined',      label: 'Newest joined' },
];

const MEMBER_FILTERS = [
  { id: 'all',         label: 'All',         test: () => true },
  { id: 'authors',     label: 'Authors',     test: (m) => m.is_author },
  { id: 'admins',      label: 'Admins',      test: (m) => m.roles.length > 0 || m.is_admin },
  { id: 'pact',        label: 'Pact signed', test: (m) => !!m.pact_agreed_at },
  { id: 'active_7d',   label: 'Active 7d',   test: (m) => isActiveWithin(m.last_active_at, 7) },
  { id: 'active_30d',  label: 'Active 30d',  test: (m) => isActiveWithin(m.last_active_at, 30) },
  { id: 'dormant',     label: 'Dormant 30d+',test: (m) => !isActiveWithin(m.last_active_at, 30) },
];

function isActiveWithin(iso, days) {
  if (!iso) return false;
  const ageMs = Date.now() - new Date(iso).getTime();
  return ageMs < days * 24 * 3600 * 1000;
}

function MembersSection({ memberUuid }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [sort, setSort]       = useState('last_active');
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(API_BASE + '/api/admin/members?member_id=' + memberUuid)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [memberUuid]);

  if (loading) return <Loading />;
  if (error)   return <ErrorState message={error} />;

  const all = data?.members || [];
  const summary = data?.summary || {};

  const activeFilter = MEMBER_FILTERS.find((f) => f.id === filter) || MEMBER_FILTERS[0];
  const q = search.trim().toLowerCase();

  const filtered = all
    .filter(activeFilter.test)
    .filter((m) => !q ||
      (m.display_name && m.display_name.toLowerCase().includes(q)) ||
      (m.email        && m.email.toLowerCase().includes(q)) ||
      (m.location     && m.location.toLowerCase().includes(q))
    );

  const sorted = sortMembers(filtered, sort);

  return (
    <div style={sectionStyle}>
      <h2 style={sectionTitleStyle}>The Membership</h2>
      <div style={sectionAccentStyle} />
      <p style={sectionBodyStyle}>
        Every contributor on the platform with their activity level at a
        glance. Use this view to spot dormant members, identify your most
        active voices, and watch the cohort grow.
      </p>

      <SummaryStrip
        items={[
          { label: 'Total',       value: summary.total },
          { label: 'Authors',     value: summary.authors },
          { label: 'Admins',      value: summary.admins },
          { label: 'Pact signed', value: summary.pact_signed },
          { label: 'Active 7d',   value: summary.active_7d },
          { label: 'Active 30d',  value: summary.active_30d },
          { label: 'Dormant',     value: summary.dormant_30d },
        ]}
      />

      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginTop: 18, marginBottom: 14 }}>
        <input
          type="text"
          placeholder="Search name, email, location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: '1 1 200px', maxWidth: 360 }}
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{ ...inputStyle, width: 'auto', flex: '0 0 auto' }}
        >
          {MEMBER_SORTS.map((s) => (
            <option key={s.id} value={s.id}>Sort: {s.label}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
        {MEMBER_FILTERS.map((f) => (
          <FilterPill
            key={f.id}
            label={f.label}
            active={filter === f.id}
            onClick={() => setFilter(f.id)}
          />
        ))}
      </div>

      {sorted.length === 0 ? (
        <div style={emptyStateStyle}>
          {q || filter !== 'all' ? 'No members match the current filter.' : 'No members yet.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {sorted.map((m) => (
            <MemberCard key={m.ghost_member_id} member={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function sortMembers(members, key) {
  const arr = [...members];
  const cmpDateDesc = (a, b) => {
    const av = a ? new Date(a).getTime() : 0;
    const bv = b ? new Date(b).getTime() : 0;
    return bv - av;
  };
  switch (key) {
    case 'comments':
      return arr.sort((a, b) => (b.comment_count || 0) - (a.comment_count || 0));
    case 'articles':
      return arr.sort((a, b) => (b.published_articles || 0) - (a.published_articles || 0));
    case 'graduations':
      return arr.sort((a, b) => (b.total_graduations || 0) - (a.total_graduations || 0));
    case 'name':
      return arr.sort((a, b) => (a.display_name || '').localeCompare(b.display_name || ''));
    case 'joined':
      return arr.sort((a, b) => cmpDateDesc(a.ghost_created_at, b.ghost_created_at));
    case 'last_active':
    default:
      return arr.sort((a, b) => cmpDateDesc(a.last_active_at, b.last_active_at));
  }
}

function MemberCard({ member }) {
  const initials = computeInitials(member.display_name);
  const lastActive = member.last_active_at ? new Date(member.last_active_at) : null;
  const joined = member.ghost_created_at ? new Date(member.ghost_created_at) : null;

  // Activity dot color: green if active <7d, amber <30d, grey beyond.
  const activityHue = !lastActive
    ? '#b0aba4'
    : isActiveWithin(member.last_active_at, 7)
      ? '#3aa564'
      : isActiveWithin(member.last_active_at, 30)
        ? '#d49415'
        : '#b0aba4';

  return (
    <div style={cardStyle}>
      {/* Header row: avatar + name/email + role chips */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 10 }}>
        <Avatar url={member.avatar_url} initials={initials} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize:   '1.3rem',
              fontWeight: 500,
              color:      'var(--ink, #2a2521)',
            }}>
              {member.display_name || '(no name)'}
            </div>
            <span style={{
              display: 'inline-block',
              width: 8, height: 8,
              borderRadius: '50%',
              background: activityHue,
              flexShrink: 0,
            }} title={lastActive ? 'Last active ' + formatTimeSince(lastActive) + ' ago' : 'Never active'} />
          </div>
          {member.email && (
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize:   11,
              color:      '#6e6963',
              marginTop:  2,
              wordBreak:  'break-all',
            }}>
              {member.email}
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {member.roles.map((r) => {
              const tint = ROLE_TINTS[r] || ROLE_TINTS.reviewer;
              return <Badge key={r} tint={tint}>{r}</Badge>;
            })}
            {member.is_author && (
              <Badge tint={{ bg: 'rgba(184,115,42,0.10)', border: 'rgba(184,115,42,0.32)', color: '#7a4a14' }}>
                Author
              </Badge>
            )}
            {member.is_seed && (
              <Badge tint={{ bg: 'rgba(120,120,120,0.10)', border: 'rgba(120,120,120,0.30)', color: '#4e4944' }}>
                Seed
              </Badge>
            )}
            {member.archetype && (
              <Badge tint={{ bg: 'rgba(58,165,100,0.10)', border: 'rgba(58,165,100,0.32)', color: '#1f6a3a' }}>
                {member.archetype.label}
              </Badge>
            )}
            {member.order && (
              <Badge tint={{ bg: 'rgba(184,66,154,0.10)', border: 'rgba(184,66,154,0.32)', color: '#7a2a64' }}>
                {member.order.label}
              </Badge>
            )}
            {member.pact_agreed_at && (
              <Badge tint={{ bg: 'rgba(212,168,74,0.10)', border: 'rgba(184,115,42,0.32)', color: '#7a4a14' }}>
                Pact signed
              </Badge>
            )}
          </div>
          {member.location && (
            <div style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize:   12,
              color:      '#8c8780',
              marginTop:  6,
              fontStyle:  'italic',
            }}>
              {member.location}
            </div>
          )}
        </div>
      </div>

      {/* Activity stats grid */}
      <div style={{
        display:    'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
        gap:        10,
        marginTop:  4,
        padding:    '12px 14px',
        background: 'rgba(212,168,74,0.06)',
        border:     '1px solid rgba(184,115,42,0.14)',
        borderRadius: 3,
      }}>
        <Stat label="Comments"     value={member.comment_count} />
        <Stat label="Articles"     value={member.published_articles} />
        <Stat label="Graduations"  value={member.total_graduations} />
        <Stat label="Followers"    value={member.follower_count} />
        <Stat label="Following"    value={member.following_count} />
        <Stat
          label="Last active"
          value={lastActive ? formatTimeSince(lastActive) : '—'}
          sub={lastActive ? lastActive.toLocaleDateString() : null}
        />
        <Stat
          label="Joined"
          value={joined ? formatTimeSince(joined) : '—'}
          sub={joined ? joined.toLocaleDateString() : null}
        />
      </div>

      {/* Profile link */}
      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
        <a
          href={'/profile/?member_id=' + encodeURIComponent(member.ghost_member_id)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...subtleButtonStyle, textDecoration: 'none' }}
        >
          View profile ↗
        </a>
      </div>
    </div>
  );
}

function Avatar({ url, initials }) {
  const size = 44;
  if (url) {
    return (
      <img
        src={url}
        alt=""
        style={{
          width: size, height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '1px solid rgba(184,115,42,0.24)',
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(212,168,74,0.16)',
      border: '1px solid rgba(184,115,42,0.24)',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontStyle: 'italic',
      fontSize: 16,
      color: 'var(--brass-deep, #7a4a14)',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function computeInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts.slice(0, 2).map((w) => (w[0] || '').toUpperCase()).join('') || '?';
}

function Stat({ label, value, sub }) {
  return (
    <div>
      <div style={{
        fontFamily:    "'DM Mono', monospace",
        fontSize:      9,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color:         '#8c8780',
        marginBottom:  3,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize:   '1.15rem',
        fontWeight: 500,
        color:      'var(--ink, #2a2521)',
        lineHeight: 1.2,
      }}>
        {value ?? '0'}
      </div>
      {sub && (
        <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 10, color: '#8c8780', marginTop: 2 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function SummaryStrip({ items }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
      gap: 8,
      padding: '14px 16px',
      background: 'rgba(212,168,74,0.06)',
      border: '1px solid rgba(184,115,42,0.18)',
      borderRadius: 4,
      marginTop: 6,
    }}>
      {items.map((it) => (
        <div key={it.label}>
          <div style={{
            fontFamily:    "'DM Mono', monospace",
            fontSize:      9,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color:         '#8c8780',
            marginBottom:  4,
          }}>
            {it.label}
          </div>
          <div style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle:  'italic',
            fontSize:   '1.4rem',
            fontWeight: 500,
            color:      'var(--brass-deep, #7a4a14)',
            lineHeight: 1.1,
          }}>
            {it.value ?? 0}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Articles section ──────────────────────────────────────────────────────

const TIER_TINTS = {
  forum:  { bg: 'rgba(58,165,100,0.10)',  border: 'rgba(58,165,100,0.32)',  color: '#1f6a3a' },
  spark:  { bg: 'rgba(212,168,74,0.16)',  border: 'rgba(184,115,42,0.40)',  color: '#7a4a14' },
  echo:   { bg: 'rgba(38,116,212,0.10)',  border: 'rgba(38,116,212,0.32)',  color: '#1c4a87' },
  fog:    { bg: 'rgba(120,120,120,0.10)', border: 'rgba(120,120,120,0.32)', color: '#4e4944' },
  heat:   { bg: 'rgba(220,84,24,0.10)',   border: 'rgba(220,84,24,0.32)',   color: '#9c3a14' },
  stance: { bg: 'rgba(184,66,154,0.10)',  border: 'rgba(184,66,154,0.32)',  color: '#7a2a64' },
  breach: { bg: '#fbe9e2',                 border: 'rgba(140,74,47,0.40)',  color: '#8c2a14' },
};

const POLISH_TINTS = {
  light:     { bg: 'rgba(212,168,74,0.08)', border: 'rgba(184,115,42,0.24)', color: '#7a4a14' },
  standard:  { bg: 'rgba(212,168,74,0.16)', border: 'rgba(184,115,42,0.32)', color: '#7a4a14' },
  editorial: { bg: 'rgba(184,115,42,0.22)', border: 'rgba(184,115,42,0.50)', color: '#5a3408' },
  custom:    { bg: 'rgba(38,116,212,0.10)', border: 'rgba(38,116,212,0.32)', color: '#1c4a87' },
};

function ArticlesSection({ memberUuid, caps }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');

  const reload = useCallback(() => {
    setLoading(true);
    fetch(API_BASE + '/api/admin/articles?member_id=' + memberUuid)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [memberUuid]);

  useEffect(() => { reload(); }, [reload]);

  if (loading) return <Loading />;
  if (error)   return <ErrorState message={error} />;

  const all = data?.articles || [];
  const summary = data?.summary || { by_tier: {} };
  const canRepolish = caps.includes('articles.repolish');

  const q = search.trim().toLowerCase();
  const filtered = all
    .filter((a) => {
      if (filter === 'all')        return true;
      if (filter === 'published')  return a.status === 'published';
      if (filter === 'draft')      return a.status === 'draft';
      if (filter === 'mismatched') return a.tier_mismatch;
      // Tier filters: forum/spark/echo/...
      return a.final_tier === filter;
    })
    .filter((a) => !q ||
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.author_display_name && a.author_display_name.toLowerCase().includes(q))
    );

  return (
    <div style={sectionStyle}>
      <h2 style={sectionTitleStyle}>The Catalogue</h2>
      <div style={sectionAccentStyle} />
      <p style={sectionBodyStyle}>
        Every article on the platform with its tier classifications and
        polish history. Spot mis-tiered pieces (declared ≠ final) at a
        glance. Single-article re-polish is also available via the floating
        button on each post page.
      </p>

      <SummaryStrip
        items={[
          { label: 'Total',       value: summary.total },
          { label: 'Published',   value: summary.published },
          { label: 'Draft',       value: summary.draft },
          { label: 'Mismatched',  value: summary.mismatched },
          { label: 'Forum',       value: summary.by_tier?.forum },
          { label: 'Spark',       value: summary.by_tier?.spark },
          { label: 'Heat',        value: summary.by_tier?.heat },
        ]}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginTop: 18, marginBottom: 14 }}>
        <input
          type="text"
          placeholder="Search title or author…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: '1 1 200px', maxWidth: 360 }}
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
        <FilterPill label="All"        active={filter === 'all'}        onClick={() => setFilter('all')} />
        <FilterPill label="Published"  active={filter === 'published'}  onClick={() => setFilter('published')} />
        <FilterPill label="Draft"      active={filter === 'draft'}      onClick={() => setFilter('draft')} />
        <FilterPill label="Mismatched" active={filter === 'mismatched'} onClick={() => setFilter('mismatched')} />
        {Object.keys(summary.by_tier || {})
          .filter((t) => (summary.by_tier[t] || 0) > 0)
          .map((t) => (
            <FilterPill
              key={t}
              label={t + ' (' + summary.by_tier[t] + ')'}
              active={filter === t}
              onClick={() => setFilter(filter === t ? 'all' : t)}
            />
          ))}
      </div>

      {filtered.length === 0 ? (
        <div style={emptyStateStyle}>
          {q || filter !== 'all' ? 'No articles match the current filter.' : 'No articles yet.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {filtered.map((a) => (
            <ArticleCard
              key={a.id}
              article={a}
              memberUuid={memberUuid}
              canRepolish={canRepolish}
              onChanged={reload}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ArticleCard({ article, memberUuid, canRepolish, onChanged }) {
  const created   = article.created_at   ? new Date(article.created_at)   : null;
  const published = article.published_at ? new Date(article.published_at) : null;
  const polishTint = POLISH_TINTS[article.polish_level] || POLISH_TINTS.light;

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {article.feature_image && (
          <img
            src={article.feature_image}
            alt=""
            style={{
              width: 88, height: 64,
              borderRadius: 3,
              objectFit: 'cover',
              border: '1px solid rgba(184,115,42,0.20)',
              flexShrink: 0,
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title */}
          <div style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize:   '1.3rem',
            fontWeight: 500,
            color:      'var(--ink, #2a2521)',
            lineHeight: 1.25,
          }}>
            {article.url ? (
              <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                {article.title}
              </a>
            ) : article.title}
          </div>
          {/* Author + dates */}
          <div style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize:   12,
            color:      '#6e6963',
            marginTop:  4,
          }}>
            by {article.author_display_name || '(unknown)'}
            {published ? ' · published ' + published.toLocaleDateString() : ''}
            {!published && created ? ' · created ' + created.toLocaleDateString() : ''}
            {article.comment_count > 0 ? ' · ' + article.comment_count + ' comment' + (article.comment_count === 1 ? '' : 's') : ''}
          </div>
          {/* Excerpt */}
          {article.excerpt && (
            <div style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize:   13,
              color:      '#3e3934',
              marginTop:  8,
              lineHeight: 1.55,
              fontStyle:  'italic',
              display:    '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow:   'hidden',
            }}>
              {article.excerpt}
            </div>
          )}
        </div>
      </div>

      {/* Tier badges row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12, alignItems: 'center' }}>
        <Badge tint={{ bg: 'rgba(120,120,120,0.10)', border: 'rgba(120,120,120,0.30)', color: '#4e4944' }}>
          {article.status}
        </Badge>
        {article.declared_tier && (
          <TierLabel kind="Declared" tier={article.declared_tier} />
        )}
        {article.ai_suggested_tier && (
          <TierLabel kind="AI" tier={article.ai_suggested_tier} />
        )}
        {article.final_tier && (
          <TierLabel kind="Final" tier={article.final_tier} bold />
        )}
        {article.tier_mismatch && (
          <Badge tint={POLISH_TINTS.editorial}>declared ≠ final</Badge>
        )}
        {article.polish_level && (
          <Badge tint={polishTint}>polish: {article.polish_level}</Badge>
        )}
      </div>

      {/* Action row */}
      <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
        {article.url && (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...subtleButtonStyle, textDecoration: 'none' }}
          >
            Open ↗
          </a>
        )}
        {canRepolish && (
          <RepolishButton
            ghostPostId={article.ghost_post_id}
            memberUuid={memberUuid}
            currentLevel={article.polish_level}
            onChanged={onChanged}
          />
        )}
      </div>
    </div>
  );
}

function TierLabel({ kind, tier, bold }) {
  const tint = TIER_TINTS[tier] || TIER_TINTS.fog;
  return (
    <span style={{
      display:       'inline-flex',
      alignItems:    'center',
      gap:           4,
      fontFamily:    "'DM Mono', monospace",
      fontSize:      9,
      letterSpacing: '0.10em',
      textTransform: 'uppercase',
      padding:       '3px 8px',
      borderRadius:  3,
      background:    tint.bg,
      border:        '1px solid ' + tint.border,
      color:         tint.color,
      fontWeight:    bold ? 700 : 500,
    }}>
      <span style={{ opacity: 0.65 }}>{kind}:</span> {tier}
    </span>
  );
}

function RepolishButton({ ghostPostId, memberUuid, currentLevel, onChanged }) {
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone]   = useState(false);

  const handleClick = async () => {
    const level = window.prompt(
      'Re-polish this article at which level? (light / standard / editorial)\nCurrent: ' + (currentLevel || 'unset'),
      currentLevel || 'standard',
    );
    if (!level) return;
    const normalized = level.trim().toLowerCase();
    if (!['light', 'standard', 'editorial', 'custom'].includes(normalized)) {
      alert('Invalid level. Use: light, standard, editorial, or custom.');
      return;
    }
    if (!ghostPostId) {
      setError('Missing ghost_post_id on this article.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(API_BASE + '/api/article/repolish', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ghost_post_id: ghostPostId,
          polish_level:  normalized,
          member_uuid:   memberUuid,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'HTTP ' + res.status);
      }
      setDone(true);
      onChanged();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={busy}
        style={{ ...subtleButtonStyle, opacity: busy ? 0.5 : 1 }}
      >
        {busy ? 'Re-polishing…' : done ? 'Re-polished ✓' : 'Re-polish'}
      </button>
      {error && (
        <span style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize:   12,
          color:      '#8c2a14',
          alignSelf:  'center',
        }}>
          {error}
        </span>
      )}
    </>
  );
}

// ─── Tuning section ────────────────────────────────────────────────────────

function TuningSection({ memberUuid }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const reload = useCallback(() => {
    setLoading(true);
    fetch(API_BASE + '/api/admin/pulse?member_id=' + memberUuid)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [memberUuid]);

  useEffect(() => { reload(); }, [reload]);

  if (loading) return <Loading />;
  if (error)   return <ErrorState message={error} />;

  const pulse = data?.pulse || {};
  const knobs = data?.knobs || [];
  const generated = pulse.generated_at ? new Date(pulse.generated_at) : null;

  return (
    <div style={sectionStyle}>
      <h2 style={sectionTitleStyle}>The Pulse</h2>
      <div style={sectionAccentStyle} />
      <p style={sectionBodyStyle}>
        Live counts across the platform plus the catalogue of tunable
        constants. Watch this as activity ramps up: skewed tier mixes,
        empty axis pillars, or a stalled feedback queue all surface here
        first.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        {generated && (
          <span style={{
            fontFamily:    "'DM Mono', monospace",
            fontSize:      10,
            letterSpacing: '0.10em',
            color:         '#8c8780',
          }}>
            Generated {generated.toLocaleString()}
          </span>
        )}
        <button onClick={reload} style={subtleButtonStyle}>
          Refresh
        </button>
      </div>

      <PulseGrid pulse={pulse} />

      <h3 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontStyle:  'italic',
        fontWeight: 500,
        fontSize:   '1.5rem',
        margin:     '32px 0 4px',
        color:      'var(--ink, #2a2521)',
      }}>
        The Knobs
      </h3>
      <div style={{ ...sectionAccentStyle, margin: '0 0 14px' }} />
      <p style={{ ...sectionBodyStyle, margin: '0 0 14px' }}>
        Tunable constants the platform uses to shape behavior. Adjust by
        editing the source file referenced and redeploying. As traffic
        grows, this view becomes the place to argue for a value change
        with the data on the same page.
      </p>

      <div style={{ display: 'grid', gap: 10 }}>
        {knobs.map((k) => (
          <KnobRow key={k.id} knob={k} />
        ))}
      </div>
    </div>
  );
}

function PulseGrid({ pulse }) {
  const m = pulse.members   || {};
  const c = pulse.comments  || { tier_mix: {} };
  const a = pulse.articles  || { tier_mix: {} };
  const x = pulse.axis_events || { axis_mix: {} };
  const f = pulse.follows   || {};
  const fb = pulse.feedback || { by_status: {} };

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <PulsePanel title="Members" stats={[
        { label: 'Total',        value: m.total },
        { label: 'Real',         value: m.real },
        { label: 'Seeds',        value: m.seeds },
        { label: 'Active 7d',    value: m.active_7d },
        { label: 'Active 30d',   value: m.active_30d },
        { label: 'Pact signed',  value: m.pact_signed },
        { label: 'Following',    value: f.total },
      ]} />
      <PulsePanel title="Comments" stats={[
        { label: 'Total',     value: c.total },
        { label: 'Last 24h',  value: c.last_24h },
        { label: 'Last 7d',   value: c.last_7d },
        { label: 'Forum',     value: c.tier_mix.forum },
        { label: 'Spark',     value: c.tier_mix.spark },
        { label: 'Heat',      value: c.tier_mix.heat },
        { label: 'Stance',    value: c.tier_mix.stance },
      ]} />
      <PulsePanel title="Articles" stats={[
        { label: 'Total',       value: a.total },
        { label: 'Published',   value: a.published },
        { label: 'Draft',       value: a.draft },
        { label: 'Mismatched',  value: a.mismatched },
        { label: 'Forum',       value: a.tier_mix.forum },
        { label: 'Spark',       value: a.tier_mix.spark },
        { label: 'Heat',        value: a.tier_mix.heat },
      ]} />
      <PulsePanel title="Pillar graduations" stats={[
        { label: 'Total events', value: x.total },
        { label: 'Last 7d',      value: x.last_7d },
        { label: 'Acuity',       value: x.axis_mix.acuity },
        { label: 'Calibration',  value: x.axis_mix.calibration },
        { label: 'Magnanimity',  value: x.axis_mix.magnanimity },
        { label: 'Discourse',    value: x.axis_mix.discourse },
        { label: 'Consistency',  value: x.axis_mix.consistency },
        { label: 'Reach',        value: x.axis_mix.reach },
      ]} />
      <PulsePanel title="Feedback queue" stats={
        Object.keys(fb.by_status).length === 0
          ? [{ label: 'Total', value: 0 }]
          : Object.entries(fb.by_status).map(([k, v]) => ({ label: k.replace('_', ' '), value: v }))
      } />
    </div>
  );
}

function PulsePanel({ title, stats }) {
  return (
    <div style={cardStyle}>
      <div style={{
        fontFamily:    "'DM Mono', monospace",
        fontSize:      10,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color:         'var(--brass-deep, #7a4a14)',
        fontWeight:    600,
        marginBottom:  10,
      }}>
        {title}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
        gap: 10,
      }}>
        {stats.map((s) => (
          <Stat key={s.label} label={s.label} value={s.value ?? 0} />
        ))}
      </div>
    </div>
  );
}

function KnobRow({ knob }) {
  return (
    <div style={{
      ...cardStyle,
      padding: '12px 16px',
      borderTop: '1px solid rgba(184,115,42,0.22)',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle:  'italic',
          fontSize:   '1.15rem',
          fontWeight: 500,
          color:      'var(--ink, #2a2521)',
        }}>
          {knob.label}
        </div>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize:   12,
          color:      'var(--brass-deep, #7a4a14)',
          fontWeight: 600,
        }}>
          {knob.current} {knob.unit}
        </div>
      </div>
      <div style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize:   13,
        color:      '#3e3934',
        marginTop:  6,
        lineHeight: 1.55,
      }}>
        {knob.description}
      </div>
      {knob.location && (
        <div style={{
          fontFamily:    "'DM Mono', monospace",
          fontSize:      10,
          letterSpacing: '0.06em',
          color:         '#8c8780',
          marginTop:     6,
        }}>
          {knob.location}
        </div>
      )}
    </div>
  );
}

// ─── Grant role modal ──────────────────────────────────────────────────────

function GrantRoleModal({ memberUuid, availableRoles, onClose, onSuccess }) {
  const [contributors, setContributors] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    fetch(API_BASE + '/api/profile/_list')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setContributors(d?.contributors || []))
      .finally(() => setLoadingList(false));
  }, []);

  // Hide entries with no resolvable display_name. The /api/profile/_list
  // endpoint already falls back to Ghost names when Supabase has NULL, so
  // a remaining null at this point means the member is deleted from Ghost
  // (or the row is data corruption). Either way, granting a role to them
  // is meaningless. Dropping them tightens the picker.
  const filtered = contributors
    .filter((c) => !!c.display_name)
    .filter((c) => !filter || c.display_name.toLowerCase().includes(filter.toLowerCase()));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTarget || !selectedRole) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(API_BASE + '/api/admin/team?member_id=' + memberUuid, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action:           'grant',
          target_member_id: selectedTarget,
          role_id:          selectedRole,
          note:             note.trim() || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'HTTP ' + res.status);
      }
      onSuccess();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={modalScrimStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontSize: '1.5rem', margin: '0 0 18px', color: 'var(--ink, #2a2521)' }}>
          Grant a role
        </h3>

        <form onSubmit={handleSubmit}>
          <Label>Member</Label>
          <input
            type="text"
            placeholder="Filter by name…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={inputStyle}
          />
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            style={{ ...inputStyle, marginTop: 6 }}
            disabled={loadingList}
          >
            <option value="">{loadingList ? 'Loading…' : '— select member —'}</option>
            {filtered.map((c) => {
              // Show the ghost_member_id snippet for any remaining unnamed
              // entries (rare after the API's Ghost-name fallback) so members
              // are still identifiable in the dropdown.
              const label = c.display_name
                ? c.display_name
                : `(unnamed · ${c.ghost_member_id ? c.ghost_member_id.slice(0, 8) : '????????'})`;
              return (
                <option key={c.ghost_member_id} value={c.ghost_member_id}>
                  {label}
                </option>
              );
            })}
          </select>

          <Label style={{ marginTop: 16 }}>Role</Label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={inputStyle}
          >
            <option value="">— select role —</option>
            {availableRoles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.display_name} — {r.description}
              </option>
            ))}
          </select>

          <Label style={{ marginTop: 16 }}>Note (optional)</Label>
          <input
            type="text"
            placeholder="e.g. covers quotes for Q2"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={inputStyle}
            maxLength={200}
          />

          {submitError && (
            <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 4, background: '#fbe9e2', color: '#8c2a14', fontSize: 13 }}>
              {submitError}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 22 }}>
            <button type="button" onClick={onClose} style={subtleButtonStyle}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedTarget || !selectedRole || submitting}
              style={{ ...primaryButtonStyle, opacity: (!selectedTarget || !selectedRole || submitting) ? 0.5 : 1 }}
            >
              {submitting ? 'Granting…' : 'Grant Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Label({ children, style }) {
  return (
    <div style={{
      fontFamily:    "'DM Mono', monospace",
      fontSize:      9,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color:         '#8c8780',
      marginBottom:  6,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── States ────────────────────────────────────────────────────────────────

function Loading() {
  return (
    <div style={{
      padding:    60,
      textAlign:  'center',
      fontFamily: "'DM Mono', monospace",
      fontSize:   11,
      color:      '#8c8780',
      letterSpacing: '0.10em',
      textTransform: 'uppercase',
    }}>
      Loading…
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div style={{
      padding:    60,
      textAlign:  'center',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      fontSize:   13,
      color:      '#8c2a14',
    }}>
      Failed to load: {message}
    </div>
  );
}

function NoAccess({ memberName }) {
  return (
    <div style={{
      padding:    '80px 24px',
      textAlign:  'center',
      maxWidth:   520,
      margin:     '0 auto',
    }}>
      <div style={kickerStyle}>The Dialecta Press</div>
      <h1 style={titleStyle}>By Invitation</h1>
      <p style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontStyle:  'italic',
        fontSize:   '1.15rem',
        color:      'var(--ink, #2a2521)',
        marginTop:  24,
      }}>
        This page is the platform's working room. Access is granted as the
        Press grows. If you've been told you should have access, ask Daniel
        to grant your role.
      </p>
      <p style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize:   12,
        color:      '#8c8780',
        marginTop:  18,
      }}>
        Signed in as {memberName || '(unknown)'}.
      </p>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const pageStyle = {
  maxWidth: 920,
  margin:   '0 auto',
  // site-main provides calc(var(--nav-height) + 24px) of padding-top on
  // desktop (16px on mobile), giving ~24px (1/4") of breathing room
  // above the kicker. No further top padding/margin needed at the page
  // level. The previous negative margin-top hack was reverted when the
  // sitewide buffer was right-sized in style.css.
  padding:  '0 24px 80px',
  fontFamily: "'DM Sans', system-ui, sans-serif",
  color:    'var(--ink, #2a2521)',
};

const headerStyle = {
  textAlign:    'center',
  paddingBottom: 4,
  marginBottom: 0,
};

// Brass-gradient horizontal rule that sits under the "Signed in as" line.
// Token-driven (var(--brass-gradient) is the canonical shimmer); never inline
// gradient stops here per the design-tokens doctrine.
const headerRuleStyle = {
  height:       2,
  margin:       '0 auto 22px',
  maxWidth:     280,
  background:   'var(--brass-gradient)',
  borderRadius: 1,
  opacity:      0.9,
};

// Hero brass family — same as About + Guidebook + Stewards bible.
// High-key gradient (all stops readable on dark stone if needed) +
// crisp 2-stop shadow. Defined inline because dev-admin doesn't have
// a CSS file and var(--hero-brass) isn't declared at :root yet.
const HERO_BRASS = 'linear-gradient(95deg, #d4a84a 0%, #ecb438 22%, #f5dfa0 50%, #ecb438 78%, #d4a84a 100%)';
const HERO_BRASS_SHADOW =
  'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.45)) drop-shadow(0 2px 0 rgba(28, 24, 20, 0.30))';

const kickerStyle = {
  fontFamily:    "'DM Mono', monospace",
  fontSize:      11,
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  fontWeight:    500,
  marginBottom:  18,
  // Hero-brass shimmer to match the About/Guidebook eyebrow bible.
  background:    HERO_BRASS,
  WebkitBackgroundClip: 'text',
  backgroundClip:       'text',
  WebkitTextFillColor:  'transparent',
  color:                'transparent',
  filter:               HERO_BRASS_SHADOW,
  display:              'inline-block',
};

const titleStyle = {
  fontFamily:    "'Cormorant Garamond', Georgia, serif",
  fontStyle:     'italic',
  fontWeight:    500,
  fontSize:      'clamp(2.2rem, 6vw + 0.5rem, 4.4rem)',
  margin:        '0 0 24px',
  letterSpacing: '-0.01em',
  lineHeight:    1.05,
  // Same hero-brass family as About + Guidebook + Stewards. Replaces
  // the previous --brass-gradient (which has a near-invisible peak on
  // cream) and the heavy 3-layer drop-shadow (which read as fuzzy at
  // smaller sizes). The 2-stop shadow lifts cleanly without blur.
  background:           HERO_BRASS,
  WebkitBackgroundClip: 'text',
  backgroundClip:       'text',
  WebkitTextFillColor:  'transparent',
  color:                'transparent',
  filter:               HERO_BRASS_SHADOW,
};

const subtitleStyle = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize:   13.5,
  color:      '#3a322a',
  fontWeight: 400,
};

const navStyle = {
  display:    'flex',
  gap:        2,
  flexWrap:   'wrap',
  justifyContent: 'center',
  marginBottom: 28,
  borderBottom: '1px solid rgba(184,115,42,0.20)',
};

const navButtonStyle = {
  fontFamily:    "'DM Mono', monospace",
  fontSize:      10.5,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  fontWeight:    500,
  color:         '#6e6963',
  background:    'transparent',
  border:        'none',
  borderBottom:  '2.5px solid transparent',
  padding:       '12px 22px',
  marginBottom:  '-1px',
  cursor:        'pointer',
  transition:    'color 0.18s ease, border-color 0.18s ease, background-color 0.18s ease',
};

const navButtonActiveStyle = {
  color:             'var(--brass-deep, #7a4a14)',
  fontWeight:        600,
  borderBottomColor: 'var(--brass-warm, #b8862e)',
  background:        'rgba(212,168,74,0.06)',
};

const sectionStyle = {
  padding: '8px 0',
};

const sectionTitleStyle = {
  fontFamily:    "'Cormorant Garamond', Georgia, serif",
  fontStyle:     'italic',
  fontWeight:    500,
  fontSize:      '2rem',
  margin:        '0 0 6px',
  color:         'var(--ink, #2a2521)',
  letterSpacing: '0.005em',
};

// Brass-gradient accent bar that sits under each section title. Width is
// short on purpose so it reads as a serif-press masthead rule, not a divider.
const sectionAccentStyle = {
  width:        56,
  height:       2,
  background:   'var(--brass-gradient)',
  margin:       '0 0 18px',
  borderRadius: 1,
};

const sectionBodyStyle = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize:   14,
  lineHeight: 1.65,
  color:      '#3a322a',
  margin:     '0 0 18px',
  maxWidth:   640,
};

const statusBoxStyle = {
  fontFamily:    "'DM Mono', monospace",
  fontSize:      11,
  letterSpacing: '0.06em',
  color:         'var(--brass-deep, #7a4a14)',
  background:    'rgba(212,168,74,0.10)',
  border:        '1px solid rgba(184,115,42,0.24)',
  padding:       '10px 14px',
  borderRadius:  3,
  marginTop:     12,
  maxWidth:      640,
};

const cardStyle = {
  padding:      '16px 18px 18px',
  background:   'var(--bg-white, #fdfbf6)',
  border:       '1px solid rgba(184,115,42,0.22)',
  borderTop:    '3px solid var(--brass-warm, #b8862e)',
  borderRadius: 4,
  boxShadow:    '0 2px 8px rgba(120,80,30,0.10)',
};

const emptyStateStyle = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontStyle:  'italic',
  fontSize:   '1.05rem',
  color:      '#8c8780',
  padding:    '20px 0',
};

// Primary button: full brass-gradient bg + bolder type + soft shadow.
// Reads as the "shimmer-on-paper" stamp the rest of the site uses for
// editorial weight (matches .dialecta-brass treatment elsewhere).
const primaryButtonStyle = {
  fontFamily:    "'DM Mono', monospace",
  fontSize:      11,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  fontWeight:    600,
  color:         'var(--cream, #faf6ee)',
  background:    'var(--brass-gradient)',
  border:        '1px solid var(--brass-deep, #7a4a14)',
  borderRadius:  4,
  padding:       '11px 24px',
  cursor:        'pointer',
  boxShadow:     '0 2px 6px rgba(120,80,30,0.22), inset 0 1px 0 rgba(255,255,255,0.20)',
  textShadow:    '0 1px 0 rgba(120,80,30,0.30)',
  transition:    'transform 0.18s ease, box-shadow 0.18s ease',
};

const subtleButtonStyle = {
  fontFamily:    "'DM Mono', monospace",
  fontSize:      10,
  letterSpacing: '0.10em',
  textTransform: 'uppercase',
  fontWeight:    500,
  color:         'var(--brass-deep, #7a4a14)',
  background:    'transparent',
  border:        '1px solid rgba(184,115,42,0.32)',
  borderRadius:  3,
  padding:       '6px 12px',
  cursor:        'pointer',
};

const inputStyle = {
  width:       '100%',
  fontFamily:  "'DM Sans', system-ui, sans-serif",
  fontSize:    14,
  padding:     '10px 12px',
  border:      '1px solid rgba(184,115,42,0.24)',
  borderRadius: 3,
  background:  'var(--bg-white, #fdfbf6)',
  color:       'var(--ink, #2a2521)',
  boxSizing:   'border-box',
};

const modalScrimStyle = {
  position:    'fixed',
  inset:       0,
  background:  'rgba(42,37,33,0.55)',
  display:     'flex',
  alignItems:  'center',
  justifyContent: 'center',
  zIndex:      9999,
  padding:     20,
};

const modalStyle = {
  background:   'var(--bg-white, #fdfbf6)',
  border:       '1px solid rgba(184,115,42,0.32)',
  borderRadius: 6,
  padding:      '28px 28px 24px',
  width:        '100%',
  maxWidth:     520,
  boxShadow:    '0 12px 40px rgba(42,37,33,0.32)',
  fontFamily:   "'DM Sans', system-ui, sans-serif",
};
