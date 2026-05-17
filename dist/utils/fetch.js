"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = __importDefault(require("node:http"));
const node_https_1 = __importDefault(require("node:https"));
const node_url_1 = require("node:url");
const errors_1 = require("../errors");
class RequestBuilder {
    constructor(url) {
        this.url = url;
        this.options = {
            headers: {
                Accept: "*/*",
                "User-Agent": "Mozilla/5.0 (compatible; stock-api/2.0)",
            },
            maxRedirects: 3,
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
function request(url, options, redirectCount = 0) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new node_url_1.URL(url);
        const client = parsedUrl.protocol === "http:" ? node_http_1.default : node_https_1.default;
        const req = client.get(parsedUrl, {
            headers: options.headers,
            timeout: options.timeout,
        }, (res) => {
            const status = res.statusCode || 0;
            const location = res.headers.location;
            if (location &&
                status >= 300 &&
                status < 400 &&
                redirectCount < options.maxRedirects) {
                res.resume();
                const nextUrl = new node_url_1.URL(location, parsedUrl).toString();
                request(nextUrl, options, redirectCount + 1)
                    .then(resolve)
                    .catch(reject);
                return;
            }
            const chunks = [];
            res.on("data", (chunk) => chunks.push(chunk));
            res.on("error", reject);
            res.on("end", () => {
                const body = Buffer.concat(chunks);
                const response = {
                    body,
                    headers: res.headers,
                    status,
                    text: body.toString("utf8"),
                };
                if (status >= 400) {
                    reject(new errors_1.StockRequestError(`Request failed with status ${status}`));
                    return;
                }
                resolve(response);
            });
        });
        req.on("timeout", () => {
            req.destroy(new errors_1.StockRequestError(`Request timed out after ${options.timeout}ms`));
        });
        req.on("error", reject);
    });
}
const requestClient = {
    get(url) {
        return new RequestBuilder(url);
    },
};
exports.default = requestClient;
