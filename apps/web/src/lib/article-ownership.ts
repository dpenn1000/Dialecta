/**
 * Whether the signed-in viewer wrote a given article. Server only.
 *
 * Used to show "Revise this article" on the article page and nowhere else. It
 * decides a link's visibility, never a write: the publish route resolves the
 * author again from the session and filters its update on author_member_id,
 * and the update policy on articles will judge the row once it exists.
 *
 * The viewer's member_id comes from get_own_profile_for_comment(), the same
 * SECURITY DEFINER lookup api/comment and api/article use. A viewer with no
 * session, or a session that resolves to no profile, is simply not the author.
 */
import { createClient } from '@/lib/supabase/server';

export async function isOwnArticle(articleId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();
    if (!claimsData?.claims?.sub) return false;

    const { data: profileRows } = await supabase.rpc('get_own_profile_for_comment');
    const profile = Array.isArray(profileRows) ? profileRows[0] : undefined;
    if (!profile || typeof profile.member_id !== 'string') return false;

    const { data } = await supabase
      .from('articles')
      .select('id')
      .eq('id', articleId)
      .eq('author_member_id', profile.member_id)
      .maybeSingle();
    return Boolean(data);
  } catch {
    // Any failure means the link stays hidden, which is the safe default.
    return false;
  }
}
