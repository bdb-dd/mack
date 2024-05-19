import type { DividerBlock, HeaderBlock, ImageBlock, SectionBlock } from '@slack/types';
export declare function section(text: string): SectionBlock;
export declare function divider(): DividerBlock;
export declare function header(text: string): HeaderBlock;
export declare function image(url: string, altText: string, title?: string): ImageBlock;
