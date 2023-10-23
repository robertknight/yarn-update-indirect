# yarn-update-indirect

Tool to update indirect dependencies in [Yarn](https://yarnpkg.com) lockfiles.
_Indirect_ means that the dependency is not directly referenced in
a project's package.json, but is a transitive dependency of a package that is.

This tool is a workaround for the lack of an easy built-in way to update
indirect dependencies in `yarn.lock` files. See [this
issue](https://github.com/yarnpkg/yarn/issues/4986). 

The tool works in two steps:

 1. Edit the project's `yarn.lock` file to remove existing resolutions
    for a package.
 2. Re-run `yarn install` to refresh the lockfile and add resolutions for
    the current versions.

## Usage

As an example, suppose your project has indirect dependencies on "foo" and "bar"
and you want to update them to the latest compatible versions, you would run:

```
npm install yarn-update-indirect
yarn-update-indirect foo bar
```

This will update the "yarn.lock" file in the current working directory.
