import { requireSupabaseClient } from './client'
import { formatRelativeTime } from './time'

const COMMENT_COLUMNS = 'id, post_id, author_id, message, mood, created_at, deleted_at'

export async function listComments(postId) {
  const client = requireSupabaseClient()
  const { data, error } = await client
    .from('guestbook_comments')
    .select(COMMENT_COLUMNS)
    .eq('post_id', postId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map((row) => mapCommentRow(row))
}

export async function createComment({ postId, message, mood, userId }) {
  const client = requireSupabaseClient()
  const { data, error } = await client
    .from('guestbook_comments')
    .insert({
      author_id: userId,
      message: message.trim(),
      mood,
      post_id: postId,
    })
    .select(COMMENT_COLUMNS)
    .single()

  if (error) throw error
  return mapCommentRow(data, { isLocalAuthor: true })
}

export async function softDeleteComment(commentId) {
  const client = requireSupabaseClient()
  const { error } = await client
    .from('guestbook_comments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', commentId)
    .select('id')
    .single()

  if (error) throw error
}

export function subscribeToComments({ postId, onInsert, onRemove, onStatus }) {
  const client = requireSupabaseClient()
  const channel = client
    .channel(`guestbook-comments-${postId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        filter: `post_id=eq.${postId}`,
        schema: 'public',
        table: 'guestbook_comments',
      },
      (payload) => {
        if (!payload.new.deleted_at) {
          onInsert(mapCommentRow(payload.new))
        }
      },
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        filter: `post_id=eq.${postId}`,
        schema: 'public',
        table: 'guestbook_comments',
      },
      (payload) => {
        if (payload.new.deleted_at) {
          onRemove(payload.new.id)
        }
      },
    )
    .subscribe((status) => {
      onStatus?.(status)
    })

  return () => {
    client.removeChannel(channel)
  }
}

function mapCommentRow(row, options = {}) {
  return {
    id: row.id,
    authorId: row.author_id,
    displayName: options.isLocalAuthor ? '나' : '방문자',
    mood: row.mood,
    message: row.message,
    createdLabel: formatRelativeTime(row.created_at),
  }
}
