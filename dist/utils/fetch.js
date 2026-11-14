"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
class RequestBuilder {
    constructor(url) {
        this.url = url;
        this.options = {
            headers: {
                Accept: "*/*",
                "User-Agent": "Mozilla/5.0 (compatible; stock-api/2.0)",
            },
            retries: 2,
            timeout: 15000,
        };
    }
    set(name, value) {
        this.options.headers[name] = value;
        return this;
    }
    responseType(_type) {
        return this;
    }
    retries(count) {
        this.options.retries = count;
        return this;
    }
    timeout(ms) {
        this.options.timeout = ms;
        return this;
    }
    then(onfulfilled, onrejected) {
        return this.send().then(onfulfilled, onrejected);
    }
    async send() {
        let lastError;
        for (let attempt = 0; attempt <= this.options.retries; attempt++) {
            try {
                return await request(this.url, this.options);
            }
            catch (error) {
                lastError = error;
            }
        }
        throw lastError;
    }
}
async function request(url, options) {
    if (typeof globalThis.fetch !== "function") {
        throw new errors_1.StockRequestError("globalThis.fetch is not available");
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout);
    try {
        const response = await globalThis.fetch(url, {
            headers: createRequestHeaders(options.headers),
            redirect: "follow",
            signal: controller.signal,
        });
        const status = response.status;
        const body = await response.arrayBuffer();
        const result = {
            body,
            headers: getResponseHeaders(response.headers),
            status,
            text: new TextDecoder("utf-8").decode(body),
        };
        if (!response.ok) {
            throw new errors_1.StockRequestError(`Request failed with status ${status}`);
        }
        return result;
    }
    catch (error) {
        if (isAbortError(error)) {
            throw new errors_1.StockRequestError(`Request timed out after ${options.timeout}ms`);
        }
        throw error;
    }
    finally {
        clearTimeout(timeoutId);
    }
}
function createRequestHeaders(headers) {
    const result = new Headers();
    for (const [name, value] of Object.entries(headers)) {
        if (isBrowserForbiddenHeader(name)) {
            continue;
        }
        result.set(name, value);
    }
    return result;
}
function getResponseHeaders(headers) {
    const result = {};
    headers.forEach((value, name) => {
        result[name] = value;
    });
    return result;
}
function isBrowserForbiddenHeader(name) {
    if (!isBrowser()) {
        return false;
    }
    return ["referer", "user-agent"].includes(name.toLowerCase());
}
function isBrowser() {
    return "window" in globalThis && "document" in globalThis;
}
function isAbortError(error) {
    return error instanceof DOMException && error.name === "AbortError";
}
const requestClient = {
    get(url) {
        return new RequestBuilder(url);
    },
};
exports.default = requestClient;
