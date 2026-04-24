export class StockApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class StockRequestError extends StockApiError {}

export class StockCodeError extends StockApiError {}

export class StockParseError extends StockApiError {}
