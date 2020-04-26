# exodus-migrations

> Framework-agnostic migrations

[ ![CircleCI](https://img.shields.io/circleci/build/github/Sleavely/exodus-migrations?token=22848581bf01ecc38384dd7f568a8404e84c21d2) ](https://circleci.com/gh/Sleavely/exodus-migrations)

[Github](https://github.com/Sleavely/exodus-migrations) | [NPM](https://www.npmjs.com/package/exodus)

## Install

```
$ npm i -g github:Sleavely/exodus-migrations
```

Node 10+ is recommended.

## Usage

Exodus was largely inspired by the flexibility and user experience of [`migrat`](https://github.com/naturalatlas/migrat), and many of the configurables and templates have been forked from there. The major difference is that callbacks are a thing of the past, kicked aside in favor of async-await patterns.


### CLI

```
$ exodus --help

  Usage
    $ exodus <action>

  Possible actions
    init              Adds a config file in your project directory
    create <name>     Creates a new file in your migrations dir
    run               Runs all remaining migrations

  Options
    --help

  For more information, see:
  https://github.com/Sleavely/exodus-migrations
```


### Migrations

A migration file is simply a JS module that exposes `up()` and `down()` methods.

An example migration might look like:

```js
const { load, save } = require('../utils/db-methods')
//Apply the change
exports.up = async () => {
  const users = await load('users')
  for (let user of users) {
    user.age = user.age + 1
  }
  await save('users', users)
}

// Revert the change
exports.down = async () => {
  const users = await load('users')
  for (let user of users) {
    user.age = user.age - 1
  }
  await save('users', users)
}
```


### Configuration

The `init` command will create a configuration file in your current directory.

All properties are optional.

```js
module.exports = exports = {
  /**
   * @name migrationsDirectory
   *
   * The folder to store migration scripts in,
   * relative to your configuration file.
   */
  // migrationsDirectory: './migrations',

  /**
   * @name context
   *
   * Invoked at the beginning of a run, this method can return
   * an object with any details you want passed through to all
   * migrations, such as database connections, loggers, etc.
   *
   * @return {object}
   */
  // context: async () => { return {} },

  /**
   * @name storeState
   *
   * Called to persist current migration state. Use this to store
   * the `state` argument in Redis, to disk, your database etc.
   * If undefined, Exodus falls back to exodus.state.json
   *
   * @param state The state object to be stored.
   * @param context The object you returned in `context`
   */
  // storeState: async (state, context) => {},

  /**
   * @name fetchState
   *
   * This method is responsible for fetching the current
   * migration state, persisted by `storeState`.
   * If undefined, Exodus falls back to exodus.state.json
   *
   * @param context The object you returned in `context`
   * @return {object}
   */
  // fetchState: async (context) => {},

  /**
   * @name beforeAll
   *
   * Executed right before any of the queued migrations are run.
   *
   * @param {migrationJob[]}
   */
  // beforeAll: async (pendingMigrations) => {},

  /**
   * @name beforeEach
   *
   * Executed before each migration.
   *
   * @param {migrationJob}
   */
  // beforeEach: async (migrationJob) => {},

  /**
   * @name afterEach
   *
   * Executed after each migration.
   *
   * @param {migrationJob}
   */
  // afterEach: async (migrationJob) => {},

  /**
   * @name afterAll
   *
   * Executed after the final pending migration was run.
   *
   * @param {migrationJob[]}
   */
  // afterAll: async (pendingMigrations) => {},

}
```
