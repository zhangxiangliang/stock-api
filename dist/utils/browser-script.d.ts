export declare function isBrowserRuntime(): boolean;
export declare function loadBrowserScript(options: {
    charset?: string;
    timeout?: number;
    url: string;
}): Promise<void>;
export declare function loadBrowserScriptValue(options: {
    charset?: string;
    timeout?: number;
    url: string;
    variableName: string;
}): Promise<string>;
export declare function loadBrowserJsonp<T>(options: {
    callbackParam?: string;
    charset?: string;
    timeout?: number;
    url: string;
}): Promise<T>;
