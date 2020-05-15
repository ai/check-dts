let chalk = require('chalk')

let pkg = require('./package.json')

module.exports = function showVersion (print) {
  print(`check-dts ${chalk.bold(pkg.version)}`)
}
