import { AVATAR_COLORS, MOOD_IDS } from './constants'

export const IMAGE_MAX_BYTES = 4 * 1024 * 1024
export const DRAWING_MAX_BYTES = 2 * 1024 * 1024
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function validatePostForm(form) {
  const nextErrors = {}
  const displayName = form.displayName.trim()
  const message = form.message.trim()

  if (displayName.length < 2 || displayName.length > 24) {
    nextErrors.displayName = '이름은 2자 이상 24자 이하로 적어 주세요.'
  }

  if (message.length < 1 || message.length > 500) {
    nextErrors.message = '메시지는 1자 이상 500자 이하로 적어 주세요.'
  }

  if (!MOOD_IDS.includes(form.mood)) {
    nextErrors.form = '선택할 수 있는 무드로 다시 골라 주세요.'
  }

  if (!AVATAR_COLORS.includes(form.avatarColor)) {
    nextErrors.form = '선택할 수 있는 아바타 색상으로 다시 골라 주세요.'
  }

  if (form.attachmentMode === 'image' && !form.imageFile) {
    nextErrors.attachment = '이미지를 첨부하려면 파일을 선택해 주세요.'
  }

  if (form.attachmentMode === 'drawing' && !form.drawingDataUrl) {
    nextErrors.attachment = '그림을 첨부하려면 캔버스에 한 줄 이상 그려 주세요.'
  }

  return nextErrors
}

export function validateCommentForm({ message, mood }) {
  const trimmed = message.trim()

  if (trimmed.length < 1 || trimmed.length > 240) {
    return '댓글은 1자 이상 240자 이하로 적어 주세요.'
  }

  if (!MOOD_IDS.includes(mood)) {
    return '선택할 수 있는 무드로 다시 골라 주세요.'
  }

  return ''
}

export function validateImageFile(file) {
  if (!file) {
    return '이미지를 첨부하려면 파일을 선택해 주세요.'
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'JPG, PNG, WEBP 이미지만 선택할 수 있어요.'
  }

  if (file.size > IMAGE_MAX_BYTES) {
    return '이미지는 4MB 이하로 선택해 주세요.'
  }

  return ''
}
