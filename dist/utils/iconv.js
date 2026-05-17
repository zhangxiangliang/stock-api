"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_util_1 = require("node:util");
function normalizeEncoding(encoding) {
    return encoding.toLowerCase() === "gbk" ? "gb18030" : encoding;
}
const iconv = {
    decode(body, encoding) {
        return new node_util_1.TextDecoder(normalizeEncoding(encoding)).decode(body);
    },
};
exports.default = iconv;
