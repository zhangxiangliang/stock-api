import type { Octokit, OctokitOptions } from "@octokit/core";
import type { RetryOptions, RetryPlugin } from "./types.js";
export { VERSION } from "./version.js";
export declare function retry(octokit: Octokit, octokitOptions: OctokitOptions): RetryPlugin;
export declare namespace retry {
    var VERSION: string;
}
declare module "@octokit/core/types" {
    interface OctokitOptions {
        retry?: RetryOptions;
    }
}
export type { RetryPlugin, RetryOptions };
