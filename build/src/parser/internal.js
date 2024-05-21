"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBlocks = void 0;
const slack_1 = require("../slack");
const fast_xml_parser_1 = require("fast-xml-parser");
function parsePlainText(element) {
    var _a;
    switch (element.type) {
        case 'link':
        case 'em':
        case 'strong':
        case 'del':
            return element.tokens.flatMap(child => parsePlainText(child));
        case 'br':
            return [];
        case 'image':
            return [(_a = element.title) !== null && _a !== void 0 ? _a : element.href];
        case 'codespan':
        case 'text':
        case 'html':
            return [element.raw];
    }
}
function isSectionBlock(block) {
    return block.type === 'section';
}
function parseMrkdwn(element) {
    switch (element.type) {
        case 'link': {
            return `<${element.href}|${element.tokens
                .flatMap(child => parseMrkdwn(child))
                .join('')}> `;
        }
        case 'em': {
            return `_${element.tokens
                .flatMap(child => parseMrkdwn(child))
                .join('')}_`;
        }
        case 'codespan':
            return `\`${element.text}\``;
        case 'strong': {
            return `*${element.tokens
                .flatMap(child => parseMrkdwn(child))
                .join('')}*`;
        }
        case 'text':
            return element.text;
        case 'del': {
            return `~${element.tokens
                .flatMap(child => parseMrkdwn(child))
                .join('')}~`;
        }
        default:
            return '';
    }
}
function addMrkdwn(content, accumulator) {
    const last = accumulator[accumulator.length - 1];
    if (last && isSectionBlock(last) && last.text) {
        last.text.text += content;
    }
    else {
        accumulator.push((0, slack_1.section)(content));
    }
}
function parsePhrasingContentToStrings(element, accumulator) {
    var _a, _b, _c;
    if (element.type === 'image') {
        accumulator.push((_c = (_b = (_a = element.href) !== null && _a !== void 0 ? _a : element.title) !== null && _b !== void 0 ? _b : element.text) !== null && _c !== void 0 ? _c : 'image');
    }
    else {
        const text = parseMrkdwn(element);
        accumulator.push(text);
    }
}
function parsePhrasingContent(element, accumulator) {
    if (element.type === 'image') {
        const imageBlock = (0, slack_1.image)(element.href, element.text || element.title || element.href, element.title || '');
        accumulator.push(imageBlock);
    }
    else {
        const text = parseMrkdwn(element);
        addMrkdwn(text, accumulator);
    }
}
function parseParagraph(element) {
    return element.tokens.reduce((accumulator, child) => {
        parsePhrasingContent(child, accumulator);
        return accumulator;
    }, []);
}
function parseHeading(element) {
    return (0, slack_1.header)(element.tokens
        .flatMap(child => parsePlainText(child))
        .join(''));
}
function parseCode(element) {
    return (0, slack_1.section)(`\`\`\`\n${element.text}\n\`\`\``);
}
function parseList(element, options = {}) {
    let index = 0;
    const sections = element.items.map(item => {
        // console.log('index: ', index, ' element.item: ', JSON.stringify(item));
        var _a, _b, _c, _d;
        let selfText = '';
        // first child token should always be a valid Mrkdwn text token, will assume so
        const paragraph = item.tokens[0];
        if (!paragraph || paragraph.type !== 'text' || !((_a = paragraph.tokens) === null || _a === void 0 ? void 0 : _a.length)) {
            selfText = (paragraph === null || paragraph === void 0 ? void 0 : paragraph.text) || '';
        }
        const text = ((_b = paragraph.tokens) !== null && _b !== void 0 ? _b : [])
            .filter((child) => child.type !== 'image')
            .flatMap(parseMrkdwn)
            .join('');
        if (element.ordered) {
            index += 1;
            const currentIndex = Math.max(index, typeof element.start === 'number' ? element.start : 0);
            selfText = `${currentIndex}. ${text}`;
            // selfText = `${element.start}. ${text}`;
        }
        else if (item.checked !== null && item.checked !== undefined) {
            selfText = `${(_d = (_c = options.checkboxPrefix) === null || _c === void 0 ? void 0 : _c.call(options, item.checked)) !== null && _d !== void 0 ? _d : '• '}${text}`;
        }
        else {
            selfText = `• ${text}`;
        }
        // console.log(`selfText: ${selfText}`)
        // now, we need to check the other children and add additional sections
        const childSections = item.tokens.slice(1).flatMap(token => {
            return parseToken(token, {});
        });
        return [(0, slack_1.section)(selfText), ...childSections];
    });
    return sections.flat();
}
function combineBetweenPipes(texts) {
    return `| ${texts.join(' | ')} |`;
}
function parseTableRows(rows) {
    const parsedRows = [];
    rows.forEach((row, index) => {
        const parsedCells = parseTableRow(row);
        if (index === 1) {
            const headerRowArray = new Array(parsedCells.length).fill('---');
            const headerRow = combineBetweenPipes(headerRowArray);
            parsedRows.push(headerRow);
        }
        parsedRows.push(combineBetweenPipes(parsedCells));
    });
    return parsedRows;
}
function parseTableRow(row) {
    const parsedCells = [];
    row.forEach(cell => {
        parsedCells.push(parseTableCell(cell));
    });
    return parsedCells;
}
function parseTableCell(cell) {
    const texts = cell.tokens.reduce((accumulator, child) => {
        parsePhrasingContentToStrings(child, accumulator);
        return accumulator;
    }, []);
    return texts.join(' ');
}
function parseTable(element) {
    const parsedRows = parseTableRows([element.header, ...element.rows]);
    return (0, slack_1.section)(`\`\`\`\n${parsedRows.join('\n')}\n\`\`\``);
}
function parseBlockquote(element) {
    return element.tokens
        .filter((child) => child.type === 'paragraph')
        .flatMap(p => parseParagraph(p).map(block => {
        var _a, _b;
        if (isSectionBlock(block) && ((_b = (_a = block.text) === null || _a === void 0 ? void 0 : _a.text) === null || _b === void 0 ? void 0 : _b.includes('\n')))
            block.text.text = '> ' + block.text.text.replace(/\n/g, '\n> ');
        return block;
    }));
}
function parseThematicBreak() {
    return (0, slack_1.divider)();
}
function parseHTML(element) {
    const parser = new fast_xml_parser_1.XMLParser({ ignoreAttributes: false });
    const res = parser.parse(element.raw);
    if (res.img) {
        const tags = res.img instanceof Array ? res.img : [res.img];
        return tags
            .map((img) => {
            const url = img['@_src'];
            return (0, slack_1.image)(url, img['@_alt'] || url);
        })
            .filter((e) => !!e);
    }
    else
        return [];
}
function parseToken(token, options) {
    switch (token.type) {
        case 'heading':
            return [parseHeading(token)];
        case 'paragraph':
            return parseParagraph(token);
        case 'code':
            return [parseCode(token)];
        case 'blockquote':
            return parseBlockquote(token);
        case 'list':
            console.log(`list: ${JSON.stringify(token)}`);
            return parseList(token, options.lists);
        case 'table':
            return [parseTable(token)];
        case 'hr':
            return [parseThematicBreak()];
        case 'html':
            return parseHTML(token);
        default:
            return [];
    }
}
function parseBlocks(tokens, options = {}) {
    return tokens.flatMap(token => parseToken(token, options));
}
exports.parseBlocks = parseBlocks;
//# sourceMappingURL=internal.js.map