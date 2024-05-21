import {markdownToBlocks} from '../src';
import * as slack from '../src/slack';

describe('iolated test 2', () => {
  it('should parse ordered lists with unordered sublists and links:', async () => {
    const actual = await markdownToBlocks(
      // 'Intro line:\n\n' +
      '1. **Item 1**:\n   - Unordered line 1\n   - **A**: [Create apps](https://docs.altinn.studio/app/)\n\n2. **Item 2**:\n   - unordered under item 2'
    );

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
