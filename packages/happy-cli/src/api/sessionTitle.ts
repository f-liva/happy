/**
 * Provisional chat titles.
 *
 * The real title is supposed to come from the agent calling `change_title`,
 * nudged by the system prompt. That nudge is advice, not a guarantee: when the
 * model skips it the chat stays "New chat" forever, which is exactly the chat
 * you are looking for three days later. This derives a title from the first
 * user message instead — no model, no network, no latency — so every chat is
 * named the moment it starts, and the agent is still free to replace it with
 * something better.
 */

/** Enough to recognise a chat in the sidebar, short enough not to wrap. */
const MAX_TITLE_CHARS = 40;

/**
 * A one-line title taken from the opening of `text`, or `null` when the message
 * carries nothing worth naming a chat after (empty, blank, control bytes only).
 */
export function deriveProvisionalTitle(text: string): string | null {
    const cleaned = text
        // Control bytes become spaces rather than vanishing: dropping them would
        // weld the words around them together ("the<NUL>report" -> "thereport").
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    if (!cleaned) return null;
    if (cleaned.length <= MAX_TITLE_CHARS) return cleaned;

    const budget = cleaned.slice(0, MAX_TITLE_CHARS);
    const lastSpace = budget.lastIndexOf(' ');
    // A first word longer than the whole budget has no space to cut on: the hard
    // cut keeps the promise that the title fits, instead of pasting a paragraph.
    const cut = lastSpace > 0 ? budget.slice(0, lastSpace) : dropDanglingSurrogate(budget);
    return `${cut}…`;
}


/**
 * Drop a trailing high surrogate left behind by a cut that landed inside an
 * astral character (an emoji is two UTF-16 code units). Half a character is not
 * a character: it renders as a replacement glyph.
 */
function dropDanglingSurrogate(text: string): string {
    const last = text.charCodeAt(text.length - 1);
    return last >= 0xd800 && last <= 0xdbff ? text.slice(0, -1) : text;
}
