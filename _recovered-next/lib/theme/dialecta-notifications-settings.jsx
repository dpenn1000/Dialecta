/**
 * dialecta-notifications-settings.jsx
 *
 * The Notifications panel inside the profile SettingsDrawer. Renders a
 * 6×2 matrix (six trigger types × in-app + email channels), a master
 * email-enabled toggle, a digest hour picker, and saves via PATCH
 * /api/notifications/prefs.
 *
 * Auto-detects the member's IANA timezone via Intl on first load, so a
 * digest hour picked at "9" without further input lands at 9 AM in the
 * member's local time.
 */

import React, { useState, useEffect } from 'react';
import {
  NOTIFICATION_TYPES,
  TYPE_LABELS_SHORT,
  fetchPrefs,
  savePrefs,
} from './dialecta-notifications-data.js';

const T = {
  bgPrimary:   '#f7f2e8',
  bgSecondary: '#efe8da',
  bgWhite:     '#ffffff',
  textPrimary: '#1c1814',
  textSecondary:'#5a5248',
  textTertiary:'#7a7068',
  borderLight: '#e8e0d0',
  amber:       '#b8862e',
  goldPale:    '#f5e8d0',
  fontDisplay: "'Cormorant Garamond', 'Times New Roman', serif",
  fontBody:    "'DM Sans', system-ui, sans-serif",
  fontReading: "'Source Serif 4', Georgia, serif",
  fontMono:    "'DM Mono', 'Courier New', monospace",
};

function detectTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
  } catch {
    return 'America/New_York';
  }
}

const HOURS = Array.from({ length: 24 }, (_, h) => {
  const ampm = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
  return { value: h, label: ampm };
});

function Toggle({ checked, onChange, ariaLabel }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      aria-label={ariaLabel}
      aria-pressed={checked}
      style={{
        position: 'relative',
        width: 36, height: 20,
        background: checked ? T.amber : T.borderLight,
        border: 'none', borderRadius: 10,
        cursor: 'pointer',
        transition: 'background 0.18s',
        padding: 0,
      }}>
      <span style={{
        position: 'absolute',
        top: 2, left: checked ? 18 : 2,
        width: 16, height: 16,
        background: T.bgWhite,
        borderRadius: '50%',
        transition: 'left 0.18s',
        boxShadow: '0 1px 3px rgba(28,24,20,0.25)',
      }} />
    </button>
  );
}

export default function NotificationsSettingsPanel({ memberUuid, memberEmail, onBack }) {
  const [prefs, setPrefs] = useState(null);
  const [emailAddress, setEmailAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    if (!memberUuid) return;
    (async () => {
      try {
        const json = await fetchPrefs({ memberUuid, emailHint: memberEmail || undefined });
        setPrefs(json.prefs);
        setEmailAddress(json.email_address || memberEmail || '');
        // First-time auto: if timezone is the default and Intl gives a more
        // specific one, persist the upgrade silently on next save.
        const detected = detectTimezone();
        if (json.prefs.timezone === 'America/New_York' && detected !== 'America/New_York') {
          setPrefs((p) => ({ ...p, timezone: detected }));
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [memberUuid, memberEmail]);

  async function commitPatch(patch) {
    setSaving(true);
    setError(null);
    try {
      const json = await savePrefs({ memberUuid, prefs: patch, emailAddress });
      setPrefs(json.prefs);
      setSavedAt(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  function setMasterEmail(enabled) {
    setPrefs((p) => ({ ...p, email_enabled: enabled }));
    commitPatch({ email_enabled: enabled });
  }

  function setDigestHour(hour) {
    const next = parseInt(hour, 10);
    setPrefs((p) => ({ ...p, digest_hour: next }));
    commitPatch({ digest_hour: next });
  }

  function setChannel(type, channel, value) {
    setPrefs((p) => ({
      ...p,
      channels: {
        ...p.channels,
        [type]: { ...p.channels[type], [channel]: value },
      },
    }));
    commitPatch({ channels: { [type]: { [channel]: value } } });
  }

  if (loading) {
    return (
      <div style={{
        padding: 40, textAlign: 'center',
        fontFamily: T.fontMono, fontSize: 10,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: T.textTertiary,
      }}>Loading…</div>
    );
  }

  if (error && !prefs) {
    return (
      <div style={{
        padding: 40, textAlign: 'center',
        fontFamily: T.fontBody, fontSize: 13, color: '#b8372e',
      }}>
        Could not load notification preferences.
        <div style={{ marginTop: 4, fontSize: 11, color: T.textTertiary }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '8px 4px 0' }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            background: 'transparent', border: 'none',
            cursor: 'pointer', padding: '6px 0 14px',
            fontFamily: T.fontMono, fontSize: 9,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: T.textTertiary,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
          ← Settings
        </button>
      )}

      <div style={{
        fontFamily: T.fontDisplay, fontSize: '1.4rem', fontWeight: 500,
        fontStyle: 'italic', color: T.textPrimary,
        marginBottom: 4, lineHeight: 1.1,
      }}>
        Notifications
      </div>
      <div style={{
        fontFamily: T.fontReading, fontSize: 12, fontStyle: 'italic',
        color: T.textTertiary, marginBottom: 24, lineHeight: 1.5,
      }}>
        In-app notifications are always on. Email comes as a daily digest if you opt in.
      </div>

      {/* Master email toggle + digest hour */}
      <div style={{
        background: T.bgSecondary,
        borderRadius: 6,
        padding: '14px 16px',
        marginBottom: 24,
        border: `1px solid ${T.borderLight}`,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, marginBottom: prefs.email_enabled ? 14 : 0,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: T.fontBody, fontSize: 13, fontWeight: 500,
              color: T.textPrimary,
            }}>
              Email digest
            </div>
            <div style={{
              fontFamily: T.fontReading, fontSize: 11, fontStyle: 'italic',
              color: T.textTertiary, marginTop: 2,
            }}>
              {emailAddress || '(no email cached yet)'}
            </div>
          </div>
          <Toggle
            checked={!!prefs.email_enabled}
            onChange={setMasterEmail}
            ariaLabel="Enable email digest"
          />
        </div>

        {prefs.email_enabled && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12, paddingTop: 12, borderTop: `1px solid ${T.borderLight}`,
          }}>
            <div>
              <div style={{
                fontFamily: T.fontBody, fontSize: 13, fontWeight: 500,
                color: T.textPrimary,
              }}>
                Send at
              </div>
              <div style={{
                fontFamily: T.fontReading, fontSize: 11, fontStyle: 'italic',
                color: T.textTertiary, marginTop: 2,
              }}>
                {prefs.timezone}
              </div>
            </div>
            <select
              value={prefs.digest_hour}
              onChange={(e) => setDigestHour(e.target.value)}
              style={{
                background: T.bgWhite,
                border: `1px solid ${T.borderLight}`,
                borderRadius: 4,
                padding: '5px 10px',
                fontFamily: T.fontBody, fontSize: 13,
                color: T.textPrimary, cursor: 'pointer',
              }}>
              {HOURS.map((h) => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Channels matrix */}
      <div style={{
        fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: T.amber,
        marginBottom: 10, fontWeight: 500,
      }}>
        Per-event channels
      </div>

      <div style={{
        background: T.bgWhite,
        border: `1px solid ${T.borderLight}`,
        borderRadius: 6,
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 56px 56px',
          padding: '8px 14px',
          background: T.bgSecondary,
          borderBottom: `1px solid ${T.borderLight}`,
          fontFamily: T.fontMono, fontSize: 8,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: T.textTertiary,
        }}>
          <div>Trigger</div>
          <div style={{ textAlign: 'center' }}>In-app</div>
          <div style={{ textAlign: 'center' }}>Email</div>
        </div>
        {NOTIFICATION_TYPES.map((type, idx) => {
          const ch = prefs.channels[type] || { inapp: true, email: false };
          return (
            <div
              key={type}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 56px 56px',
                padding: '12px 14px',
                alignItems: 'center',
                borderBottom: idx < NOTIFICATION_TYPES.length - 1 ? `1px solid ${T.borderLight}` : 'none',
              }}>
              <div style={{
                fontFamily: T.fontBody, fontSize: 13,
                color: T.textPrimary, lineHeight: 1.3,
              }}>
                {TYPE_LABELS_SHORT[type]}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Toggle
                  checked={!!ch.inapp}
                  onChange={(v) => setChannel(type, 'inapp', v)}
                  ariaLabel={`${TYPE_LABELS_SHORT[type]}: in-app`}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Toggle
                  checked={!!ch.email && !!prefs.email_enabled}
                  onChange={(v) => setChannel(type, 'email', v)}
                  ariaLabel={`${TYPE_LABELS_SHORT[type]}: email`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: 16, minHeight: 16,
        fontFamily: T.fontMono, fontSize: 9,
        letterSpacing: '0.10em', textTransform: 'uppercase',
        color: error ? '#b8372e' : T.textTertiary,
        textAlign: 'center',
      }}>
        {error
          ? `Could not save: ${error}`
          : saving
            ? 'Saving…'
            : savedAt
              ? `Saved ${savedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
              : ''}
      </div>
    </div>
  );
}
