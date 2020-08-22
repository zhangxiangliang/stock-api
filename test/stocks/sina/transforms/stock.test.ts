// Stock
const SinaStockTransform = require("stocks/sina/transforms/stock").default;

describe("【新浪】股票数据转换测试", () => {
  // 上交所相关代码
  const SHCode = 'SH510500';
  const SHBody = `var hq_str_sh510500="500ETF,7.147,7.149,7.224,7.280,7.085,7.224,7.225,272478144,1964297124.000,6300,7.224,32900,7.223,37000,7.222,28600,7.221,14300,7.220,389300,7.225,88400,7.226,32300,7.227,572800,7.228,19000,7.229,2020-07-31,15:00:00,00,";`
  const SHRow = SHBody.split(";\n")[0];
  const SHParams = SHRow.split('=').reverse()[0].replace('"', '').split(",");

  // 深交所
  const SZCode = 'SZ399001';
  const SZBody = `var hq_str_sz399001="深证成指,13464.207,13466.854,13637.883,13748.034,13399.859,0.000,0.000,48559923962,650202505377.656,0,0.000,0,0.000,0,0.000,0,0.000,0,0.000,0,0.000,0,0.000,0,0.000,0,0.000,0,0.000,2020-07-31,15:00:03,00";`;
  const SZRow = SZBody.split(";\n")[0];
  const SZParams = SZRow.split('=').reverse()[0].replace('"', '').split(",");

  // 港交所
  const HKCode = 'HKHSI';
  const HKBody = `var hq_str_hkHSI="Hang Seng Index,恒生指数,24747.29,24710.59,24938.85,24534.79,24595.35,-115.24,-0.47,0.000,0.000,119153830,0,0.000,0.00,29174.92,21139.26,2020/07/31,16:08";`;
  const HKRow = HKBody.split(";\n")[0];
  const HKParams = HKRow.split('=').reverse()[0].replace('"', '').split(",");

  // 美交所
  const USCode = 'USDJI';
  const USBody = `var hq_str_gb_dji="道琼斯,26428.3203,0.44,2020-08-01 05:07:40,114.6700,26409.3301,26440.0195,26013.5898,29568.5703,18213.6504,491372564,397524206,0,0.00,--,0.00,0.00,0.00,0.00,0,0,0.0000,0.00,0.0000,,Jul 31 05:07PM EDT,26313.6504,0,1,2020";`;
  const USRow = USBody.split(";\n")[0];
  const USParams = USRow.split('=').reverse()[0].replace('"', '').split(",");

  it("获取股票代码", async () => {
    expect(new SinaStockTransform(SHCode, SHParams).getCode()).toBe("SH510500");
    expect(new SinaStockTransform(SZCode, SZParams).getCode()).toBe("SZ399001");
    expect(new SinaStockTransform(HKCode, HKParams).getCode()).toBe("HKHSI");
    expect(new SinaStockTransform(USCode, USParams).getCode()).toBe("USDJI");
    expect(new SinaStockTransform("000000", []).getCode()).toBe("000000");
  });

  it("获取股票名称", async () => {
    expect(new SinaStockTransform(SHCode, SHParams).getName()).toBe('500ETF');
    expect(new SinaStockTransform(SZCode, SZParams).getName()).toBe('深证成指');
    expect(new SinaStockTransform(HKCode, HKParams).getName()).toBe('恒生指数');
    expect(new SinaStockTransform(USCode, USParams).getName()).toBe("道琼斯");
  });

  it("获取股票现价", async () => {
    expect(new SinaStockTransform(SHCode, SHParams).getNow()).toBe(7.224);
    expect(new SinaStockTransform(SZCode, SZParams).getNow()).toBe(13637.883);
    expect(new SinaStockTransform(HKCode, HKParams).getNow()).toBe(24595.35);
    expect(new SinaStockTransform(USCode, USParams).getNow()).toBe(26428.3203);
  });

  it("获取股票最低价", async () => {
    expect(new SinaStockTransform(SHCode, SHParams).getLow()).toBe(7.085);
    expect(new SinaStockTransform(SZCode, SZParams).getLow()).toBe(13399.859);
    expect(new SinaStockTransform(HKCode, HKParams).getLow()).toBe(24534.79);
    expect(new SinaStockTransform(USCode, USParams).getLow()).toBe(26013.5898);
  });

  it("获取股票最高价", async () => {
    expect(new SinaStockTransform(SHCode, SHParams).getHigh()).toBe(7.28);
    expect(new SinaStockTransform(SZCode, SZParams).getHigh()).toBe(13748.034);
    expect(new SinaStockTransform(HKCode, HKParams).getHigh()).toBe(24938.85);
    expect(new SinaStockTransform(USCode, USParams).getHigh()).toBe(26440.0195);
  });

  it("获取股票昨日收盘价", async () => {
    expect(new SinaStockTransform(SHCode, SHParams).getYesterday()).toBe(7.149);
    expect(new SinaStockTransform(SZCode, SZParams).getYesterday()).toBe(13466.854);
    expect(new SinaStockTransform(HKCode, HKParams).getYesterday()).toBe(24710.59);
    expect(new SinaStockTransform(USCode, USParams).getYesterday()).toBe(26313.6504);
  });

  it("获取股票涨跌", async () => {
    expect(new SinaStockTransform(SHCode, SHParams).getPercent()).toBe(7.224 / 7.149 - 1);
    expect(new SinaStockTransform(SZCode, SZParams).getPercent()).toBe(13637.883 / 13466.854 - 1);
    expect(new SinaStockTransform(HKCode, HKParams).getPercent()).toBe(24595.35 / 24710.59 - 1);
    expect(new SinaStockTransform(USCode, USParams).getPercent()).toBe(26428.3203 / 26313.6504 - 1);
  });

  it("获取股票数据", async () => {
    expect(new SinaStockTransform(SHCode, SHParams).getStock()).toStrictEqual({ code: "SH510500", name: "500ETF", percent: 7.224 / 7.149 - 1, now: 7.224, low: 7.085, high: 7.28, yesterday: 7.149 });
    expect(new SinaStockTransform(SZCode, SZParams).getStock()).toStrictEqual({ code: 'SZ399001', name: '深证成指', percent: 13637.883 / 13466.854 - 1, now: 13637.883, low: 13399.859, high: 13748.034, yesterday: 13466.854 });
    expect(new SinaStockTransform(HKCode, HKParams).getStock()).toStrictEqual({ code: 'HKHSI', name: '恒生指数', percent: 24595.35 / 24710.59 - 1, now: 24595.35, low: 24534.79, high: 24938.85, yesterday: 24710.59 });
    expect(new SinaStockTransform(USCode, USParams).getStock()).toStrictEqual({ code: 'USDJI', name: '道琼斯', percent: 26428.3203 / 26313.6504 - 1, now: 26428.3203, low: 26013.5898, high: 26440.0195, yesterday: 26313.6504 });
  });
});

