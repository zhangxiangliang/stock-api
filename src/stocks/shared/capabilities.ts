import { StockRequestError } from "../../errors";
import { isBrowserRuntime } from "../../utils/browser-script";
import { StockSource } from "../../types/utils/stock";

export type StockProviderFeature = "kline" | "quote" | "search";
export type StockProviderRuntime = "browser" | "node";
export type StockProviderSupport = {
  supported: boolean;
  note?: string;
};

export type StockProviderCapability = {
  browser: Record<StockProviderFeature, StockProviderSupport>;
  node: Record<StockProviderFeature, StockProviderSupport>;
  source: Exclude<StockSource, "base">;
};

const supported: StockProviderSupport = { supported: true };
const sinaBrowserUnsupported: StockProviderSupport = {
  supported: false,
  note:
    "Sina requires a valid Referer that browser JavaScript cannot set. Use stocks.auto, Node.js, or a backend proxy.",
};

const capabilities: Record<
  Exclude<StockSource, "base">,
  StockProviderCapability
> = {
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

export function getProviderCapabilities(): StockProviderCapability[] {
  return Object.values(capabilities).map((capability) => ({
    browser: cloneRuntimeCapability(capability.browser),
    node: cloneRuntimeCapability(capability.node),
    source: capability.source,
  }));
}

export function assertProviderFeatureSupported(
  source: Exclude<StockSource, "base">,
  feature: StockProviderFeature
): void {
  const runtime: StockProviderRuntime = isBrowserRuntime() ? "browser" : "node";
  const support = capabilities[source][runtime][feature];

  if (!support.supported) {
    throw new StockRequestError(
      `${source} ${feature} is not available in ${runtime}. ${support.note || ""}`.trim()
    );
  }
}

function cloneRuntimeCapability(
  capability: Record<StockProviderFeature, StockProviderSupport>
): Record<StockProviderFeature, StockProviderSupport> {
  return {
    kline: { ...capability.kline },
    quote: { ...capability.quote },
    search: { ...capability.search },
  };
}
