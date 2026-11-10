import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { claudeSessionTitle } from './claudeSessionTitle';
import { getProjectPath } from './path';

describe('claudeSessionTitle', () => {
    let configDir: string;
    const cwd = '/tmp/progetto-di-prova';

    beforeEach(() => {
        configDir = mkdtempSync(join(tmpdir(), 'claude-config-'));
        process.env.CLAUDE_CONFIG_DIR = configDir;
        mkdirSync(getProjectPath(cwd), { recursive: true });
    });

    afterEach(() => {
        delete process.env.CLAUDE_CONFIG_DIR;
        rmSync(configDir, { recursive: true, force: true });
    });

    const transcript = (lines: string[]) =>
        writeFileSync(join(getProjectPath(cwd), 'sess-1.jsonl'), lines.join('\n') + '\n');

    it('returns the last custom title of the transcript', () => {
        transcript([
            '{"type":"user","uuid":"a"}',
            '{"type":"custom-title","customTitle":"Primo titolo","sessionId":"sess-1"}',
            'non json "custom-title"',
            '{"type":"custom-title","customTitle":"  Titolo giusto  ","sessionId":"sess-1"}',
        ]);
        expect(claudeSessionTitle('sess-1', cwd)).toBe('Titolo giusto');
    });

    it('returns null without a title or without the transcript', () => {
        transcript(['{"type":"user","uuid":"a"}', '{"type":"custom-title","customTitle":"   "}']);
        expect(claudeSessionTitle('sess-1', cwd)).toBeNull();
        expect(claudeSessionTitle('inesistente', cwd)).toBeNull();
    });
});
