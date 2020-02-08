let chalk = require('chalk')

function print (...lines) {
  process.stdout.write(lines.join('\n') + '\n')
}

let y = chalk.yellow
let b = chalk.bold

module.exports = function showHelp () {
  print(
    b('Usage: ') + 'npx check-dts',
    '',
    b('Arguments:'),
    '  ' + y('--version') + '   Show version',
    '  ' + y('--help') + '   Show this message'
  )
}
