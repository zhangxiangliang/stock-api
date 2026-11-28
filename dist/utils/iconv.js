"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function normalizeEncoding(encoding) {
    return encoding.toLowerCase() === "gbk" ? "gb18030" : encoding;
}
const iconv = {
    decode(body, encoding) {
        return new TextDecoder(normalizeEncoding(encoding)).decode(body);
    },
};
exports.default = iconv;
