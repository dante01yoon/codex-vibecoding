import { requireSupabaseClient } from './client'

export async function ensureAnonymousSession() {
  const client = requireSupabaseClient()
  const { data: sessionData, error: sessionError } = await client.auth.getSession()

  if (sessionError) {
    throw sessionError
  }

  if (sessionData.session?.user) {
    syncRealtimeAuth(client, sessionData.session)
    return normalizeSessionUser(sessionData.session.user)
  }

  const { data, error } = await client.auth.signInAnonymously()

  if (error) {
    throw error
  }

  if (!data.user) {
    throw new Error('익명 세션을 만들지 못했어요.')
  }

  syncRealtimeAuth(client, data.session)

  return normalizeSessionUser(data.user)
}

function syncRealtimeAuth(client, session) {
  if (session?.access_token) {
    client.realtime.setAuth(session.access_token)
  }
}

function normalizeSessionUser(user) {
  return {
    id: user.id,
    isAnonymous: Boolean(user.is_anonymous),
  }
}
