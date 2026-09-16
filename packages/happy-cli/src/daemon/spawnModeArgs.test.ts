import { describe, expect, it } from 'vitest';
import { appendDaemonSpawnModeArgs, buildDaemonSpawnArgs, shouldForwardDaemonPermissionMode } from './spawnModeArgs';

describe('daemon spawn mode arguments', () => {
  it('forwards Codex default because it is a concrete ask-first policy', () => {
    const args: string[] = [];

    appendDaemonSpawnModeArgs(args, { directory: '/repo', permissionMode: 'default' }, 'codex');

    expect(args).toEqual(['--permission-mode', 'default']);
  });

  it('leaves Claude default ambient', () => {
    const args: string[] = [];

    appendDaemonSpawnModeArgs(args, { directory: '/repo', permissionMode: 'default' }, 'claude');

    expect(args).toEqual([]);
  });

  it('forwards explicit Codex permission, model, and effort selections', () => {
    const args: string[] = [];

    appendDaemonSpawnModeArgs(args, {
      directory: '/repo',
      permissionMode: 'yolo',
      modelMode: 'gpt-5.6-sol',
      effortLevel: 'medium',
    }, 'codex');

    expect(args).toEqual([
      '--permission-mode', 'yolo',
      '--model', 'gpt-5.6-sol',
      '--effort', 'medium',
    ]);
  });

  it('uses the same Codex default rule for resume launches', () => {
    expect(shouldForwardDaemonPermissionMode('codex', 'default')).toBe(true);
    expect(shouldForwardDaemonPermissionMode('claude', 'default')).toBe(false);
  });

  it('launches OpenCode through the existing ACP runner', () => {
    expect(buildDaemonSpawnArgs({
      directory: '/repo',
      agent: 'opencode',
    })).toEqual([
      'acp',
      'opencode',
      '--started-by',
      'daemon',
    ]);
  });

  it('keeps existing daemon launch and resume arguments intact', () => {
    expect(buildDaemonSpawnArgs({
      directory: '/repo',
      agent: 'codex',
      permissionMode: 'auto',
      modelMode: 'gpt-5.6-sol',
      effortLevel: 'high',
      resumeCodexThreadId: 'thread-1',
    })).toEqual([
      'codex',
      '--happy-starting-mode',
      'remote',
      '--started-by',
      'daemon',
      '--permission-mode',
      'auto',
      '--model',
      'gpt-5.6-sol',
      '--effort',
      'high',
      '--resume',
      'thread-1',
    ]);
  });

  it('still rejects unknown agent values received at runtime', () => {
    expect(() => buildDaemonSpawnArgs({
      directory: '/repo',
      agent: 'future-agent' as never,
    })).toThrow("Unsupported agent type: 'future-agent'");
  });
});
