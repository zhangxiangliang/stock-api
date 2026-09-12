"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProviderCapabilities = getProviderCapabilities;
exports.assertProviderFeatureSupported = assertProviderFeatureSupported;
const errors_1 = require("../../errors");
const browser_script_1 = require("../../utils/browser-script");
const supported = { supported: true };
const sinaBrowserUnsupported = {
    supported: false,
    note: "Sina requires a valid Referer that browser JavaScript cannot set. Use stocks.auto, Node.js, or a backend proxy.",
};
const capabilities = {
    eastmoney: {
        browser: {
            kline: supported,
            quote: supported,
            search: supported,
        },
        node: {
            kline: supported,
            quote: supported,
            search: supported,
        },
        source: "eastmoney",
    },
    sina: {
        browser: {
            kline: supported,
            quote: sinaBrowserUnsupported,
            search: sinaBrowserUnsupported,
        },
        node: {
            kline: supported,
            quote: supported,
            search: supported,
        },
        source: "sina",
    },
    tencent: {
        browser: {
            kline: supported,
            quote: supported,
            search: supported,
        },
        node: {
            kline: supported,
            quote: supported,
            search: supported,
        },
        source: "tencent",
    },
};
function getProviderCapabilities() {
    return Object.values(capabilities).map((capability) => ({
        browser: cloneRuntimeCapability(capability.browser),
        node: cloneRuntimeCapability(capability.node),
        source: capability.source,
    }));
}
function assertProviderFeatureSupported(source, feature) {
    const runtime = (0, browser_script_1.isBrowserRuntime)() ? "browser" : "node";
    const support = capabilities[source][runtime][feature];
    if (!support.supported) {
        throw new errors_1.StockRequestError(`${source} ${feature} is not available in ${runtime}. ${support.note || ""}`.trim());
    }
}
function cloneRuntimeCapability(capability) {
    return {
        kline: { ...capability.kline },
        quote: { ...capability.quote },
        search: { ...capability.search },
    };
}
