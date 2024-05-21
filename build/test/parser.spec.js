"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const slack = __importStar(require("../src/slack"));
const internal_1 = require("../src/parser/internal");
const marked_1 = require("marked");
describe('parser', () => {
    it('should parse basic markdown', () => {
        const tokens = marked_1.marked.lexer('**a ~b~** c[*d*](https://example.com)');
        const actual = (0, internal_1.parseBlocks)(tokens);
        const expected = [slack.section('*a ~b~* c<https://example.com|_d_> ')];
        expect(actual).toStrictEqual(expected);
    });
    it('should parse links in ordered list', () => {
        const tokens = marked_1.marked.lexer('1. **Source**: [link](https://example.com)');
        const actual = (0, internal_1.parseBlocks)(tokens);
        const expected = [
            slack.section('1. *Source*: <https://example.com|link> '),
        ];
        expect(actual).toStrictEqual(expected);
    });
    it('should parse links in unordered list', () => {
        const tokens = marked_1.marked.lexer('   - **Source**: [link](https://example.com)');
        const actual = (0, internal_1.parseBlocks)(tokens);
        const expected = [slack.section('• *Source*: <https://example.com|link> ')];
        expect(actual).toStrictEqual(expected);
    });
    it('should parse links in unordered lists, nested in ordered lists', () => {
        const tokens = marked_1.marked.lexer('Intro line:\n\n1. Item 1 [link](https://example.com)\n   - Unordered [link](https://example.com)\n   - **Unordered**: [link](https://example.com)\n2. **Item 2** [link](https://example.com)\n   - unordered: [link](https://example.com)');
        const actual = (0, internal_1.parseBlocks)(tokens);
        const expected = [
            slack.section('Intro line:'),
            slack.section('1. Item 1 <https://example.com|link> '),
            slack.section('• Unordered <https://example.com|link> '),
            slack.section('• *Unordered*: <https://example.com|link> '),
            slack.section('2. *Item 2* <https://example.com|link> '),
            slack.section('• unordered: <https://example.com|link> '),
        ];
        expect(actual).toStrictEqual(expected);
    });
    it('should parse link with label', () => {
        const tokens = marked_1.marked.lexer(' **Source**: [link](https://example.com)');
        const actual = (0, internal_1.parseBlocks)(tokens);
        const expected = [slack.section(' *Source*: <https://example.com|link> ')];
        expect(actual).toStrictEqual(expected);
    });
    it('should parse ordered lists with unordered sublists and links:', async () => {
        const tokens = marked_1.marked.lexer('Intro line:\n\n1. **Item 1**: [Create apps](https://docs.altinn.studio/app/)\n\n   - Unordered line 1\n   - **Source**: [Create apps](https://docs.altinn.studio/app/)\n\n2. **Item 2**:\n   - unordered under item 2');
        const actual = (0, internal_1.parseBlocks)(tokens);
        const expected = [
            slack.section('Intro line:'),
            slack.section('1. *Item 1*: <https://docs.altinn.studio/app/|Create apps> '),
            slack.section('• Unordered line 1'),
            slack.section('• *Source*: <https://docs.altinn.studio/app/|Create apps> '),
            slack.section('2. *Item 2*:'),
            slack.section('• unordered under item 2'),
        ];
        expect(actual).toStrictEqual(expected);
    });
    it('should parse ordered lists with unordered sublists and links:', async () => {
        const tokens = marked_1.marked.lexer('- This [access management guide](https://docs.altinn.studio/app/guides/access-management/studio/).');
        const actual = (0, internal_1.parseBlocks)(tokens);
        const expected = [
            slack.section('• This <https://docs.altinn.studio/app/guides/access-management/studio/|access management guide> .'),
        ];
        expect(actual).toStrictEqual(expected);
    });
    it('should parse header', () => {
        const tokens = marked_1.marked.lexer('# a');
        const actual = (0, internal_1.parseBlocks)(tokens);
        const expected = [slack.header('a')];
        expect(actual).toStrictEqual(expected);
    });
    it('should parse thematic break', () => {
        const tokens = marked_1.marked.lexer('---');
        const actual = (0, internal_1.parseBlocks)(tokens);
        const expected = [slack.divider()];
        expect(actual).toStrictEqual(expected);
    });
    it('should parse lists', () => {
        const tokens = marked_1.marked.lexer(`
    1. a
    2. b
    - c
    - d
    * e
    * f
    `
            .trim()
            .split('\n')
            .map(s => s.trim())
            .join('\n'));
        const actual = (0, internal_1.parseBlocks)(tokens);
        const expected = [
            slack.section('1. a'),
            slack.section('2. b'),
            slack.section('• c'),
            slack.section('• d'),
            slack.section('• e'),
            slack.section('• f'),
        ];
        expect(actual).toStrictEqual(expected);
    });
    it('should parse images', () => {
        const tokens = marked_1.marked.lexer('![alt](url "title")![](url)');
        const actual = (0, internal_1.parseBlocks)(tokens);
        const expected = [
            slack.image('url', 'alt', 'title'),
            slack.image('url', 'url'),
        ];
        expect(actual).toStrictEqual(expected);
    });
});
it('should truncate basic markdown', () => {
    const a4000 = new Array(4000).fill('a').join('');
    const a3000 = new Array(3000).fill('a').join('');
    const tokens = marked_1.marked.lexer(a4000);
    const actual = (0, internal_1.parseBlocks)(tokens);
    const expected = [slack.section(a3000)];
    expect(actual.length).toStrictEqual(expected.length);
});
it('should truncate header', () => {
    const a200 = new Array(200).fill('a').join('');
    const a150 = new Array(150).fill('a').join('');
    const tokens = marked_1.marked.lexer(`# ${a200}`);
    const actual = (0, internal_1.parseBlocks)(tokens);
    const expected = [slack.header(a150)];
    expect(actual.length).toStrictEqual(expected.length);
});
it('should truncate image title', () => {
    const a3000 = new Array(3000).fill('a').join('');
    const a2000 = new Array(2000).fill('a').join('');
    const tokens = marked_1.marked.lexer(`![${a3000}](url)`);
    const actual = (0, internal_1.parseBlocks)(tokens);
    const expected = [slack.image('url', a2000)];
    expect(actual.length).toStrictEqual(expected.length);
});
//# sourceMappingURL=parser.spec.js.map