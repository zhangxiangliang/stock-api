export declare class StockApiError extends Error {
    constructor(message: string);
}
export declare class StockRequestError extends StockApiError {
}
export declare class StockCodeError extends StockApiError {
}
export declare class StockParseError extends StockApiError {
}
