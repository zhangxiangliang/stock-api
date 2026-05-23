import { StockRequestError } from "../errors";

type HeaderValue = string | string[] | undefined;

export interface Response {
  body: ArrayBuffer;
  headers: Record<string, HeaderValue>;
  status: number;
  text: string;
}

type RequestOptions = {
  headers: Record<string, string>;
  retries: number;
  timeout: number;
};

class RequestBuilder implements PromiseLike<Response> {
  private options: RequestOptions = {
    headers: {
      Accept: "*/*",
      "User-Agent": "Mozilla/5.0 (compatible; stock-api/2.0)",
    },
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

  timeout(ms: number): this {
    this.options.timeout = ms;
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

async function request(url: string, options: RequestOptions): Promise<Response> {
  if (typeof globalThis.fetch !== "function") {
    throw new StockRequestError("globalThis.fetch is not available");
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
      throw new StockRequestError(`Request failed with status ${status}`);
    }

    return result;
  } catch (error) {
    if (isAbortError(error)) {
      throw new StockRequestError(`Request timed out after ${options.timeout}ms`);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function createRequestHeaders(headers: Record<string, string>): Headers {
  const result = new Headers();

  for (const [name, value] of Object.entries(headers)) {
    if (isBrowserForbiddenHeader(name)) {
      continue;
    }

    result.set(name, value);
  }

  return result;
}

function getResponseHeaders(headers: Headers): Record<string, HeaderValue> {
  const result: Record<string, HeaderValue> = {};

  headers.forEach((value, name) => {
    result[name] = value;
  });

  return result;
}

function isBrowserForbiddenHeader(name: string): boolean {
  if (!isBrowser()) {
    return false;
  }

  return ["referer", "user-agent"].includes(name.toLowerCase());
}

function isBrowser(): boolean {
  return "window" in globalThis && "document" in globalThis;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

const requestClient = {
  get(url: string) {
    return new RequestBuilder(url);
  },
};

export default requestClient;
