let { join } = require('path')

let check = require('../check')

jest.mock('worker_threads', () => {
  throw new Error('no workers')
})

async function run (fixture) {
  let stdout = { out: '' }
  stdout.write = symbols => {
    stdout.out += symbols
  }
  stdout.print = (...lines) => {
    stdout.write(lines.join('\n') + '\n')
  }
  let cwd = join(__dirname, 'fixtures', fixture)
  let exitCode = await check(stdout, cwd, stdout.print)
  return [exitCode, stdout.out]
}

async function good (fixture) {
  let [exitCode, out] = await run(fixture)
  expect(exitCode).toBe(true)
  return out
}

jest.setTimeout(20000)

it('works without web workers', async () => {
  expect(await good('simple')).toMatchSnapshot()
})
