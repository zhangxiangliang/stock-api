import http from "node:http";
import https from "node:https";
import { URL } from "node:url";
import { StockRequestError } from "../errors";

type HeaderValue = string | string[] | undefined;

export interface Response {
  body: Buffer;
  headers: Record<string, HeaderValue>;
  status: number;
  text: string;
}

type RequestOptions = {
  headers: Record<string, string>;
  maxRedirects: number;
  retries: number;
  timeout: number;
};

class RequestBuilder implements PromiseLike<Response> {
  private options: RequestOptions = {
    headers: {
      Accept: "*/*",
      "User-Agent": "Mozilla/5.0 (compatible; stock-api/2.0)",
    },
    maxRedirects: 3,
    retries: 2,
    timeout: 15000,
  };

  constructor(private readonly url: string) {}

  set(name: string, value: string): this {
    this.options.headers[name] = value;
    return this;
  }

  responseType(_type: string): this {
    return this;
  }

  then<TResult1 = Response, TResult2 = never>(
    onfulfilled?:
      | ((value: Response) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.send().then(onfulfilled, onrejected);
  }

  private async send(): Promise<Response> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.options.retries; attempt++) {
      try {
        return await request(this.url, this.options);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  }
}

function request(
  url: string,
  options: RequestOptions,
  redirectCount = 0
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === "http:" ? http : https;

    const req = client.get(
      parsedUrl,
      {
        headers: options.headers,
        timeout: options.timeout,
      },
      (res) => {
        const status = res.statusCode || 0;
        const location = res.headers.location;

        if (
          location &&
          status >= 300 &&
          status < 400 &&
          redirectCount < options.maxRedirects
        ) {
          res.resume();
          const nextUrl = new URL(location, parsedUrl).toString();
          request(nextUrl, options, redirectCount + 1)
            .then(resolve)
            .catch(reject);
          return;
        }

        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
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
            reject(new StockRequestError(`Request failed with status ${status}`));
            return;
          }

          resolve(response);
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(
        new StockRequestError(`Request timed out after ${options.timeout}ms`)
      );
    });
    req.on("error", reject);
  });
}

const requestClient = {
  get(url: string) {
    return new RequestBuilder(url);
  },
};

export default requestClient;
