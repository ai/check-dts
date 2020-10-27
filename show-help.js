let { yellow: y, bold: b } = require('colorette')

module.exports = function showHelp (print) {
  print(
    b('Usage: ') + 'npx check-dts [file1 file2...]',
    'Check `.d.ts` files in open source library according to types tests',
    '',
    b('Arguments:'),
    '  ' +
      y('file#') +
      '       Optional a list of files/globs (otherwise matches all js/ts files)',
    '  ' + y('--version') + '   Show version',
    '  ' + y('--help') + '      Show this message'
  )
}
