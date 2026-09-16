import type { SpawnSessionOptions } from '@/modules/common/registerCommonHandlers';

type DaemonAgent = NonNullable<SpawnSessionOptions['agent']>;
const DAEMON_AGENTS: ReadonlySet<string> = new Set([
  'claude',
  'codex',
  'opencode',
  'gemini',
  'openclaw',
  'agy',
]);

export function buildDaemonSpawnArgs(options: SpawnSessionOptions): string[] {
  const requestedAgent: unknown = options.agent ?? 'claude';
  if (typeof requestedAgent !== 'string' || !DAEMON_AGENTS.has(requestedAgent)) {
    throw new Error(`Unsupported agent type: '${String(requestedAgent)}'. Please update your CLI to the latest version.`);
  }
  const agent = requestedAgent as DaemonAgent;
  const args = agent === 'opencode'
    ? ['acp', 'opencode', '--started-by', 'daemon']
    : [agent, '--happy-starting-mode', 'remote', '--started-by', 'daemon'];

  appendDaemonSpawnModeArgs(args, options, agent);

  if (options.resumeClaudeSessionId && agent === 'claude') {
    args.push('--resume', options.resumeClaudeSessionId);
  }
  if (options.resumeCodexThreadId && agent === 'codex') {
    args.push('--resume', options.resumeCodexThreadId);
  }

  return args;
}

export function shouldForwardDaemonPermissionMode(
  agent: string,
  permissionMode: string | undefined,
): permissionMode is string {
  if (!permissionMode) return false;

  // Claude's "default" means no harness override. Codex's "default" is a
  // concrete ask-first execution policy and differs from its ambient "auto".
  return permissionMode !== 'default' || agent === 'codex';
}

export function appendDaemonSpawnModeArgs(
  args: string[],
  options: SpawnSessionOptions,
  agent: string,
): void {
  if (agent !== 'claude' && agent !== 'codex') return;

  if (shouldForwardDaemonPermissionMode(agent, options.permissionMode)) {
    args.push('--permission-mode', options.permissionMode);
  }
  if (options.modelMode && options.modelMode !== 'default') {
    args.push('--model', options.modelMode);
  }
  if (options.effortLevel) {
    args.push('--effort', options.effortLevel);
  }
}
