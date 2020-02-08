let chalk = require('chalk')

let pkg = require('./package.json')

module.exports = async function showVersion () {
  process.stdout.write(`check-dts ${ chalk.bold(pkg.version) }\n`)
}
