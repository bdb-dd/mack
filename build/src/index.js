"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markdownToBlocks = void 0;
const internal_1 = require("./parser/internal");
const marked_1 = require("marked");
/**
 * Parses Markdown content into Slack BlockKit Blocks.
 * - Supports headings (all Markdown heading levels are treated as the single Slack header block)
 * - Supports numbered lists, bulleted lists, to-do lists
 * - Supports italics, bold, strikethrough, inline code, hyperlinks
 * - Supports images
 * - Supports thematic breaks / dividers
 *
 * Per Slack limitations, these markdown attributes are not completely supported:
 * - Tables: they will be copied but Slack will render them as text
 * - Block quotes (limited functionality; does not support lists, headings, or images within the block quote)
 *
 * Supports GitHub-flavoured Markdown.
 *
 * @param body any Markdown or GFM content
 * @param options options to configure the parser
 */
function markdownToBlocks(body, options = {}) {
    // Slack only wants &, <, and > escaped
    // https://api.slack.com/reference/surfaces/formatting#escaping
    const replacements = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
    };
    const lexer = new marked_1.marked.Lexer();
    lexer.options.tokenizer = new marked_1.marked.Tokenizer();
    lexer.options.tokenizer.inlineText = src => {
        const text = src.replace(/[&<>]/g, char => {
            return replacements[char];
        });
        return {
            type: 'text',
            raw: src,
            text: text,
        };
    };
    const tokens = lexer.lex(body);
    return (0, internal_1.parseBlocks)(tokens, options);
}
exports.markdownToBlocks = markdownToBlocks;
//# sourceMappingURL=index.js.map