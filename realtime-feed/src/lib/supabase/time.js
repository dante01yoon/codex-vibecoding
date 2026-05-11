const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat('ko-KR', {
  numeric: 'auto',
})

export function formatRelativeTime(value) {
  const date = new Date(value)
  const deltaSeconds = Math.round((date.getTime() - Date.now()) / 1000)
  const absSeconds = Math.abs(deltaSeconds)

  if (Number.isNaN(date.getTime())) {
    return '방금 전'
  }

  if (absSeconds < 60) {
    return '방금 전'
  }

  if (absSeconds < 60 * 60) {
    return RELATIVE_TIME_FORMATTER.format(Math.round(deltaSeconds / 60), 'minute')
  }

  if (absSeconds < 60 * 60 * 24) {
    return RELATIVE_TIME_FORMATTER.format(Math.round(deltaSeconds / 3600), 'hour')
  }

  if (absSeconds < 60 * 60 * 24 * 7) {
    return RELATIVE_TIME_FORMATTER.format(Math.round(deltaSeconds / 86400), 'day')
  }

  if (absSeconds < 60 * 60 * 24 * 30) {
    return RELATIVE_TIME_FORMATTER.format(Math.round(deltaSeconds / 604800), 'week')
  }

  if (absSeconds < 60 * 60 * 24 * 365) {
    return RELATIVE_TIME_FORMATTER.format(Math.round(deltaSeconds / 2592000), 'month')
  }

  return RELATIVE_TIME_FORMATTER.format(Math.round(deltaSeconds / 31536000), 'year')
}
