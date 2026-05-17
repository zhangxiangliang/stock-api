type HeaderValue = string | string[] | undefined;
export interface Response {
    body: Buffer;
    headers: Record<string, HeaderValue>;
    status: number;
    text: string;
}
declare class RequestBuilder implements PromiseLike<Response> {
    private readonly url;
    private options;
    constructor(url: string);
    set(name: string, value: string): this;
    responseType(_type: string): this;
    then<TResult1 = Response, TResult2 = never>(onfulfilled?: ((value: Response) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null): PromiseLike<TResult1 | TResult2>;
    private send;
}
declare const requestClient: {
    get(url: string): RequestBuilder;
};
export default requestClient;
