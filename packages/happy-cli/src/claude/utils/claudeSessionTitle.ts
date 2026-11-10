import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getProjectPath } from "./path";

/**
 * Last title given to a Claude session: the last `{"type":"custom-title"}` line of its
 * transcript (written by /rename and by the change_title sync hook), or null.
 *
 * Used on resume: Happy creates a NEW Happy session for the same Claude session, so the
 * title kept in the old Happy metadata is lost unless it is restored from the transcript.
 */
export function claudeSessionTitle(sessionId: string, workingDirectory: string): string | null {
    const file = join(getProjectPath(workingDirectory), `${sessionId}.jsonl`);
    if (!existsSync(file)) {
        return null;
    }
    let title: string | null = null;
    for (const line of readFileSync(file, 'utf-8').split('\n')) {
        // cheap filter before parsing: transcripts can be tens of MB
        if (!line.includes('"custom-title"')) continue;
        try {
            const entry = JSON.parse(line);
            if (entry.type === 'custom-title' && typeof entry.customTitle === 'string' && entry.customTitle.trim()) {
                title = entry.customTitle.trim();
            }
        } catch {
            // a malformed line never blocks the session
        }
    }
    return title;
}
