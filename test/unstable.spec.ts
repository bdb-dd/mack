import {markdownToBlocks} from '../src';
import * as slack from '../src/slack';

describe('iolated test 1', () => {
  it('should parse ordered lists with unordered sublists and links:', () => {
    const actual = markdownToBlocks(
      '1. **Item 1**:\n   - Unordered line 1\n   - **A**: [Create apps](https://docs.altinn.studio/app/)\n\n2. **Item 2**:\n   - unordered under item 2'
    );

    const expected = [
      slack.section('1. *Item 1*:'),
      slack.section('• Unordered line 1'),
      slack.section('• *A*: <https://docs.altinn.studio/app/|Create apps> '),
      slack.section('2. *Item 2*:'),
      slack.section('• unordered under item 2'),
    ];
    expect(actual).toStrictEqual(expected);
  });
});
