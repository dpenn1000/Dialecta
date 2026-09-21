'use client';

/**
 * The prose editor: TipTap, per ADR-003 ("Dialecta owns its editor, TipTap,
 * writing body_json and body_html together").
 *
 * This is the one part of the writer that is REWRITTEN rather than ported.
 * The recovered ProseEditor (dialecta-editor.jsx 294-394) was a contentEditable
 * div driven by document.execCommand, which is deprecated, stores whatever
 * markup the browser invents (a <div> per line in Chrome, <br> soup in
 * Safari), and produces no structured document to store as body_json. What
 * carries over is everything a writer touches:
 *
 *   - The same six tools in the same order: H2, H3, Bold, Italic, bulleted
 *     list, plain paragraph. Same labels, same mono glyphs.
 *   - The toolbar keeps the editor's selection when clicked (the recovered
 *     onMouseDown preventDefault).
 *   - The placeholder is an overlay shown while the document is empty, as the
 *     recovered one was, rather than TipTap's Placeholder extension, which
 *     would mean importing @tiptap/extensions directly: a transitive package
 *     apps/web does not declare.
 *   - Heading levels are capped at 2 and 3. The title is the page's h1.
 *
 * One deliberate behaviour change. The recovered editor stripped every paste
 * to plain text, because pasted HTML "can carry foreign styles that muddy the
 * look". ProseMirror parses a paste through the document schema, so foreign
 * styles, fonts and colours never enter the document at all; paragraphs,
 * headings, lists, bold, italic and links do. The recovered reason is met by
 * construction without flattening a pasted draft into one paragraph.
 *
 * `onChange` receives the JSON document and its HTML from the same
 * transaction, so body_json and body_html cannot drift apart before they
 * reach the publish route.
 */
import { useEffect, useRef, type ReactNode } from 'react';
import { EditorContent, useEditor, useEditorState, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { strings } from '@/strings';

export interface ProseChange {
  json: JSONContent;
  html: string;
}

interface ToolbarButtonProps {
  glyph: ReactNode;
  label: string;
  active: boolean;
  onRun: () => void;
}

function ToolbarButton({ glyph, label, active, onRun }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className="dw-tool"
      data-active={active}
      aria-pressed={active}
      title={label}
      aria-label={label}
      // Keep the editor's selection: without this the click blurs the
      // editor first and the command lands nowhere.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onRun}
    >
      {glyph}
    </button>
  );
}

export function ProseEditor({
  initialContent,
  onChange,
  placeholder,
}: {
  initialContent: JSONContent | string | null;
  onChange: (change: ProseChange) => void;
  placeholder: string;
}) {
  // The latest onChange, read from inside the editor's own update callback so
  // a parent re-render never has to rebuild the editor.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
    ],
    content: initialContent ?? '',
    // Next renders this island on the server first; TipTap must not try to
    // build a view there, or the first client render mismatches.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'dialecta-reading',
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': strings.writer.compose.bodyLabel,
        spellcheck: 'true',
      },
    },
    onUpdate: ({ editor: e }) => {
      onChangeRef.current({ json: e.getJSON(), html: e.getHTML() });
    },
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            isEmpty: e.isEmpty,
            h2: e.isActive('heading', { level: 2 }),
            h3: e.isActive('heading', { level: 3 }),
            bold: e.isActive('bold'),
            italic: e.isActive('italic'),
            bulletList: e.isActive('bulletList'),
            paragraph: e.isActive('paragraph') && !e.isActive('bulletList') && !e.isActive('orderedList'),
          }
        : null,
  });

  const tools = strings.writer.compose.tools;
  const run = (fn: () => void) => () => {
    if (editor) fn();
  };

  return (
    <div>
      <div className="dw-toolbar dialecta-paper dialecta-wood-frame" role="toolbar" aria-label={strings.writer.compose.bodyLabel}>
        <ToolbarButton
          glyph="H2"
          label={tools.h2}
          active={Boolean(state?.h2)}
          onRun={run(() => editor?.chain().focus().toggleHeading({ level: 2 }).run())}
        />
        <ToolbarButton
          glyph="H3"
          label={tools.h3}
          active={Boolean(state?.h3)}
          onRun={run(() => editor?.chain().focus().toggleHeading({ level: 3 }).run())}
        />
        <span className="dw-tool-sep" aria-hidden="true" />
        <ToolbarButton
          glyph={<strong>B</strong>}
          label={tools.bold}
          active={Boolean(state?.bold)}
          onRun={run(() => editor?.chain().focus().toggleBold().run())}
        />
        <ToolbarButton
          glyph={<em>I</em>}
          label={tools.italic}
          active={Boolean(state?.italic)}
          onRun={run(() => editor?.chain().focus().toggleItalic().run())}
        />
        <span className="dw-tool-sep" aria-hidden="true" />
        <ToolbarButton
          glyph="•"
          label={tools.bulletList}
          active={Boolean(state?.bulletList)}
          onRun={run(() => editor?.chain().focus().toggleBulletList().run())}
        />
        <ToolbarButton
          glyph="¶"
          label={tools.paragraph}
          active={Boolean(state?.paragraph)}
          // clearNodes lifts out of lists and headings to a plain paragraph,
          // which is what the recovered formatBlock('p') was reaching for.
          onRun={run(() => editor?.chain().focus().clearNodes().run())}
        />
      </div>

      <div className="dw-prose">
        {state?.isEmpty !== false ? (
          <div className="dw-placeholder" aria-hidden="true">
            {placeholder}
          </div>
        ) : null}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
