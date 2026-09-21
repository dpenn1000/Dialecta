/**
 * The shapes the discourse layer passes from server to island. Plain,
 * serializable data only: this file imports nothing that touches Supabase,
 * so a client component can import it without pulling data.ts along.
 *
 * What is deliberately absent. No comment carries `member_id`: it is the
 * Ghost member id, which security holds as a credential finding
 * (supabase/migrations/20260921044120_close_comments_member_email_to_public.sql),
 * and a prop on a client component is printed into the page's HTML. No
 * mention carries one either, for the same reason. `member_email` is never
 * selected at all.
 */
import type { Tier } from '@dialecta/core';

export type CommentStatus = 'published' | 'pending_review' | 'suppressed';

/**
 * Why a card shows a notice instead of the comment's text. Decided on the
 * server, and the text is dropped there, so a withheld body never reaches
 * the browser through this page.
 *
 *   breach      the resolved tier is Breach. The spec: "The original text
 *               is never shown. The explanation is always shown."
 *   suppressed  the row's status is suppressed.
 *   unread      no classification row exists, so nothing says the text is
 *               not a Breach. Fails closed, per legal's precondition on
 *               status and final_tier drifting apart.
 */
export type Withheld = 'breach' | 'suppressed' | 'unread';

export interface CommentTier {
  /** Stage 1: the classifier's read. */
  ai: Tier;
  /** Stage 2: the commenter's own declaration, when they made one. */
  self: Tier | null;
  /**
   * The tier the card and the topology bar use: final_tier when the row has
   * one, else resolveFinalTier over the signals present. Never the
   * self-declaration alone, which is the fallback the recovered card used.
   */
  final: Tier;
}

export interface CommentMention {
  /** The text after the @ that appears in the body. */
  token: string;
  displayName: string;
}

export interface DiscourseComment {
  id: string;
  parentId: string | null;
  authorName: string;
  /** Null exactly when `withheld` is set. */
  body: string | null;
  withheld: Withheld | null;
  createdAt: string;
  status: CommentStatus;
  /** The signed-in viewer wrote it. Decided on the server. */
  isOwn: boolean;
  tier: CommentTier | null;
  /** 0 to 3, from the classification. */
  specificity: number | null;
  mentions: CommentMention[];
}

/**
 * The private half of a classification, sent only to the person who wrote
 * the comment and only for their own comments: the commenter message is
 * addressed to them, not to readers.
 */
export interface OwnReading {
  commentId: string;
  claimText: string | null;
  strength: string | null;
  commenterMessage: string | null;
  specificity: number | null;
  emotion: string | null;
  engagement: string | null;
  borderlineOther: Tier | null;
}

/** Who is looking, as far as commenting goes. Mirrors the checks /api/comment makes. */
export type ViewerState =
  | { kind: 'signed-out' }
  | { kind: 'no-email' }
  | { kind: 'no-profile' }
  | { kind: 'incomplete' }
  | { kind: 'unavailable' }
  | { kind: 'ready'; name: string };

export interface ComposerArticle {
  id: string;
  slug: string;
  title: string;
  /** The article's declared claims as plain strings, for the classifier. */
  claims: string[];
}

export interface DiscourseData {
  viewer: ViewerState;
  comments: DiscourseComment[];
  ownReadings: OwnReading[];
  /** The conversation could not be read. The feed shows a notice rather than a partial list. */
  unavailable: boolean;
  /** Development only: why the read failed, shown under the notice. Never set in production. */
  diagnostic?: string;
  /**
   * Development only: the tiers could not be read because this machine has no
   * service role key, so cards render without them under a banner saying so.
   * A production build withholds the conversation instead (`unavailable`).
   */
  tierless?: boolean;
  /** Server clock at render, so relative times hydrate to the same text they rendered with. */
  renderedAt: string;
}

/** The comment a reply is aimed at, as the composer's banner shows it. */
export interface ReplyTarget {
  id: string;
  authorName: string;
  excerpt: string;
}
