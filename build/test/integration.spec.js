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
const src_1 = require("../src");
const slack = __importStar(require("../src/slack"));
describe('integration with unified', () => {
    // beforeEach(() => {
    //   jest.resetModules();
    // });
    it('should parse raw markdown into slack blocks', async () => {
        const text = `
a **b** _c_ **_d_ e**

# heading **a**

![59953191-480px](https://user-images.githubusercontent.com/16073505/123464383-b8715300-d5ba-11eb-8586-b1f965e1f18d.jpg)

<img src="https://user-images.githubusercontent.com/16073505/123464383-b8715300-d5ba-11eb-8586-b1f965e1f18d.jpg" alt="59953191-480px"/>

> block quote **a**
> block quote b

[link](https://apple.com)

- bullet _a_
- bullet _b_

1. number _a_
2. number _b_

- [ ] checkbox false
- [x] checkbox true

| Syntax      | Description |
| ----------- | ----------- |
| Header      | Title       |
| Paragraph   | Text        |
`;
        const actual = await (0, src_1.markdownToBlocks)(text);
        const expected = [
            slack.section('a *b* _c_ *_d_ e*'),
            slack.header('heading a'),
            slack.image('https://user-images.githubusercontent.com/16073505/123464383-b8715300-d5ba-11eb-8586-b1f965e1f18d.jpg', '59953191-480px'),
            slack.image('https://user-images.githubusercontent.com/16073505/123464383-b8715300-d5ba-11eb-8586-b1f965e1f18d.jpg', '59953191-480px'),
            slack.section('> block quote *a*\n> block quote b'),
            slack.section('<https://apple.com|link> '),
            slack.section('• bullet _a_'),
            slack.section('• bullet _b_'),
            slack.section('1. number _a_'),
            slack.section('2. number _b_'),
            slack.section('• checkbox false'),
            slack.section('• checkbox true'),
            slack.section('```\n' +
                '| Syntax | Description |\n' +
                '| --- | --- |\n' +
                '| Header | Title |\n' +
                '| Paragraph | Text |\n' +
                '```'),
        ];
        expect(actual).toStrictEqual(expected);
    });
    it('should parse long markdown', async () => {
        const text = new Array(3500).fill('a').join('') + 'bbbcccdddeee';
        const actual = await (0, src_1.markdownToBlocks)(text);
        const expected = [slack.section(text.slice(0, 3000))];
        expect(actual).toStrictEqual(expected);
    });
    describe('code blocks', () => {
        it('should parse code blocks with no language', async () => {
            const text = `\`\`\`
if (a === 'hi') {
  console.log('hi!')
} else {
  console.log('hello')
}
\`\`\``;
            const actual = await (0, src_1.markdownToBlocks)(text);
            const expected = [
                slack.section(`\`\`\`
if (a === 'hi') {
  console.log('hi!')
} else {
  console.log('hello')
}
\`\`\``),
            ];
            expect(actual).toStrictEqual(expected);
        });
        it('should parse code blocks with language', async () => {
            const text = `\`\`\`javascript
if (a === 'hi') {
  console.log('hi!')
} else {
  console.log('hello')
}
\`\`\``;
            const actual = await (0, src_1.markdownToBlocks)(text);
            const expected = [
                slack.section(`\`\`\`
if (a === 'hi') {
  console.log('hi!')
} else {
  console.log('hello')
}
\`\`\``),
            ];
            expect(actual).toStrictEqual(expected);
        });
        it('should parse code blocks in lists', async () => {
            const text = `1. **Some title in bold:**
\`\`\`javascript
if (a === 'hi') {
  console.log('hi!')
} else {
  console.log('hello')
}
\`\`\`
2. **Title 2 in bold:**
\`\`\`javascript
if (a === 'hi') {
  console.log('hi!')
} else {
  console.log('hello')
}
\`\`\``;
            const actual = await (0, src_1.markdownToBlocks)(text);
            const expected = [
                slack.section('1. *Some title in bold:*'),
                slack.section(`\`\`\`
if (a === 'hi') {
  console.log('hi!')
} else {
  console.log('hello')
}
\`\`\``),
                slack.section('2. *Title 2 in bold:*'),
                slack.section(`\`\`\`
if (a === 'hi') {
  console.log('hi!')
} else {
  console.log('hello')
}
\`\`\``),
            ];
            expect(actual).toStrictEqual(expected);
        });
    });
    it('should parse nested lists', async () => {
        const text = `1. **Title num 1 in bold:**
 - first, under item 1
 - second, under item 1
2. **Title 2 in bold:**
- first, under item 2
- second, under item 2`;
        const actual = await (0, src_1.markdownToBlocks)(text);
        const expected = [
            slack.section('1. *Title num 1 in bold:*'),
            slack.section('• first, under item 1'),
            slack.section('• second, under item 1'),
            slack.section('2. *Title 2 in bold:*'),
            slack.section('• first, under item 2'),
            slack.section('• second, under item 2'),
        ];
        expect(actual).toStrictEqual(expected);
        // console.log('actual:', JSON.stringify(actual));
    });
    it('should parse a list with multiple items, each containing one code block', async () => {
        const text = `1. **Title num 1 in bold:**
\`\`\`javascript
if (a === 'hi') {
console.log('hi!')
} else {
console.log('hello')
}
\`\`\`
2. **Title 2 in bold:**
\`\`\`javascript
if (a === 'hi') {
console.log('hi!')
} else {
console.log('hello')
}
\`\`\``;
        const actual = await (0, src_1.markdownToBlocks)(text);
        const expected = [
            slack.section('1. *Title num 1 in bold:*'),
            slack.section(`\`\`\`
if (a === 'hi') {
console.log('hi!')
} else {
console.log('hello')
}
\`\`\``),
            slack.section('2. *Title 2 in bold:*'),
            slack.section(`\`\`\`
if (a === 'hi') {
console.log('hi!')
} else {
console.log('hello')
}
\`\`\``),
        ];
        expect(actual).toStrictEqual(expected);
        // console.log('actual:', JSON.stringify(actual));
    });
    it('should correctly escape text', async () => {
        const actual = await (0, src_1.markdownToBlocks)('<>&\'""\'&><');
        const expected = [slack.section('&lt;&gt;&amp;\'""\'&amp;&gt;&lt;')];
        expect(actual).toStrictEqual(expected);
    });
    it('should parse this:', async () => {
        const actual = await (0, src_1.markdownToBlocks)('Intro line:\n\n1. **Item 1**:\n   - Unordered line 1\n   - **Source**: [Create apps](https://docs.altinn.studio/app/)\n\n2. **Item 2**:\n   - unordered under item 2');
        // console.log('actual:', JSON.stringify(actual));
        // [{"type":"section","text":{"type":"mrkdwn","text":"Intro line:"}},{"type":"section","text":{"type":"mrkdwn","text":"1. *Item 1*:\n\n2. *Item 2*:\n"}}]
        const expected = [
            slack.section('Intro line:'),
            // slack.section('1. *Item 1*:\n\n2. *Item 2*:\n   - Unordered line 1\n   - *Source*: [Create apps](https://docs.altinn.studio/app/)\n\n2. *Item 2*:\n   - unordered under item 2\n'),
            slack.section('1. *Item 1*:'),
            slack.section('• Unordered line 1'),
            slack.section('• *Source*: [Create apps](https://docs.altinn.studio/app/)'),
            slack.section('2. *Item 2*:'),
            slack.section('• unordered under item 2'),
        ];
        expect(actual).toStrictEqual(expected);
    });
});
//# sourceMappingURL=integration.spec.js.map