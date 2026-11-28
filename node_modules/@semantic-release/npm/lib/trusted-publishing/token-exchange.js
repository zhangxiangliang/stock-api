import { getIDToken } from "@actions/core";
import envCi from "env-ci";

import {
  OFFICIAL_REGISTRY,
  GITHUB_ACTIONS_PROVIDER_NAME,
  GITLAB_PIPELINES_PROVIDER_NAME,
} from "../definitions/constants.js";

async function exchangeIdToken(idToken, packageName, logger) {
  const response = await fetch(
    `${OFFICIAL_REGISTRY}-/npm/v1/oidc/token/exchange/package/${encodeURIComponent(packageName)}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}` },
    }
  );
  const responseBody = await response.json();

  if (response.ok) {
    logger.log("OIDC token exchange with the npm registry succeeded");

    return responseBody.token;
  }

  logger.log(`OIDC token exchange with the npm registry failed: ${response.status} ${responseBody.message}`);

  return undefined;
}

async function exchangeGithubActionsToken(packageName, logger) {
  let idToken;

  logger.log("Verifying OIDC context for publishing from GitHub Actions");

  try {
    idToken = await getIDToken("npm:registry.npmjs.org");
  } catch (e) {
    logger.log(`Retrieval of GitHub Actions OIDC token failed: ${e.message}`);
    logger.log("Have you granted the `id-token: write` permission to this workflow?");

    return undefined;
  }

  return exchangeIdToken(idToken, packageName, logger);
}

async function exchangeGitlabPipelinesToken(packageName, logger) {
  const idToken = process.env.NPM_ID_TOKEN;

  logger.log("Verifying OIDC context for publishing from GitLab Pipelines");

  if (!idToken) {
    return undefined;
  }

  return exchangeIdToken(idToken, packageName, logger);
}

export default function exchangeToken(pkg, { logger }) {
  const { name: ciProviderName } = envCi();

  if (GITHUB_ACTIONS_PROVIDER_NAME === ciProviderName) {
    return exchangeGithubActionsToken(pkg.name, logger);
  }

  if (GITLAB_PIPELINES_PROVIDER_NAME === ciProviderName) {
    return exchangeGitlabPipelinesToken(pkg.name, logger);
  }

  return undefined;
}
