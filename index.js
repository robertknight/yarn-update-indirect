#!/usr/bin/env node

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

import { program } from 'commander';
import { load, dump } from "js-yaml";

/**
 * Extract the package name from a yarn.lock package resolution specification.
 *
 * Resolution specifiers look like:
 *
 * ```
 * string-width@npm:^5.0.1, string-width@npm:^5.1.2
 * ```
 *
 * From this specifier, this function will return the unique package names,
 * in this case `["string-width"]`.
 */
function packageNamesFromSpec(spec) {
  const entries = spec.split(",");
  const names = entries.map((entry) => {
    const [nameRegistry, versionSpec] = entry
      .split(":")
      .map((entry) => entry.trim());
    const [name, registry] = nameRegistry.split(/(?<!^)@/);
    return name;
  });
  names.sort();

  const uniqueNames = [...new Set(names)];
  return uniqueNames;
}

/**
 * Edit the `yarn.lock` file in `path` to remove resolutions for specific
 * packages.
 *
 * Once resolutions have been removed, they can be recreated by running
 * `yarn install`.
 *
 * @param {string} path
 * @param {string[]} excludePackages
 */
function filterLockfile(path, excludePackages) {
  const lockfileYaml = readFileSync(path, "utf8");
  const lockfile = load(lockfileYaml);

  for (const [key, val] of Object.entries(lockfile)) {
    // Skip `__metadata` key
    if (key.startsWith("__")) {
      continue;
    }

    const packageNames = packageNamesFromSpec(key);
    if (packageNames.some((name) => excludePackages.includes(name))) {
      delete lockfile[key];
    }
  }

  const updatedLockfile = dump(lockfile, {
    lineWidth: -1, // Unlimited line width
    quotingType: '"',
  });
  writeFileSync(path, updatedLockfile);
}

program
  .name('yarn-update-indirect')
  .description('Update indirect dependencies in Yarn projects')
  .version('1.0.0')
  .argument('<packages>', 'Packages to update');
program.parse();

const packages = program.args;

filterLockfile("yarn.lock", packages);
execSync("yarn install", {
  stdio: "inherit",
});
