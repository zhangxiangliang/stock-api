# @semantic-release/npm

[**semantic-release**](https://github.com/semantic-release/semantic-release) plugin to publish a [npm](https://www.npmjs.com) package.

[![Build Status](https://github.com/semantic-release/npm/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/semantic-release/npm/actions/workflows/test.yml?query=branch%3Amaster)
[![npm latest version](https://img.shields.io/npm/v/@semantic-release/npm/latest.svg)](https://www.npmjs.com/package/@semantic-release/npm)
[![npm next version](https://img.shields.io/npm/v/@semantic-release/npm/next.svg)](https://www.npmjs.com/package/@semantic-release/npm)
[![npm beta version](https://img.shields.io/npm/v/@semantic-release/npm/beta.svg)](https://www.npmjs.com/package/@semantic-release/npm)

| Step               | Description                                                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `verifyConditions` | Verify the presence of the `NPM_TOKEN` environment variable, or an `.npmrc` file, and verify the authentication method is valid. |
| `prepare`          | Update the `package.json` version and [create](https://docs.npmjs.com/cli/pack) the npm package tarball.                         |
| `addChannel`       | [Add a release to a dist-tag](https://docs.npmjs.com/cli/dist-tag).                                                              |
| `publish`          | [Publish the npm package](https://docs.npmjs.com/cli/publish) to the registry.                                                   |

## Install

> [!TIP]
> You do not need to directly depend on this package if you are using `semantic-release`.
> `semantic-release` already depends on this package, and defining your own direct dependency can result in conflicts when you update `semantic-release`.

```bash
$ npm install @semantic-release/npm -D
```

## Usage

The plugin can be configured in the [**semantic-release** configuration file](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration):

```json
{
  "plugins": ["@semantic-release/commit-analyzer", "@semantic-release/release-notes-generator", "@semantic-release/npm"]
}
```

## Configuration

### npm registry authentication

### Official Registry

When publishing to the [official registry](https://registry.npmjs.org/), it is recommended to publish with authentication intended for automation:

- For improved security, and since access tokens have recently had their [maximum lifetimes restricted](https://github.blog/changelog/2025-09-29-strengthening-npm-security-important-changes-to-authentication-and-token-management/),
  [trusted publishing](https://docs.npmjs.com/trusted-publishers) is recommended when publishing from a [supported CI provider](https://docs.npmjs.com/trusted-publishers#supported-cicd-providers)
- [Granular access tokens](https://docs.npmjs.com/creating-and-viewing-access-tokens#creating-granular-access-tokens-on-the-website) are recommended when publishing from a CI provider that is not supported by npm for trusted publishing, and can be set via [environment variables](#environment-variables).
  Because these access tokens expire, rotation will need to be accounted for in this scenario.

> [!NOTE]
> When using trusted publishing, provenance attestations are automatically generated for your packages without requiring provenance to be explicitly enabled.

#### Trusted publishing from GitHub Actions

To leverage trusted publishing and publish with provenance from GitHub Actions, the `id-token: write` permission is required to be enabled on the job:

```yaml
permissions:
  id-token: write # to enable use of OIDC for trusted publishing and npm provenance
```

It's also worth noting that if you are using semantic-release to its fullest with a GitHub release, GitHub comments,
and other features, then [more permissions are required](https://github.com/semantic-release/github#github-authentication) to be enabled on this job:

```yaml
permissions:
  contents: write # to be able to publish a GitHub release
  issues: write # to be able to comment on released issues
  pull-requests: write # to be able to comment on released pull requests
  id-token: write # to enable use of OIDC for trusted publishing and npm provenance
```

Refer to the [GitHub Actions recipe for npm package provenance](https://semantic-release.gitbook.io/semantic-release/recipes/ci-configurations/github-actions#.github-workflows-release.yml-configuration-for-node-projects) for the full CI job's YAML code example.

#### Trusted publishing for GitLab Pipelines

To leverage trusted publishing and publish with provenance from GitLab Pipelines, `NPM_ID_TOKEN` needs to be added as an entry under `id_tokens` in the job definition with an audience of `npm:registry.npmjs.org`:

```yaml
id_tokens:
  NPM_ID_TOKEN:
    aud: "npm:registry.npmjs.org"
```

See the [npm documentation for more details about configuring pipeline details](https://docs.npmjs.com/trusted-publishers#gitlab-cicd-configuration)

#### Unsupported CI providers

Token authentication is **required** and can be set via [environment variables](#environment-variables).
[Granular access tokens](https://docs.npmjs.com/creating-and-viewing-access-tokens#creating-granular-access-tokens-on-the-website) are recommended in this scenario, since trusted publishing is not available from all CI providers.
Because these access tokens expire, rotation will need to be accounted for in your process.

### Alternative Registries

Token authentication is **required** and can be set via [environment variables](#environment-variables).
See the documentation for your registry for details on how to create a token for automation.

### Environment variables

| Variable    | Description                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `NPM_TOKEN` | Npm token created via [npm token create](https://docs.npmjs.com/getting-started/working_with_tokens#how-to-create-new-tokens) |

### Options

| Options      | Description                                                                                                        | Default                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `npmPublish` | Whether to publish the `npm` package to the registry. If `false` the `package.json` version will still be updated. | `false` if the `package.json` [private](https://docs.npmjs.com/files/package.json#private) property is `true`, `true` otherwise. |
| `pkgRoot`    | Directory path to publish.                                                                                         | `.`                                                                                                                              |
| `tarballDir` | Directory path in which to write the package tarball. If `false` the tarball is not be kept on the file system.    | `false`                                                                                                                          |

**Note**: The `pkgRoot` directory must contain a `package.json`. The version will be updated only in the `package.json` and `npm-shrinkwrap.json` within the `pkgRoot` directory.

**Note**: If you use a [shareable configuration](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/shareable-configurations.md#shareable-configurations) that defines one of these options you can set it to `false` in your [**semantic-release** configuration](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration) in order to use the default value.

### npm configuration

The plugin uses the [`npm` CLI](https://github.com/npm/cli) which will read the configuration from [`.npmrc`](https://docs.npmjs.com/files/npmrc). See [`npm config`](https://docs.npmjs.com/misc/config) for the option list.

The [`registry`](https://docs.npmjs.com/misc/registry) can be configured via the npm environment variable `NPM_CONFIG_REGISTRY` and will take precedence over the configuration in `.npmrc`.

The [`registry`](https://docs.npmjs.com/misc/registry), [`dist-tag`](https://docs.npmjs.com/cli/dist-tag), and [`provenance`](https://docs.npmjs.com/generating-provenance-statements#using-third-party-package-publishing-tools) can be configured under `publishConfig` in the `package.json`:

```json
{
  "publishConfig": {
    "registry": "https://registry.npmjs.org/",
    "tag": "latest",
    "provenance": true
  }
}
```

**Notes**:

- The presence of an `.npmrc` file will override any specified environment variables.
- The presence of `registry` or `dist-tag` under `publishConfig` in the `package.json` will take precedence over the configuration in `.npmrc` and `NPM_CONFIG_REGISTRY`

### Examples

The `npmPublish` and `tarballDir` option can be used to skip the publishing to the `npm` registry and instead, release the package tarball with another plugin. For example with the [@semantic-release/github](https://github.com/semantic-release/github) plugin:

```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/npm",
      {
        "npmPublish": false,
        "tarballDir": "dist"
      }
    ],
    [
      "@semantic-release/github",
      {
        "assets": "dist/*.tgz"
      }
    ]
  ]
}
```

When publishing from a sub-directory with the `pkgRoot` option, the `package.json` and `npm-shrinkwrap.json` updated with the new version can be moved to another directory with a `postversion`. For example with the [@semantic-release/git](https://github.com/semantic-release/git) plugin:

```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/npm",
      {
        "pkgRoot": "dist"
      }
    ],
    [
      "@semantic-release/git",
      {
        "assets": ["package.json", "npm-shrinkwrap.json"]
      }
    ]
  ]
}
```

```json
{
  "scripts": {
    "postversion": "cp -r package.json .. && cp -r npm-shrinkwrap.json .."
  }
}
```
