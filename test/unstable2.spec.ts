import {markdownToBlocks} from '../src';
import * as slack from '../src/slack';

describe('iolated test 2', () => {
  it('should parse links in generic markdown:', () => {
    const actual = markdownToBlocks(
      '- This [access management guide](https://docs.altinn.studio/app/guides/access-management/studio/).'
    );

    const expected = [
      slack.section(
        '• This <https://docs.altinn.studio/app/guides/access-management/studio/|access management guide> .'
      ),
    ];
    expect(actual).toStrictEqual(expected);
  });
});
