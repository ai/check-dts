import { showHelp } from '../show-help.js'

function createStdout() {
  let result = { out: '' }
  result.print = (...lines) => {
    result.out += lines.join('\n') + '\n'
  }
  return result
}

it('prints version', () => {
  let stdout = createStdout()
  showHelp(stdout.print)
  expect(stdout.out).toMatchSnapshot()
})
