"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tencent = exports.sina = exports.eastmoney = exports.base = exports.auto = void 0;
exports.getSources = getSources;
// Stocks
const auto_1 = __importDefault(require("./auto"));
exports.auto = auto_1.default;
const base_1 = __importDefault(require("./base"));
exports.base = base_1.default;
const eastmoney_1 = __importDefault(require("./eastmoney"));
exports.eastmoney = eastmoney_1.default;
const sina_1 = __importDefault(require("./sina"));
exports.sina = sina_1.default;
const tencent_1 = __importDefault(require("./tencent"));
exports.tencent = tencent_1.default;
const sourceNames = ["tencent", "sina", "eastmoney"];
function getSources() {
    return [...sourceNames];
}
exports.default = {
    auto: auto_1.default,
    base: base_1.default,
    eastmoney: eastmoney_1.default,
    getSources,
    sina: sina_1.default,
    tencent: tencent_1.default,
};
