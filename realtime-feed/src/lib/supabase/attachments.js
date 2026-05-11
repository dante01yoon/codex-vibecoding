import { DRAWING_MAX_BYTES, validateImageFile } from '../guestbook/validation'
import { requireSupabaseClient, supabase } from './client'

export const GUESTBOOK_MEDIA_BUCKET = 'guestbook-media'

export async function uploadPostAttachment(form, userId) {
  if (form.attachmentMode === 'none') {
    return null
  }

  if (form.attachmentMode === 'image') {
    const validationError = validateImageFile(form.imageFile)
    if (validationError) throw new Error(validationError)

    return uploadFile({
      body: form.imageFile,
      contentType: form.imageFile.type,
      kind: 'image',
      title: form.imageFileName || '첨부 이미지',
      userId,
    })
  }

  if (form.attachmentMode === 'drawing') {
    const drawingBlob = await dataUrlToBlob(form.drawingDataUrl)
    if (drawingBlob.size > DRAWING_MAX_BYTES) {
      throw new Error('그림은 2MB 이하로 첨부해 주세요.')
    }

    return uploadFile({
      body: drawingBlob,
      contentType: drawingBlob.type || 'image/png',
      kind: 'drawing',
      title: '직접 그린 그림',
      userId,
    })
  }

  return null
}

export async function removePostAttachment(path) {
  if (!path) return

  const client = requireSupabaseClient()
  const { error } = await client.storage.from(GUESTBOOK_MEDIA_BUCKET).remove([path])
  if (error) throw error
}

export function buildAttachmentFromPath({ kind, path, title }) {
  if (!path || !kind) {
    return null
  }

  const { data } = supabase.storage.from(GUESTBOOK_MEDIA_BUCKET).getPublicUrl(path)

  return {
    kind,
    path,
    title: title || (kind === 'drawing' ? '직접 그린 그림' : '첨부 이미지'),
    url: data.publicUrl,
  }
}

async function uploadFile({ body, contentType, kind, title, userId }) {
  const client = requireSupabaseClient()
  const path = `posts/${userId}/${crypto.randomUUID()}.${extensionForType(contentType)}`
  const { data, error } = await client.storage
    .from(GUESTBOOK_MEDIA_BUCKET)
    .upload(path, body, {
      cacheControl: '3600',
      contentType,
      upsert: false,
    })

  if (error) {
    throw error
  }

  return buildAttachmentFromPath({
    kind,
    path: data.path,
    title,
  })
}

async function dataUrlToBlob(dataUrl) {
  const response = await fetch(dataUrl)
  return response.blob()
}

function extensionForType(contentType) {
  if (contentType === 'image/jpeg') return 'jpg'
  if (contentType === 'image/webp') return 'webp'
  return 'png'
}
