import { StockRequestError } from "../errors";

type BrowserNode = {
  appendChild(node: BrowserScriptElement): unknown;
  removeChild?(node: BrowserScriptElement): unknown;
};

type BrowserScriptElement = {
  async: boolean;
  charset: string;
  onerror: (() => void) | null;
  onload: (() => void) | null;
  parentNode?: BrowserNode | null;
  src: string;
};

type BrowserDocument = {
  body?: BrowserNode;
  createElement(tagName: string): BrowserScriptElement;
  documentElement?: BrowserNode;
  head?: BrowserNode;
};

type BrowserRuntime = typeof globalThis & {
  document?: BrowserDocument;
  [key: string]: unknown;
};

export function isBrowserRuntime(): boolean {
  return Boolean((globalThis as BrowserRuntime).document);
}

export async function loadBrowserScript(options: {
  charset?: string;
  timeout?: number;
  url: string;
}): Promise<void> {
  const runtime = globalThis as BrowserRuntime;
  const document = runtime.document;
  const parent = document?.head || document?.body || document?.documentElement;

  if (!document || !parent) {
    throw new StockRequestError("Browser document is not available");
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    const timeout = options.timeout || 15000;
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new StockRequestError(`Script request timed out after ${timeout}ms`));
    }, timeout);

    function cleanup(): void {
      clearTimeout(timeoutId);
      script.onload = null;
      script.onerror = null;
      script.parentNode?.removeChild?.(script);
    }

    script.async = true;
    script.charset = options.charset || "utf-8";
    script.onload = () => {
      cleanup();
      resolve();
    };
    script.onerror = () => {
      cleanup();
      reject(new StockRequestError("Script request failed"));
    };
    script.src = options.url;

    parent.appendChild(script);
  });
}

export async function loadBrowserScriptValue(options: {
  charset?: string;
  timeout?: number;
  url: string;
  variableName: string;
}): Promise<string> {
  const runtime = globalThis as BrowserRuntime;

  await loadBrowserScript(options);

  const value = runtime[options.variableName];
  delete runtime[options.variableName];

  return typeof value === "string" ? value : "";
}

export async function loadBrowserJsonp<T>(options: {
  callbackParam?: string;
  charset?: string;
  timeout?: number;
  url: string;
}): Promise<T> {
  const runtime = globalThis as BrowserRuntime;
  const callbackParam = options.callbackParam || "callback";
  const callbackName = `stockApiJsonp${Date.now()}${Math.floor(
    Math.random() * 100000
  )}`;
  let result: T | undefined;

  runtime[callbackName] = (value: T) => {
    result = value;
  };

  try {
    const url = appendQueryParam(options.url, callbackParam, callbackName);

    await loadBrowserScript({
      charset: options.charset,
      timeout: options.timeout,
      url,
    });
  } finally {
    delete runtime[callbackName];
  }

  if (result === undefined) {
    throw new StockRequestError("JSONP response did not invoke callback");
  }

  return result;
}

function appendQueryParam(url: string, name: string, value: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${encodeURIComponent(name)}=${encodeURIComponent(
    value
  )}`;
}
