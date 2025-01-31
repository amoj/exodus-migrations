const crypto = require('crypto')
const fs = require('./utils/fs')
const path = require('path')
const { getConfig } = require('./config')
const { listDirectoryFiles } = require('./utils/fs')

exports.getSampleMigration = async () => {
  return fs.readFile(path.resolve(__dirname, './templates/migration.js'), 'utf8')
}

exports.getPendingJobs = async () => {
  const config = await getConfig()
  const context = await config.context()
  const state = await config.fetchState(context)
  const alreadyRanFiles = state.history.map(({ filename }) => filename)

  // create an ID for our round so we can undo latest batch later
  const roundId = crypto.randomBytes(20).toString('hex')

  // figure out which directory to look for migrations
  // in and find all files in the directory
  const files = await listDirectoryFiles(config.migrationsDirectory)

  const pendingMigrations = files
    .filter((filename) => {
      return !alreadyRanFiles.includes(filename)
    })
    .sort()
    .map((filename) => ({
      roundId,
      filename,
      path: path.join(config.migrationsDirectory, filename),
    }))

  return pendingMigrations
}

exports.up = async (migrationJob) => {
  const config = await getConfig()
  const context = await config.context()
  const state = await config.fetchState(context)

  // beforeEach()
  migrationJob.startedAt = (new Date()).toJSON()
  await config.beforeEach(migrationJob)

  // Run the migration.
  const migrationModule = require(migrationJob.path)
  await migrationModule.up(context)

  // afterEach()
  migrationJob.finishedAt = (new Date()).toJSON()
  await config.afterEach(migrationJob)

  state.history.push(migrationJob)

  return state
}
