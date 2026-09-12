import { OFFICIAL_REGISTRY } from "../definitions/constants.js";
import exchangeToken from "./token-exchange.js";

export default async function oidcContextEstablished(registry, pkg, context) {
  return OFFICIAL_REGISTRY === registry && !!(await exchangeToken(pkg, context));
}
