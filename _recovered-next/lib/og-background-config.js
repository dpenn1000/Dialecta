/**
 * OG-card background photo mapping.
 *
 * Per-event-type assignment of which processed photo from
 * /public/og-backgrounds/library/ should appear behind the
 * celebration card text. Edit this file to re-shuffle photos.
 *
 * Initial assignment is a first pass; the photos are warm,
 * editorial, and broadly fit any celebration. Refine after seeing
 * each card render in the wild.
 *
 * The 12 source photos are processed by scripts/process-og-backgrounds.mjs
 * from the OneDrive Marketing/Social Media/Backgrounds folder. To add or
 * swap photos, drop new PNGs in OneDrive, re-run the script, then update
 * this map.
 *
 * Push 3 (admin OG-library upload UI) replaces this file with a
 * DB-backed config keyed by event_type. Until then, this is the
 * source of truth.
 */

export const BACKGROUND_MAP = {
  // Sunlit journal + window: warm, welcoming, the act of beginning to write.
  first_comment:       'photo-01.jpg',

  // Open journal + mountain view through window: composition, craft, view.
  first_article:       'photo-04.jpg',

  // Books visible, stacked, library register.
  first_quote:         'photo-03.jpg',

  // Soft window light + journal, second perspective on writing.
  delta_acknowledged:  'photo-05.jpg',

  // Dramatic dark with golden book spines + mountain sunrise: ascent.
  tier_promoted:       'photo-02.jpg',

  // Bright optimistic, gathering tone.
  follower_milestone:  'photo-08.jpg',

  // Most ceremonial / dramatic of the set: gold, weight, ritual.
  became_steward:      'photo-12.jpg',
};

// Photos available but currently unused (rotate in via this list):
//   photo-06.jpg, photo-07.jpg, photo-09.jpg, photo-10.jpg, photo-11.jpg
