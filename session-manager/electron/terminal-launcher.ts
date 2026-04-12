import { spawn } from 'node:child_process';

function quoteForPosixShell(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function quoteForPowerShell(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function quoteForAppleScript(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function spawnDetached(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      detached: true,
      stdio: 'ignore',
      windowsHide: false,
    });

    child.once('error', reject);
    child.once('spawn', () => {
      child.unref();
      resolve();
    });
  });
}

export async function openSessionInTerminal(options: {
  cwd?: string;
  sessionId: string;
}): Promise<void> {
  const cwd = options.cwd || process.cwd();

  if (process.platform === 'darwin') {
    const shellCommand = `cd ${quoteForPosixShell(cwd)}; codex resume ${quoteForPosixShell(
      options.sessionId,
    )}`;
    const appleScript = [
      'tell application "Terminal"',
      'activate',
      `do script ${quoteForAppleScript(shellCommand)}`,
      'end tell',
    ].join('\n');

    await spawnDetached('osascript', ['-e', appleScript]);
    return;
  }

  if (process.platform === 'win32') {
    const powerShellCommand = `Set-Location -LiteralPath ${quoteForPowerShell(
      cwd,
    )}; codex resume ${quoteForPowerShell(options.sessionId)}`;

    await spawnDetached('cmd.exe', [
      '/c',
      'start',
      '',
      'powershell.exe',
      '-NoExit',
      '-Command',
      powerShellCommand,
    ]);
    return;
  }

  const shellCommand = `cd ${quoteForPosixShell(cwd)} && codex resume ${quoteForPosixShell(
    options.sessionId,
  )}`;
  const launchers: Array<{ command: string; args: string[] }> = [
    ...(process.env.TERMINAL
      ? [{ command: process.env.TERMINAL, args: ['-e', 'bash', '-lc', shellCommand] }]
      : []),
    { command: 'x-terminal-emulator', args: ['-e', 'bash', '-lc', shellCommand] },
    { command: 'gnome-terminal', args: ['--', 'bash', '-lc', shellCommand] },
    { command: 'konsole', args: ['-e', 'bash', '-lc', shellCommand] },
    { command: 'xfce4-terminal', args: ['--command', `bash -lc ${quoteForPosixShell(shellCommand)}`] },
    { command: 'xterm', args: ['-e', 'bash', '-lc', shellCommand] },
  ];

  let lastError: unknown;
  for (const launcher of launchers) {
    try {
      await spawnDetached(launcher.command, launcher.args);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('No supported terminal launcher was found on this system.');
}
