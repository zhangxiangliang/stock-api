"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniq = uniq;
function uniq(items) {
    return Array.from(new Set(items));
}
