// Stock
const SinaStockTransform = require("stocks/sina/transforms/stock").default;

describe("【新浪】股票数据转换测试", () => {
  const code = 'SH510500';
  const body = `var hq_str_sh510500="500ETF,7.147,7.149,7.224,7.280,7.085,7.224,7.225,272478144,1964297124.000,6300,7.224,32900,7.223,37000,7.222,28600,7.221,14300,7.220,389300,7.225,88400,7.226,32300,7.227,572800,7.228,19000,7.229,2020-07-31,15:00:00,00,";`

  const rows = body.split(";\n");
  const row = rows[0];

  const [_, paramsUnformat] = row.split('=');
  const params = paramsUnformat.replace('"', '').split(",");

  it("获取股票代码", async () => {
    expect(new SinaStockTransform(code, params).getCode())
      .toBe('SH510500');
  });

  it("获取股票名称", async () => {
    expect(new SinaStockTransform(code, params).getName())
      .toBe('500ETF');
  });

  it("获取股票现价", async () => {
    expect(new SinaStockTransform(code, params).getNow())
      .toBe(7.224);
  });

  it("获取股票最低价", async () => {
    expect(new SinaStockTransform(code, params).getLow())
      .toBe(7.085);
  });

  it("获取股票最高价", async () => {
    expect(new SinaStockTransform(code, params).getHigh())
      .toBe(7.28);
  });

  it("获取股票昨日收盘价", async () => {
    expect(new SinaStockTransform(code, params).getYesterday())
      .toBe(7.149);
  });

  it("获取股票涨跌", async () => {
    expect(new SinaStockTransform(code, params).getPercent())
      .toBe(7.224 / 7.149 - 1);
  });

  it("获取股票数据", async () => {
    expect(new SinaStockTransform(code, params).getStock())
      .toStrictEqual({ "code": "SH510500", "high": 7.28, "low": 7.085, "name": "500ETF", "now": 7.224, "percent": 7.224 / 7.149 - 1, "yesterday": 7.149 });
  });
});

