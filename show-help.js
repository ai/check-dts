import pico from 'picocolors'

let b = pico.bold
let y = pico.yellow

export function showHelp(print) {
  print(
    b('Usage: ') + 'npx check-dts [FILES]',
    'Check `.d.ts` files in open source library according to types tests',
    '',
    b('Arguments:'),
    '  ' + y('[FILES]') + '    Optional a list of files/globs',
    '  ' + y('--version') + '  Show version',
    '  ' + y('--help') + '     Show this message'
  )
}
