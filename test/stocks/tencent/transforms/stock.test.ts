// Stock
const TencentStockTransform = require("stocks/tencent/transforms/stock").default;

describe("【腾讯】股票数据转换测试", () => {
  const code = 'SH510500';
  const body = `v_sh510500="1~500ETF~510500~7.224~7.149~7.147~2724781~1351032~1373749~7.224~63~7.223~329~7.222~370~7.221~286~7.220~143~7.225~3893~7.226~884~7.227~323~7.228~5728~7.229~190~~20200731154041~0.075~1.05~7.280~7.085~7.224/2724781/1964297124~2724781~196430~~~~7.280~7.085~2.73~~~0.00~7.864~6.434~1.20~-9827~7.209~~~~~~196429.7124~0.0000~0~ ~ETF~26.51~~~~";`

  const rows = body.split(";\n");
  const row = rows[0];

  const [_, paramsUnformat] = row.split('=');
  const params = paramsUnformat.replace('"', '').split("~");

  it("获取股票代码", async () => {
    expect(new TencentStockTransform(code, params).getCode())
      .toBe('SH510500');
  });

  it("获取股票名称", async () => {
    expect(new TencentStockTransform(code, params).getName())
      .toBe('500ETF');
  });

  it("获取股票现价", async () => {
    expect(new TencentStockTransform(code, params).getNow())
      .toBe(7.224);
  });

  it("获取股票最低价", async () => {
    expect(new TencentStockTransform(code, params).getLow())
      .toBe(7.085);
  });

  it("获取股票最高价", async () => {
    expect(new TencentStockTransform(code, params).getHigh())
      .toBe(7.28);
  });

  it("获取股票昨日收盘价", async () => {
    expect(new TencentStockTransform(code, params).getYesterday())
      .toBe(7.149);
  });

  it("获取股票涨跌", async () => {
    expect(new TencentStockTransform(code, params).getPercent())
      .toBe(7.224 / 7.149 - 1);
  });

  it("获取股票数据", async () => {
    expect(new TencentStockTransform(code, params).getStock())
      .toStrictEqual({ "code": "SH510500", "high": 7.28, "low": 7.085, "name": "500ETF", "now": 7.224, "percent": 7.224 / 7.149 - 1, "yesterday": 7.149 });
  });
});

