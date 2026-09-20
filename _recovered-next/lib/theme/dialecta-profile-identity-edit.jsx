/**
 * dialecta-profile-identity-edit.jsx
 *
 * Three modal editors for the identity sections introduced by migration
 * 015. Each follows the same shape as EditProfilePanel: full-screen
 * overlay, scroll-locked card, click-outside-to-cancel, save via the
 * profile PATCH endpoint, then call onSave so the parent reloads.
 *
 *   FieldNotesEditor    — four uploaded photos with captions, fixed slots
 *   InfluencesEditor    — list of works with cover lookup or own upload
 *   AboutPromptsEditor  — wrestling_with (single) + mind_changes (≤3)
 *
 * All three reuse the upload-image API for storage; new `purpose`
 * values (`field_note`, `book_cover`) tag the bucket entries so the API
 * can scope size/MIME rules per purpose later if needed. They skip the
 * is_author gate the same way `purpose: 'avatar'` does.
 */

import React, { useState, useRef, useEffect } from 'react';
import { updateProfile } from './dialecta-profile-data.js';

// ─── Constants and helpers ───────────────────────────────────────────────

const FIELD_NOTE_SLOTS = 4;
const INFLUENCES_MAX   = 8;
const MIND_CHANGES_MAX = 3;
const WRESTLING_MAX    = 280;

const IMAGE_MAX_BYTES    = 3 * 1024 * 1024;
const IMAGE_MIME_ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

function apiBase() {
  if (typeof window !== 'undefined' && window.__DIALECTA_API_URL__) {
    return window.__DIALECTA_API_URL__.replace(/\/$/, '');
  }
  return '';
}

// Reads a File into a base64 string and POSTs to /api/article/upload-image.
// `purpose` is forwarded to the API and skips the is_author gate for the
// values 'avatar', 'field_note', 'book_cover'. Returns the public URL.
async function uploadImage(file, ghostMemberId, purpose) {
  if (!IMAGE_MIME_ALLOWED.has(file.type)) {
    throw new Error('Only JPEG, PNG, or WebP images are accepted.');
  }
  if (file.size > IMAGE_MAX_BYTES) {
    throw new Error('Image is larger than 3 MB. Please pick a smaller file.');
  }
  const dataUrl = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload  = () => resolve(r.result);
    r.onerror = () => reject(new Error('Could not read the selected file.'));
    r.readAsDataURL(file);
  });
  const base64 = String(dataUrl).split(',')[1] || '';
  const res = await fetch(`${apiBase()}/api/article/upload-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename:    file.name,
      mime_type:   file.type,
      data:        base64,
      member_uuid: ghostMemberId,
      purpose,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Upload failed: ${res.status}`);
  }
  const json = await res.json();
  if (!json?.url) throw new Error('Upload returned no URL.');
  return json.url;
}

// Cover lookup proxy. Calls /api/profile/cover-search?q=... and returns
// an array of { title, author, cover_url, source: 'openlibrary' }.
async function searchCovers(query) {
  if (!query?.trim()) return [];
  const res = await fetch(`${apiBase()}/api/profile/cover-search?q=${encodeURIComponent(query.trim())}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Search failed: ${res.status}`);
  }
  const json = await res.json();
  return Array.isArray(json.results) ? json.results : [];
}

// ─── Design tokens (mirrors v1.3 spec) ───────────────────────────────────

const T = {
  fontDisplay: "'Cormorant Garamond', Georgia, serif",
  fontMono:    "'DM Mono', 'Courier New', monospace",
  fontReading: "'Source Serif 4', 'Georgia', serif",
  fontBody:    "'DM Sans', system-ui, sans-serif",

  bgPrimary:   '#f7f2e8',
  bgPaper:     '#fcf8ed',
  bgWhite:     '#ffffff',
  bgOverlay:   'rgba(28, 24, 20, 0.55)',

  textPrimary:   '#2c2620',
  textBody:      '#454547',
  textSecondary: '#5a5450',
  textTertiary:  '#8c8780',
  borderLight:   '#e0dbd2',
  borderRule:    '#cfc7b8',

  amber: '#b8862e',
  amberLight: '#d4a84a',
  errorRed: '#b8372e',
};

// ─── Shared modal shell ──────────────────────────────────────────────────

function Modal({ title, hint, onClose, children, footer, wide }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: T.bgOverlay,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: T.bgPrimary,
          borderRadius: 12,
          padding: '32px 36px',
          width: '100%',
          maxWidth: wide ? 720 : 520,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 8px 40px rgba(28,24,20,0.22)',
          display: 'flex', flexDirection: 'column',
        }}>
        <div style={{
          fontFamily: T.fontDisplay,
          fontSize: 22,
          fontWeight: 500,
          color: T.textPrimary,
          marginBottom: 6,
        }}>
          {title}
        </div>
        {hint && (
          <p style={{
            fontFamily: T.fontReading,
            fontSize: 12,
            fontStyle: 'italic',
            color: T.textTertiary,
            marginBottom: 24,
            lineHeight: 1.6,
          }}>
            {hint}
          </p>
        )}
        <div style={{ flex: 1 }}>
          {children}
        </div>
        {footer && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            marginTop: 20,
            paddingTop: 16,
            borderTop: `1px solid ${T.borderLight}`,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? T.textTertiary : T.textPrimary,
        border: 'none',
        borderRadius: 4,
        padding: '9px 24px',
        fontFamily: T.fontDisplay,
        fontSize: 15,
        fontWeight: 500,
        letterSpacing: '0.03em',
        color: T.bgPrimary,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s',
      }}>
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: 'transparent',
        border: `1px solid ${T.borderLight}`,
        borderRadius: 4,
        padding: '9px 20px',
        fontFamily: T.fontMono,
        fontSize: 10,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: T.textTertiary,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}>
      {children}
    </button>
  );
}

function MonoLabel({ children }) {
  return (
    <label style={{
      display: 'block',
      fontFamily: T.fontMono,
      fontSize: 9,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: T.amber,
      marginBottom: 6,
    }}>{children}</label>
  );
}

function ErrorLine({ text }) {
  if (!text) return null;
  return (
    <p style={{
      fontFamily: T.fontBody, fontSize: 12, color: T.errorRed,
      margin: '8px 0 0',
    }}>
      {text}
    </p>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// FIELD NOTES EDITOR
// Four fixed slots. Each slot: photo upload + caption. Empty slots show
// a dashed placeholder; filled slots show the photo with hover-to-replace
// and a caption textbox below. The four-slot constraint is intentional —
// it forces curation, matching the "Not a gallery" framing on the page.
// ═════════════════════════════════════════════════════════════════════════

export function FieldNotesEditor({ ghostMemberId, initial, onSave, onCancel }) {
  // Normalize to exactly four slots so the UI never has to handle
  // sparse arrays. Empty slots are { url: '', caption: '' }.
  const [slots, setSlots] = useState(() => {
    const base = Array.isArray(initial) ? initial.slice(0, FIELD_NOTE_SLOTS) : [];
    while (base.length < FIELD_NOTE_SLOTS) base.push({ url: '', caption: '' });
    return base;
  });
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState(null);

  function setSlot(i, patch) {
    setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      // Drop fully-empty slots before saving so the array stored in
      // Supabase is dense — the page renders all four when there are
      // four, otherwise the empty-state copy renders.
      const cleaned = slots.filter(s => s.url || s.caption);
      const result  = await updateProfile(ghostMemberId, { field_notes: cleaned });
      onSave(result);
    } catch (err) {
      setSaveError(err.message ?? 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Field Notes"
      hint="Four photos that catch your eye. Your bookshelf, your window, the page you keep turning back to. Not a gallery."
      onClose={onCancel}
      wide
      footer={
        <>
          <GhostButton onClick={onCancel} disabled={saving}>Cancel</GhostButton>
          <PrimaryButton onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </PrimaryButton>
        </>
      }
    >
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16,
      }}>
        {slots.map((slot, i) => (
          <FieldNoteSlot
            key={i}
            ghostMemberId={ghostMemberId}
            slot={slot}
            onChange={(patch) => setSlot(i, patch)}
          />
        ))}
      </div>
      <ErrorLine text={saveError} />
    </Modal>
  );
}

function FieldNoteSlot({ ghostMemberId, slot, onChange }) {
  const fileRef = useRef(null);
  const [uploading,  setUploading]  = useState(false);
  const [uploadErr,  setUploadErr]  = useState(null);

  async function handleFile(file) {
    if (!file) return;
    setUploadErr(null);
    setUploading(true);
    try {
      const url = await uploadImage(file, ghostMemberId, 'field_note');
      onChange({ url });
    } catch (err) {
      setUploadErr(err.message ?? 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div style={{
      border: `1px solid ${T.borderLight}`,
      borderRadius: 8,
      padding: 12,
      background: T.bgWhite,
    }}>
      <div
        onClick={() => !uploading && fileRef.current?.click()}
        style={{
          aspectRatio: '1',
          borderRadius: 6,
          background: slot.url ? `url(${slot.url}) center/cover` : 'transparent',
          border: slot.url ? '1px solid rgba(0,0,0,0.1)' : `1px dashed ${T.borderRule}`,
          cursor: uploading ? 'wait' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: T.textTertiary,
          fontFamily: T.fontMono, fontSize: 10,
          letterSpacing: '0.10em', textTransform: 'uppercase',
          marginBottom: 10,
          position: 'relative', overflow: 'hidden',
        }}>
        {!slot.url && (uploading ? 'Uploading…' : 'Tap to upload')}
        {slot.url && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(28,24,20,0.0)',
            transition: 'background 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: T.bgWhite,
            fontFamily: T.fontMono, fontSize: 10,
            letterSpacing: '0.10em', textTransform: 'uppercase',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(28,24,20,0.5)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(28,24,20,0.0)'}
          >
            Replace
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      <input
        type="text"
        value={slot.caption || ''}
        onChange={(e) => onChange({ caption: e.target.value })}
        placeholder="Caption (optional)"
        maxLength={80}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: T.bgPaper,
          border: `1px solid ${T.borderLight}`,
          borderRadius: 4,
          padding: '6px 10px',
          fontFamily: T.fontBody, fontSize: 12,
          color: T.textBody, outline: 'none',
        }}
      />
      {slot.url && (
        <button
          type="button"
          onClick={() => onChange({ url: '', caption: '' })}
          style={{
            background: 'transparent', border: 'none',
            fontFamily: T.fontMono, fontSize: 9,
            letterSpacing: '0.10em', textTransform: 'uppercase',
            color: T.textTertiary, cursor: 'pointer',
            marginTop: 6, padding: 0,
          }}>
          Remove
        </button>
      )}
      <ErrorLine text={uploadErr} />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// INFLUENCES EDITOR
// List of works the contributor wants to name as influences. Each entry
// has a title, optional author, a one-line note (why it matters), and a
// cover image. The cover comes from one of two places: the search box
// (Open Library lookup, returns thumbnails to pick from) or a direct
// upload. Order follows the array — drag-reorder is intentionally not
// shipped in this pass; up/down buttons handle re-sequencing.
// ═════════════════════════════════════════════════════════════════════════

export function InfluencesEditor({ ghostMemberId, initial, onSave, onCancel }) {
  const [items, setItems] = useState(() => Array.isArray(initial) ? [...initial] : []);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState(null);

  function addBlank() {
    if (items.length >= INFLUENCES_MAX) return;
    setItems(prev => [...prev, { title: '', author: '', note: '', cover_url: '', source: null }]);
  }

  function patchItem(i, patch) {
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, ...patch } : it));
  }

  function removeItem(i) {
    setItems(prev => prev.filter((_, idx) => idx !== i));
  }

  function moveItem(i, delta) {
    setItems(prev => {
      const j = i + delta;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const cleaned = items
        .filter(it => it.title?.trim())
        .map(it => ({
          title:     it.title.trim(),
          author:    it.author?.trim() || '',
          note:      it.note?.trim() || '',
          cover_url: it.cover_url || '',
          source:    it.source || null,
        }));
      const result = await updateProfile(ghostMemberId, { influences: cleaned });
      onSave(result);
    } catch (err) {
      setSaveError(err.message ?? 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Influences"
      hint="Books, series, publications, papers — anything literary that shaped how you think. Add a one-line note on what it gave you."
      onClose={onCancel}
      wide
      footer={
        <>
          <GhostButton onClick={onCancel} disabled={saving}>Cancel</GhostButton>
          <PrimaryButton onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </PrimaryButton>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items.map((item, i) => (
          <InfluenceRow
            key={i}
            ghostMemberId={ghostMemberId}
            item={item}
            onChange={(patch) => patchItem(i, patch)}
            onRemove={() => removeItem(i)}
            onMoveUp={i > 0 ? () => moveItem(i, -1) : null}
            onMoveDown={i < items.length - 1 ? () => moveItem(i, 1) : null}
          />
        ))}
        {items.length < INFLUENCES_MAX && (
          <button
            type="button"
            onClick={addBlank}
            style={{
              background: T.bgWhite,
              border: `1px dashed ${T.borderRule}`,
              borderRadius: 6,
              padding: '14px 16px',
              fontFamily: T.fontMono, fontSize: 10,
              letterSpacing: '0.10em', textTransform: 'uppercase',
              color: T.textSecondary,
              cursor: 'pointer',
            }}>
            + Add an influence
          </button>
        )}
      </div>
      <ErrorLine text={saveError} />
    </Modal>
  );
}

function InfluenceRow({ ghostMemberId, item, onChange, onRemove, onMoveUp, onMoveDown }) {
  const fileRef = useRef(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [uploadErr, setUploadErr]   = useState(null);

  async function handleFile(file) {
    if (!file) return;
    setUploadErr(null);
    setUploading(true);
    try {
      const url = await uploadImage(file, ghostMemberId, 'book_cover');
      onChange({ cover_url: url, source: 'upload' });
    } catch (err) {
      setUploadErr(err.message ?? 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div style={{
      display: 'flex', gap: 14,
      background: T.bgWhite,
      border: `1px solid ${T.borderLight}`,
      borderRadius: 8,
      padding: 14,
    }}>
      {/* Cover preview / upload zone */}
      <div style={{ flexShrink: 0 }}>
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          style={{
            width: 76, height: 110,
            background: item.cover_url ? `url(${item.cover_url}) center/cover` : T.bgPaper,
            border: item.cover_url ? '1px solid rgba(0,0,0,0.1)' : `1px dashed ${T.borderRule}`,
            borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: uploading ? 'wait' : 'pointer',
            color: T.textTertiary,
            fontFamily: T.fontMono, fontSize: 9,
            letterSpacing: '0.10em', textTransform: 'uppercase',
            textAlign: 'center', padding: 6,
          }}>
          {!item.cover_url && (uploading ? 'Uploading…' : 'Cover')}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            disabled={!item.title?.trim()}
            title={item.title?.trim() ? 'Search the web for a cover' : 'Type a title first'}
            style={{
              flex: 1,
              background: 'transparent',
              border: `1px solid ${T.borderLight}`,
              borderRadius: 3,
              padding: '4px 6px',
              fontFamily: T.fontMono, fontSize: 9,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: item.title?.trim() ? T.textSecondary : T.textTertiary,
              cursor: item.title?.trim() ? 'pointer' : 'not-allowed',
            }}>
            Find
          </button>
          {item.cover_url && (
            <button
              type="button"
              onClick={() => onChange({ cover_url: '', source: null })}
              title="Remove cover"
              style={{
                background: 'transparent',
                border: `1px solid ${T.borderLight}`,
                borderRadius: 3,
                padding: '4px 8px',
                fontFamily: T.fontMono, fontSize: 9,
                color: T.textTertiary, cursor: 'pointer',
              }}>
              ×
            </button>
          )}
        </div>
        <ErrorLine text={uploadErr} />
      </div>

      {/* Text fields */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input
          type="text"
          value={item.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Title"
          maxLength={140}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: T.bgPaper,
            border: `1px solid ${T.borderLight}`,
            borderRadius: 4,
            padding: '7px 10px',
            fontFamily: T.fontDisplay, fontSize: 15, fontWeight: 500,
            color: T.textPrimary, outline: 'none',
          }}
        />
        <input
          type="text"
          value={item.author || ''}
          onChange={(e) => onChange({ author: e.target.value })}
          placeholder="Author (optional)"
          maxLength={120}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: T.bgPaper,
            border: `1px solid ${T.borderLight}`,
            borderRadius: 4,
            padding: '6px 10px',
            fontFamily: T.fontBody, fontSize: 12,
            color: T.textBody, outline: 'none',
          }}
        />
        <textarea
          value={item.note || ''}
          onChange={(e) => onChange({ note: e.target.value })}
          placeholder="One line on what this gave you (optional)"
          maxLength={200}
          rows={2}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: T.bgPaper,
            border: `1px solid ${T.borderLight}`,
            borderRadius: 4,
            padding: '6px 10px',
            fontFamily: T.fontReading, fontSize: 12,
            color: T.textBody, outline: 'none', resize: 'vertical',
          }}
        />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!onMoveUp}
            style={{
              background: 'transparent', border: 'none',
              color: onMoveUp ? T.textSecondary : T.borderLight,
              fontFamily: T.fontMono, fontSize: 11,
              cursor: onMoveUp ? 'pointer' : 'not-allowed',
              padding: 0,
            }}
            title="Move up">↑</button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!onMoveDown}
            style={{
              background: 'transparent', border: 'none',
              color: onMoveDown ? T.textSecondary : T.borderLight,
              fontFamily: T.fontMono, fontSize: 11,
              cursor: onMoveDown ? 'pointer' : 'not-allowed',
              padding: 0,
            }}
            title="Move down">↓</button>
          <span style={{ flex: 1 }} />
          <button
            type="button"
            onClick={onRemove}
            style={{
              background: 'transparent', border: 'none',
              fontFamily: T.fontMono, fontSize: 9,
              letterSpacing: '0.10em', textTransform: 'uppercase',
              color: T.textTertiary, cursor: 'pointer', padding: 0,
            }}>
            Remove
          </button>
        </div>
      </div>

      {searchOpen && (
        <CoverSearchPopover
          query={item.title}
          onPick={(pick) => {
            onChange({
              cover_url: pick.cover_url,
              source:    pick.source || 'openlibrary',
              author:    item.author?.trim() ? item.author : (pick.author || ''),
            });
            setSearchOpen(false);
          }}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </div>
  );
}

// Inline popover that runs the cover lookup against the current title.
// Renders a 4-column thumb grid; clicking a thumb returns the pick.
// Auto-runs the search on open so the user sees results immediately
// without re-typing what they already have.
function CoverSearchPopover({ query, onPick, onClose }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState(null);
  const [q,       setQ]       = useState(query || '');

  async function run() {
    setErr(null);
    setLoading(true);
    try {
      const r = await searchCovers(q);
      setResults(r);
    } catch (e) {
      setErr(e.message ?? 'Search failed.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    run();
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: T.bgOverlay,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: T.bgPrimary,
          borderRadius: 12, padding: 24,
          width: '100%', maxWidth: 560,
          maxHeight: '80vh', overflowY: 'auto',
          boxShadow: '0 8px 40px rgba(28,24,20,0.22)',
        }}>
        <div style={{
          fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 500,
          color: T.textPrimary, marginBottom: 12,
        }}>
          Find a cover
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') run(); }}
            placeholder="Title, or title + author"
            style={{
              flex: 1, boxSizing: 'border-box',
              background: T.bgWhite,
              border: `1px solid ${T.borderLight}`,
              borderRadius: 4,
              padding: '7px 10px',
              fontFamily: T.fontBody, fontSize: 13,
              color: T.textBody, outline: 'none',
            }}
          />
          <PrimaryButton onClick={run} disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
          </PrimaryButton>
        </div>
        {err && <ErrorLine text={err} />}
        {!loading && !err && results.length === 0 && (
          <p style={{
            fontFamily: T.fontReading, fontSize: 12, fontStyle: 'italic',
            color: T.textTertiary, margin: 0,
          }}>
            No covers found. Try a different query, or upload your own image.
          </p>
        )}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
          marginTop: 8,
        }}>
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onPick(r)}
              style={{
                background: 'transparent',
                border: `1px solid ${T.borderLight}`,
                borderRadius: 4,
                padding: 6,
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: 6,
              }}
              title={r.author ? `${r.title} — ${r.author}` : r.title}>
              <div style={{
                width: '100%', aspectRatio: '0.7',
                background: r.cover_url ? `url(${r.cover_url}) center/cover` : T.bgPaper,
                borderRadius: 2,
              }} />
              <div style={{
                fontFamily: T.fontDisplay, fontSize: 11, fontWeight: 500,
                color: T.textPrimary, lineHeight: 1.25,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {r.title}
              </div>
              {r.author && (
                <div style={{
                  fontFamily: T.fontBody, fontSize: 10, color: T.textTertiary,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  marginTop: -4,
                }}>
                  {r.author}
                </div>
              )}
            </button>
          ))}
        </div>
        <div style={{
          display: 'flex', justifyContent: 'flex-end',
          marginTop: 16, paddingTop: 12,
          borderTop: `1px solid ${T.borderLight}`,
        }}>
          <GhostButton onClick={onClose}>Close</GhostButton>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// ABOUT PROMPTS EDITOR
// Two surfaces in one modal: the single "wrestling with" prompt and the
// up-to-three "where I've changed my mind" entries. Bundled because they
// belong to the same About section visually and conceptually — a
// contributor revising one is likely to revise the other.
// ═════════════════════════════════════════════════════════════════════════

export function AboutPromptsEditor({ ghostMemberId, initial, onSave, onCancel }) {
  const [wrestling, setWrestling] = useState(initial?.wrestlingWith ?? '');
  const [changes,   setChanges]   = useState(() =>
    Array.isArray(initial?.mindChanges) ? [...initial.mindChanges] : []
  );
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState(null);

  function addChange() {
    if (changes.length >= MIND_CHANGES_MAX) return;
    setChanges(prev => [...prev, { from: '', to: '', why: '' }]);
  }

  function patchChange(i, patch) {
    setChanges(prev => prev.map((c, idx) => idx === i ? { ...c, ...patch } : c));
  }

  function removeChange(i) {
    setChanges(prev => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const cleanedChanges = changes
        .filter(c => c.from?.trim() || c.to?.trim() || c.why?.trim())
        .map(c => ({
          from: (c.from || '').trim(),
          to:   (c.to   || '').trim(),
          why:  (c.why  || '').trim(),
        }));
      const result = await updateProfile(ghostMemberId, {
        wrestling_with: wrestling.trim() || null,
        mind_changes:   cleanedChanges,
      });
      onSave(result);
    } catch (err) {
      setSaveError(err.message ?? 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="About — depth"
      hint="Two prompts that show what your thinking is doing right now, and where it has shifted. Both optional, both refreshable."
      onClose={onCancel}
      footer={
        <>
          <GhostButton onClick={onCancel} disabled={saving}>Cancel</GhostButton>
          <PrimaryButton onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </PrimaryButton>
        </>
      }
    >
      <div style={{ marginBottom: 24 }}>
        <MonoLabel>What I'm wrestling with</MonoLabel>
        <textarea
          value={wrestling}
          onChange={(e) => setWrestling(e.target.value)}
          placeholder="One open question you're working through right now."
          maxLength={WRESTLING_MAX}
          rows={3}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: T.bgWhite,
            border: `1px solid ${T.borderLight}`,
            borderRadius: 6,
            padding: '9px 12px',
            fontFamily: T.fontReading, fontSize: 14,
            color: T.textBody, outline: 'none', resize: 'vertical',
            lineHeight: 1.6,
          }}
        />
        <div style={{
          fontFamily: T.fontMono, fontSize: 10, color: T.textTertiary,
          textAlign: 'right', marginTop: 4,
        }}>
          {wrestling.length} / {WRESTLING_MAX}
        </div>
      </div>

      <div>
        <MonoLabel>Where I've changed my mind</MonoLabel>
        <p style={{
          fontFamily: T.fontReading, fontSize: 12, fontStyle: 'italic',
          color: T.textTertiary, margin: '0 0 12px', lineHeight: 1.5,
        }}>
          Up to three. Each entry: where you used to land, where you land now, and what shifted you.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {changes.map((c, i) => (
            <div key={i} style={{
              border: `1px solid ${T.borderLight}`,
              borderRadius: 6,
              padding: 12,
              background: T.bgWhite,
            }}>
              <input
                type="text"
                value={c.from || ''}
                onChange={(e) => patchChange(i, { from: e.target.value })}
                placeholder="From: where you used to land"
                maxLength={200}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: T.bgPaper,
                  border: `1px solid ${T.borderLight}`,
                  borderRadius: 4,
                  padding: '6px 10px',
                  fontFamily: T.fontReading, fontSize: 13,
                  color: T.textBody, outline: 'none',
                  marginBottom: 6,
                }}
              />
              <input
                type="text"
                value={c.to || ''}
                onChange={(e) => patchChange(i, { to: e.target.value })}
                placeholder="To: where you land now"
                maxLength={200}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: T.bgPaper,
                  border: `1px solid ${T.borderLight}`,
                  borderRadius: 4,
                  padding: '6px 10px',
                  fontFamily: T.fontReading, fontSize: 13,
                  color: T.textPrimary, outline: 'none',
                  marginBottom: 6,
                }}
              />
              <textarea
                value={c.why || ''}
                onChange={(e) => patchChange(i, { why: e.target.value })}
                placeholder="What shifted you (optional)"
                maxLength={300}
                rows={2}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: T.bgPaper,
                  border: `1px solid ${T.borderLight}`,
                  borderRadius: 4,
                  padding: '6px 10px',
                  fontFamily: T.fontReading, fontSize: 12,
                  color: T.textSecondary, outline: 'none',
                  resize: 'vertical', lineHeight: 1.5,
                }}
              />
              <div style={{ textAlign: 'right', marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => removeChange(i)}
                  style={{
                    background: 'transparent', border: 'none',
                    fontFamily: T.fontMono, fontSize: 9,
                    letterSpacing: '0.10em', textTransform: 'uppercase',
                    color: T.textTertiary, cursor: 'pointer', padding: 0,
                  }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
          {changes.length < MIND_CHANGES_MAX && (
            <button
              type="button"
              onClick={addChange}
              style={{
                background: T.bgWhite,
                border: `1px dashed ${T.borderRule}`,
                borderRadius: 6,
                padding: '10px 14px',
                fontFamily: T.fontMono, fontSize: 10,
                letterSpacing: '0.10em', textTransform: 'uppercase',
                color: T.textSecondary,
                cursor: 'pointer',
              }}>
              + Add an entry
            </button>
          )}
        </div>
      </div>

      <ErrorLine text={saveError} />
    </Modal>
  );
}
