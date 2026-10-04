import type { RetryPlugin, RetryState } from "./types.js";
import type { EndpointDefaults, OctokitResponse } from "@octokit/types";
type RequestHook = (options: Required<EndpointDefaults>) => OctokitResponse<any, number> | Promise<OctokitResponse<any, number>>;
export declare function wrapRequest(state: RetryState, octokit: RetryPlugin, request: RequestHook, options: Required<EndpointDefaults>): Promise<OctokitResponse<any, number>>;
export {};
