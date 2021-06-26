let { bold } = require('colorette')

let pkg = require('./package.json')

module.exports = function showVersion(print) {
  print(`check-dts ${bold(pkg.version)}`)
}
