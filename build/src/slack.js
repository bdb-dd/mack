"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.section = section;
exports.divider = divider;
exports.header = header;
exports.image = image;
const MAX_TEXT_LENGTH = 3000;
const MAX_HEADER_LENGTH = 150;
const MAX_IMAGE_TITLE_LENGTH = 2000;
const MAX_IMAGE_ALT_TEXT_LENGTH = 2000;
function section(text) {
    return {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: text.slice(0, MAX_TEXT_LENGTH),
        },
    };
}
function divider() {
    return {
        type: 'divider',
    };
}
function header(text) {
    return {
        type: 'header',
        text: {
            type: 'plain_text',
            text: text.slice(0, MAX_HEADER_LENGTH),
        },
    };
}
function image(url, altText, title) {
    return {
        type: 'image',
        image_url: url,
        alt_text: altText.slice(0, MAX_IMAGE_ALT_TEXT_LENGTH),
        title: title
            ? {
                type: 'plain_text',
                text: title.slice(0, MAX_IMAGE_TITLE_LENGTH),
            }
            : undefined,
    };
}
//# sourceMappingURL=slack.js.map