import { execa } from "execa";
import normalizeUrl from "normalize-url";
import AggregateError from "aggregate-error";
import getRegistry from "./get-registry.js";
import setNpmrcAuth from "./set-npmrc-auth.js";
import getError from "./get-error.js";
import oidcContextEstablished from "./trusted-publishing/oidc-context.js";
import { OFFICIAL_REGISTRY } from "./definitions/constants.js";
import path from "path";

function registryIsDefault(registry, DEFAULT_NPM_REGISTRY) {
  return normalizeUrl(registry) === normalizeUrl(DEFAULT_NPM_REGISTRY);
}

async function verifyAuthContextAgainstRegistry(npmrc, registry, context) {
  const {
    cwd,
    env: { DEFAULT_NPM_REGISTRY = OFFICIAL_REGISTRY, ...env },
    stdout,
    stderr,
  } = context;

  try {
    const whoamiResult = execa("npm", ["whoami", "--userconfig", npmrc, "--registry", registry], {
      cwd,
      env,
      preferLocal: true,
    });

    whoamiResult.stdout.pipe(stdout, { end: false });
    whoamiResult.stderr.pipe(stderr, { end: false });

    await whoamiResult;
  } catch {
    throw new AggregateError([getError("EINVALIDNPMTOKEN", { registry })]);
  }
}

async function attemptPublishDryRun(npmrc, registry, context, pkgRoot) {
  const {
    cwd,
    env: { DEFAULT_NPM_REGISTRY = OFFICIAL_REGISTRY, ...env },
    stdout,
    stderr,
  } = context;
  const basePath = pkgRoot ? path.resolve(cwd, pkgRoot) : cwd;

  const publishDryRunResult = execa(
    "npm",
    [
      "publish",
      basePath,
      "--dry-run",
      "--tag=semantic-release-auth-check",
      "--userconfig",
      npmrc,
      "--registry",
      registry,
    ],
    { cwd, env, preferLocal: true, lines: true }
  );

  publishDryRunResult.stdout.pipe(stdout, { end: false });
  publishDryRunResult.stderr.pipe(stderr, { end: false });

  (await publishDryRunResult).stderr.forEach((line) => {
    if (line.includes("This command requires you to be logged in to ")) {
      throw new AggregateError([getError("EINVALIDNPMAUTH", { registry })]);
    }
  });
}

async function verifyTokenAuth(registry, npmrc, context, pkgRoot) {
  const {
    env: { DEFAULT_NPM_REGISTRY = OFFICIAL_REGISTRY },
  } = context;

  if (registryIsDefault(registry, DEFAULT_NPM_REGISTRY)) {
    await verifyAuthContextAgainstRegistry(npmrc, registry, context);
  }
}

export default async function (npmrc, pkg, { pkgRoot }, context) {
  const registry = getRegistry(pkg, context);

  if (await oidcContextEstablished(registry, pkg, context)) {
    return;
  }

  await setNpmrcAuth(npmrc, registry, context);

  await verifyTokenAuth(registry, npmrc, context, pkgRoot);
}
