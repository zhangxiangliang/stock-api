import path from "path";
import rc from "rc";
import getRegistryUrl from "registry-auth-token/registry-url.js";
import { OFFICIAL_REGISTRY } from "./definitions/constants.js";

export default function ({ publishConfig: { registry } = {}, name }, { cwd, env }) {
  return (
    registry ||
    env.NPM_CONFIG_REGISTRY ||
    getRegistryUrl(
      name.split("/")[0],
      rc("npm", { registry: OFFICIAL_REGISTRY }, { config: env.NPM_CONFIG_USERCONFIG || path.resolve(cwd, ".npmrc") })
    )
  );
}
