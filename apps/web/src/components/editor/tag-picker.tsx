'use client';

/**
 * Primary topic (one of twelve, fixed) and secondary tags (open, free text).
 *
 * Ported from TagPicker, dialecta-editor.jsx 400-545. Same two groups, same
 * case-insensitive de-duplication, same Enter-to-add. Dropped: the "Tag
 * missing from primary list? Submit a request" line, which linked to
 * /suggestions/, a Ghost page with no counterpart in apps/web.
 */
import { useState } from 'react';
import { TOPIC_LIST, type TopicSlug } from '@/lib/topics';
import { strings } from '@/strings';
import { Label } from './primitives';

export function TagPicker({
  primary,
  secondary,
  onPrimaryChange,
  onSecondaryChange,
}: {
  primary: TopicSlug | null;
  secondary: readonly string[];
  onPrimaryChange: (slug: TopicSlug) => void;
  onSecondaryChange: (tags: string[]) => void;
}) {
  const [draft, setDraft] = useState('');
  const copy = strings.writer.compose;

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    if (!secondary.some((s) => s.toLowerCase() === t.toLowerCase())) {
      onSecondaryChange([...secondary, t]);
    }
    setDraft('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Label>{copy.primaryTopic}</Label>
        <div className="dw-topics">
          {TOPIC_LIST.map((t) => (
            <button
              key={t.slug}
              type="button"
              className="dw-topic"
              aria-pressed={primary === t.slug}
              onClick={() => onPrimaryChange(t.slug)}
            >
              <span className="dw-topic-dot" style={{ background: t.color }} aria-hidden="true" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>
          {copy.secondaryTags} <span className="dw-label-aside">{copy.secondaryAside}</span>
        </Label>
        {secondary.length > 0 ? (
          <div className="dw-chips">
            {secondary.map((tag) => (
              <span key={tag} className="dw-chip">
                {tag}
                <button
                  type="button"
                  onClick={() => onSecondaryChange(secondary.filter((s) => s !== tag))}
                  aria-label={copy.removeTag(tag)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : null}
        <div className="dw-tag-row">
          <input
            type="text"
            className="dw-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add();
              }
            }}
            placeholder={copy.tagPlaceholder}
            aria-label={copy.secondaryTags}
          />
          <button type="button" className="dw-btn dw-btn--ghost" onClick={add} disabled={!draft.trim()}>
            {copy.addTag}
          </button>
        </div>
      </div>
    </div>
  );
}
