import { type RetryPlugin, type RetryState } from "./types.js";
import type { RequestRequestOptions } from "@octokit/types";
import type { RequestError } from "@octokit/request-error";
export declare function isRequestError(error: any): error is RequestError;
export declare function errorRequest(state: RetryState, octokit: RetryPlugin, error: RequestError | Error, options: {
    request: RequestRequestOptions;
}): Promise<any>;
