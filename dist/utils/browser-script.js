"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBrowserRuntime = isBrowserRuntime;
exports.loadBrowserScript = loadBrowserScript;
exports.loadBrowserScriptValue = loadBrowserScriptValue;
exports.loadBrowserJsonp = loadBrowserJsonp;
const errors_1 = require("../errors");
function isBrowserRuntime() {
    return Boolean(globalThis.document);
}
async function loadBrowserScript(options) {
    const runtime = globalThis;
    const document = runtime.document;
    const parent = (document === null || document === void 0 ? void 0 : document.head) || (document === null || document === void 0 ? void 0 : document.body) || (document === null || document === void 0 ? void 0 : document.documentElement);
    if (!document || !parent) {
        throw new errors_1.StockRequestError("Browser document is not available");
    }
    await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        const timeout = options.timeout || 15000;
        const timeoutId = setTimeout(() => {
            cleanup();
            reject(new errors_1.StockRequestError(`Script request timed out after ${timeout}ms`));
        }, timeout);
        function cleanup() {
            var _a, _b;
            clearTimeout(timeoutId);
            script.onload = null;
            script.onerror = null;
            (_b = (_a = script.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild) === null || _b === void 0 ? void 0 : _b.call(_a, script);
        }
        script.async = true;
        script.charset = options.charset || "utf-8";
        script.onload = () => {
            cleanup();
            resolve();
        };
        script.onerror = () => {
            cleanup();
            reject(new errors_1.StockRequestError("Script request failed"));
        };
        script.src = options.url;
        parent.appendChild(script);
    });
}
async function loadBrowserScriptValue(options) {
    const runtime = globalThis;
    await loadBrowserScript(options);
    const value = runtime[options.variableName];
    delete runtime[options.variableName];
    return typeof value === "string" ? value : "";
}
async function loadBrowserJsonp(options) {
    const runtime = globalThis;
    const callbackParam = options.callbackParam || "callback";
    const callbackName = `stockApiJsonp${Date.now()}${Math.floor(Math.random() * 100000)}`;
    let result;
    runtime[callbackName] = (value) => {
        result = value;
    };
    try {
        const url = appendQueryParam(options.url, callbackParam, callbackName);
        await loadBrowserScript({
            charset: options.charset,
            timeout: options.timeout,
            url,
        });
    }
    finally {
        delete runtime[callbackName];
    }
    if (result === undefined) {
        throw new errors_1.StockRequestError("JSONP response did not invoke callback");
    }
    return result;
}
function appendQueryParam(url, name, value) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
}
