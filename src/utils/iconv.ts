import { TextDecoder } from "node:util";

function normalizeEncoding(encoding: string): string {
  return encoding.toLowerCase() === "gbk" ? "gb18030" : encoding;
}

const iconv = {
  decode(body: Buffer, encoding: string): string {
    return new TextDecoder(normalizeEncoding(encoding)).decode(body);
  },
};

export default iconv;
