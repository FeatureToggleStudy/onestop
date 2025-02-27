# OneStop Browser Client

## Getting started
This guide focuses on running the OneStop browser client via `Node` for local development. To run the search API (used by the client) and other components, refer to the more expansive [Developer Guide](/docs/developer).

1. Clone this repo
1. `cd client`
1. Run `npm install`
    - installs dependencies into `./node_modules`
1. Run one of the following:
  - `npm run dev` (search API on port 8097)
  - `npm run kub` (search API on port 30097)
  - Starts up `webpack-dev-server` hosting a hot-reload version of the client
  - Starts mocha in watch mode to automatically run the tests as you work
1. Go to http://localhost:9090/onestop/

## Format JavaScript+CSS with Prettier

Prettier is a code formatter . We actually use `prettier-miscellaneous` which is a fork allowing for more configuration. In particular, the `breakBeforeElse` option specified in our `.prettierrc.json` is [not supported](https://github.com/prettier/prettier/issues/840) by the default `prettier` package.

Formatting is a manual process, but our CI builds will warn when a commit is not formatted.

Ideally, these should be done before every commit by the developer.

### Dry-run with `--list-different`
`npm run formatCheck`

### Overwrite files with fixed formatting
`npm run format`
