/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  projects: ['<rootDir>/projects/ui', '<rootDir>/projects/webcomponent'],
  reporters: ['default', 'jest-junit'],
}
