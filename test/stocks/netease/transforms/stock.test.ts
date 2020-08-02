// Stock
const NeteaseStockTransform = require("stocks/netease/transforms/stock").default;

describe("【网易】股票数据转换测试", () => {
  const code = 'SH510500';
  const body = `topstock({"0510500":{"code": "0510500", "precloseiopv": 7.152, "percent": 0.010491, "high": 7.28, "askvol3": 32300, "askvol2": 88400, "askvol5": 19000, "askvol4": 572800, "iopv": 7.226, "price": 7.224, "open": 7.147, "bid5": 7.22, "bid4": 7.221, "bid3": 7.222, "bid2": 7.223, "bid1": 7.224, "low": 7.085, "updown": 0.075, "type": "SH", "symbol": "510500", "status": 0, "ask4": 7.228, "bidvol3": 37000, "bidvol2": 32900, "bidvol1": 6300, "update": "2020/07/31 15:59:59", "bidvol5": 14300, "bidvol4": 28600, "yestclose": 7.149, "askvol1": 389300, "ask5": 7.229, "volume": 272478144, "ask1": 7.225, "name": "500ETF", "ask3": 7.227, "ask2": 7.226, "arrow": "\u2191", "time": "2020/07/31 15:59:58", "turnover": 1964297124} });`;
  const items = JSON.parse(body.replace(/\(|\)|;|(topstock)/g, ''));
  const params = items['0510500'];

  it("获取股票代码", async () => {
    expect(new NeteaseStockTransform(code, params).getCode())
      .toBe('SH510500');
  });

  it("获取股票名称", async () => {
    expect(new NeteaseStockTransform(code, params).getName())
      .toBe('500ETF');
  });

  it("获取股票现价", async () => {
    expect(new NeteaseStockTransform(code, params).getNow())
      .toBe(7.224);
  });

  it("获取股票最低价", async () => {
    expect(new NeteaseStockTransform(code, params).getLow())
      .toBe(7.085);
  });

  it("获取股票最高价", async () => {
    expect(new NeteaseStockTransform(code, params).getHigh())
      .toBe(7.28);
  });

  it("获取股票昨日收盘价", async () => {
    expect(new NeteaseStockTransform(code, params).getYesterday())
      .toBe(7.149);
  });

  it("获取股票涨跌", async () => {
    expect(new NeteaseStockTransform(code, params).getPercent())
      .toBe(7.224 / 7.149 - 1);
  });

  it("获取股票数据", async () => {
    expect(new NeteaseStockTransform(code, params).getStock())
      .toStrictEqual({ "code": "SH510500", "high": 7.28, "low": 7.085, "name": "500ETF", "now": 7.224, "percent": 7.224 / 7.149 - 1, "yesterday": 7.149 });
  });
});

