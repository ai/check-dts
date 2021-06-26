process.env.FORCE_COLOR = 1

let showVersion = require('../show-version')

function createStdout() {
  let result = { out: '' }
  result.print = (...lines) => {
    result.out += lines.join('\n') + '\n'
  }
  return result
}

it('prints version', () => {
  let stdout = createStdout()
  showVersion(stdout.print)
  expect(stdout.out.replace(/\d+\.\d+\.\d+/, '0.0.0')).toMatchSnapshot()
})
