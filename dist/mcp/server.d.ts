import { Readable, Writable } from "node:stream";
type JsonRpcId = number | string | null;
type JsonRpcRequest = {
    jsonrpc: "2.0";
    id?: JsonRpcId;
    method: string;
    params?: unknown;
};
type JsonRpcResponse = {
    jsonrpc: "2.0";
    id: JsonRpcId;
    result?: unknown;
    error?: {
        code: number;
        message: string;
        data?: unknown;
    };
};
export declare function runMcpServer(input?: Readable, output?: Writable): Promise<void>;
export declare function handleMcpRequest(request: JsonRpcRequest): Promise<JsonRpcResponse | undefined>;
export {};
