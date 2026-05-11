#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = resolve(rootDir, '.env')
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')

function parseEnv(content) {
  const values = {}

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()

    if (!line || line.startsWith('#')) {
      continue
    }

    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)

    if (!match) {
      continue
    }

    const [, key, rawValue] = match
    let value = rawValue.trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    values[key] = value
  }

  return values
}

const fileEnv = existsSync(envPath)
  ? parseEnv(readFileSync(envPath, 'utf8'))
  : {}
const password = process.env.SUPABASE_DB_PASSWORD || fileEnv.SUPABASE_DB_PASSWORD

if (!password && !isDryRun) {
  console.error(
    [
      'Missing SUPABASE_DB_PASSWORD.',
      'Add it to local .env only, then run this command again:',
      '',
      'SUPABASE_DB_PASSWORD=<your hosted database password>',
      '',
      'Do not commit .env or paste the password into chat.'
    ].join('\n')
  )
  process.exit(1)
}

const childEnv = { ...process.env }

if (password) {
  childEnv.SUPABASE_DB_PASSWORD = password
}

const child = spawn('npx', ['supabase', 'db', 'push', ...args], {
  cwd: rootDir,
  env: childEnv,
  shell: process.platform === 'win32',
  stdio: 'inherit'
})

child.on('exit', (code) => {
  process.exit(code ?? 1)
})

child.on('error', (error) => {
  console.error(`Failed to run Supabase CLI: ${error.message}`)
  process.exit(1)
})
