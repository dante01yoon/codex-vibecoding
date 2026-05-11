import { buildAttachmentFromPath, removePostAttachment } from './attachments'
import { requireSupabaseClient } from './client'
import { formatRelativeTime } from './time'

const POST_COLUMNS =
  'id, author_id, display_name, message, avatar_color, mood, attachment_path, attachment_kind, created_at, deleted_at'

export async function listPosts() {
  const client = requireSupabaseClient()
  const { data, error } = await client
    .from('guestbook_posts')
    .select(POST_COLUMNS)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) throw error
  return data.map((row) => mapPostRow(row))
}

export async function createPost({ form, attachment, userId }) {
  const client = requireSupabaseClient()
  const { data, error } = await client
    .from('guestbook_posts')
    .insert({
      author_id: userId,
      avatar_color: form.avatarColor,
      display_name: form.displayName.trim(),
      message: form.message.trim(),
      mood: form.mood,
      attachment_kind: attachment?.kind ?? null,
      attachment_path: attachment?.path ?? null,
    })
    .select(POST_COLUMNS)
    .single()

  if (error) throw error
  return mapPostRow(data, { isNew: true })
}

export async function softDeletePost(post) {
  const client = requireSupabaseClient()
  const { error } = await client
    .from('guestbook_posts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', post.id)
    .select('id')
    .single()

  if (error) throw error

  if (post.attachment?.path) {
    try {
      await removePostAttachment(post.attachment.path)
    } catch {
      // The post is already soft-deleted; media cleanup can be retried later.
    }
  }
}

export function subscribeToPosts({ onInsert, onRemove, onStatus }) {
  const client = requireSupabaseClient()
  const channel = client
    .channel('guestbook-posts')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'guestbook_posts' },
      (payload) => {
        if (!payload.new.deleted_at) {
          onInsert(mapPostRow(payload.new, { isNew: true }))
        }
      },
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'guestbook_posts' },
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

function mapPostRow(row, options = {}) {
  return {
    id: row.id,
    authorId: row.author_id,
    displayName: row.display_name,
    mood: row.mood,
    avatarColor: row.avatar_color,
    message: row.message,
    createdLabel: formatRelativeTime(row.created_at),
    attachment: buildAttachmentFromPath({
      kind: row.attachment_kind,
      path: row.attachment_path,
    }),
    isNew: Boolean(options.isNew),
  }
}
