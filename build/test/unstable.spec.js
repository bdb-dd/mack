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
describe('iolated test 2', () => {
    it('should parse ordered lists with unordered sublists and links:', async () => {
        const actual = await (0, src_1.markdownToBlocks)(
        // 'Intro line:\n\n' +
        '1. **Item 1**:\n   - Unordered line 1\n   - **A**: [Create apps](https://docs.altinn.studio/app/)\n\n2. **Item 2**:\n   - unordered under item 2');
        const expected = [
            // slack.section('Intro line:'),
            slack.section('1. *Item 1*:'),
            slack.section('• Unordered line 1'),
            slack.section('• *A*: <https://docs.altinn.studio/app/|Create apps> '),
            slack.section('2. *Item 2*:'),
            slack.section('• unordered under item 2'),
        ];
        expect(actual).toStrictEqual(expected);
    });
});
//# sourceMappingURL=unstable.spec.js.map