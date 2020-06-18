let kleur = require('kleur')

let pkg = require('./package.json')

module.exports = function showVersion (print) {
  print(`check-dts ${kleur.bold(pkg.version)}`)
}
