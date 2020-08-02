// Stock
const XueqiuStockTransform = require("stocks/xueqiu/transforms/stock").default;

describe("【雪球】股票数据转换测试", () => {
  const code = 'SH510500';
  const body = `{"data":{"market":{"status_id":8,"region":"CN","status":"休市","time_zone":"Asia/Shanghai","time_zone_desc":null},"quote":{"symbol":"SH510500","code":"510500","avg_price":6.982,"delayed":0,"type":13,"percent":0.5,"tick_size":0.001,"float_shares":null,"amplitude":null,"current":7.224,"high":7.28,"current_year_percent":22.38,"float_market_capital":null,"issue_date":1363276800000,"low": 7.085,"sub_type":"EBS","market_capital":4.25501735904E10,"currency":"CNY","lot_size":100,"lock_set":null,"timestamp":1595207715950,"amount":null,"chg":0.035,"last_close":7.149,"volume":null,"turnover_rate":null,"name":"中证500ETF","exchange":"SH","time":1595207715000,"total_shares":6094267200,"open":null,"status":1},"others":{"pankou_ratio":null,"cyb_switch":false},"tags":[{"description":"融","value":6},{"description":"空","value":7}]},"error_code":0,"error_description":""}`

  const params = JSON.parse(body).data.quote;

  it("获取股票代码", async () => {
    expect(new XueqiuStockTransform(code, params).getCode())
      .toBe('SH510500');
  });

  it("获取股票名称", async () => {
    expect(new XueqiuStockTransform(code, params).getName())
      .toBe('中证500ETF');
  });

  it("获取股票现价", async () => {
    expect(new XueqiuStockTransform(code, params).getNow())
      .toBe(7.224);
  });

  it("获取股票最低价", async () => {
    expect(new XueqiuStockTransform(code, params).getLow())
      .toBe(7.085);
  });

  it("获取股票最高价", async () => {
    expect(new XueqiuStockTransform(code, params).getHigh())
      .toBe(7.28);
  });

  it("获取股票昨日收盘价", async () => {
    expect(new XueqiuStockTransform(code, params).getYesterday())
      .toBe(7.149);
  });

  it("获取股票涨跌", async () => {
    expect(new XueqiuStockTransform(code, params).getPercent())
      .toBe(7.224 / 7.149 - 1);
  });

  it("获取股票数据", async () => {
    expect(new XueqiuStockTransform(code, params).getStock())
      .toStrictEqual({ "code": "SH510500", "high": 7.28, "low": 7.085, "name": "中证500ETF", "now": 7.224, "percent": 7.224 / 7.149 - 1, "yesterday": 7.149 });
  });
});

