/**
 * dialecta-classify-stream.js
 *
 * React hook that consumes the SSE-streaming variant of the article
 * classifier (/api/article/classify-stream). Used by both:
 *
 *   - The article editor's FinalReadStage, which fires classify in the
 *     background while the author re-reads their article.
 *   - The post-page admin Re-setup Maps modal, which uses the same
 *     stream + thinking-feed UX for smoke-testing the picker.
 *
 * Usage:
 *
 *   const {
 *     streamPhase,           // 'starting' | 'thinking' | 'writing-output' |
 *                            //   'candidates-streaming' | 'candidates-complete' |
 *                            //   'complete' | 'error' | 'idle'
 *     thinkingLog,           // string[] — appended chunks of summarized model
 *                            //   reasoning, in arrival order
 *     streamingCandidates,   // candidate[] — populated incrementally as each
 *                            //   candidate JSON object closes in the stream
 *     analysis,              // null until 'result' event, then full ai_analysis
 *     error,                 // null unless the stream errored
 *   } = useClassifyStream({
 *     enabled,         // boolean — when true the hook fires the request
 *     apiBase,         // string  — origin (or '' to use same-origin)
 *     article_text,    // string  — POST body field
 *     declaration,     // object  — POST body field
 *     declared_tier,   // string  — POST body field (defaults 'forum')
 *   });
 *
 * Aborts cleanly on unmount or when `enabled` flips back to false. Safe
 * against React Strict Mode double-invocation.
 */

import { useEffect, useRef, useState } from 'react';

export function useClassifyStream({
  enabled,
  apiBase,
  article_text,
  declaration,
  declared_tier,
  max_candidates,    // optional cap; undefined/null lets the skill default apply (target 3)
}) {
  const [streamPhase, setStreamPhase]                   = useState('idle');
  const [thinkingLog, setThinkingLog]                   = useState([]);
  const [streamingCandidates, setStreamingCandidates]   = useState([]);
  const [analysis, setAnalysis]                         = useState(null);
  const [error, setError]                               = useState(null);

  // Use a ref to survive Strict Mode double-mount without re-firing the
  // request. Once a stream has started for this hook instance, we don't
  // start another even if the effect runs twice.
  const startedRef = useRef(false);
  const ctrlRef    = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    if (!article_text || article_text.length < 200) return;
    if (!declaration?.core_claim) return;
    if (startedRef.current) return;
    startedRef.current = true;

    setStreamPhase('starting');
    setThinkingLog([]);
    setStreamingCandidates([]);
    setAnalysis(null);
    setError(null);

    const ctrl = new AbortController();
    ctrlRef.current = ctrl;

    (async () => {
      try {
        const resp = await fetch(`${apiBase}/api/article/classify-stream`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          signal:  ctrl.signal,
          body:    JSON.stringify({
            article_text,
            declaration,
            declared_tier: declared_tier || 'forum',
            ...(typeof max_candidates === 'number' && max_candidates >= 1 && max_candidates <= 4
              ? { max_candidates }
              : {}),
          }),
        });
        if (!resp.ok) {
          const text = await resp.text().catch(() => '');
          throw new Error(`Classify failed (${resp.status}): ${text.slice(0, 200)}`);
        }

        const reader   = resp.body.getReader();
        const decoder  = new TextDecoder();
        let leftover = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          leftover += decoder.decode(value, { stream: true });
          const blocks = leftover.split('\n\n');
          leftover = blocks.pop();
          for (const block of blocks) {
            if (!block.trim()) continue;
            let evt = 'message';
            let dataStr = '';
            for (const line of block.split('\n')) {
              if (line.startsWith('event: ')) evt = line.slice(7).trim();
              else if (line.startsWith('data: ')) dataStr += line.slice(6);
            }
            if (!dataStr) continue;
            let data;
            try { data = JSON.parse(dataStr); } catch { continue; }

            if (evt === 'phase') {
              setStreamPhase(data.phase || 'unknown');
            } else if (evt === 'thinking' && typeof data.text === 'string') {
              setThinkingLog((prev) => [...prev, data.text]);
            } else if (evt === 'candidate' && data.candidate) {
              setStreamingCandidates((prev) => [...prev, data.candidate]);
            } else if (evt === 'result' && data.analysis) {
              setAnalysis(data.analysis);
            } else if (evt === 'error') {
              throw new Error(data.error || data.detail || 'Stream error');
            }
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setStreamPhase('error');
      }
    })();

    return () => {
      ctrl.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { streamPhase, thinkingLog, streamingCandidates, analysis, error };
}
