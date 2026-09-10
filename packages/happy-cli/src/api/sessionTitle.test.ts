import { describe, expect, it } from 'vitest';
import { deriveProvisionalTitle } from './sessionTitle';

describe('deriveProvisionalTitle', () => {
    it('takes the opening words of the message', () => {
        expect(deriveProvisionalTitle('fix the login redirect loop')).toBe('fix the login redirect loop');
    });

    it('collapses newlines and repeated whitespace into one line', () => {
        expect(deriveProvisionalTitle('  deploy   the\n\tpanel  ')).toBe('deploy the panel');
    });

    it('caps long messages with an ellipsis instead of pasting a paragraph in the sidebar', () => {
        const title = deriveProvisionalTitle(
            'please review the whole authentication module and tell me every place where the session token is refreshed',
        );
        expect(title).toBe('please review the whole authentication…');
        expect(title!.length).toBeLessThanOrEqual(46);
    });

    it('cuts on the character budget when a single word blows past it', () => {
        const title = deriveProvisionalTitle('supercalifragilisticexpialidociousandthensomemorecharacters tail');
        expect(title!.length).toBeLessThanOrEqual(46);
        expect(title!.endsWith('…')).toBe(true);
    });

    it('never cuts an emoji in half when the hard cut lands mid-character', () => {
        const title = deriveProvisionalTitle('a'.repeat(39) + '\u{1F600}' + 'b');
        expect(title!.endsWith('…')).toBe(true);
        // A lone surrogate renders as a replacement glyph in the sidebar.
        expect(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/.test(title!)).toBe(false);
        expect(title).toBe('a'.repeat(39) + '…');
    });

    it('drops control characters that would corrupt the sidebar row', () => {
        expect(deriveProvisionalTitle('build \u0007 the\u0000report')).toBe('build the report');
    });

    it('returns null when there is nothing to name the chat after', () => {
        expect(deriveProvisionalTitle('')).toBeNull();
        expect(deriveProvisionalTitle('   \n\t  ')).toBeNull();
        expect(deriveProvisionalTitle('\u0007\u0000')).toBeNull();
    });
});
