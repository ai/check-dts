process.env.FORCE_COLOR = 1

let { join } = require('path')

let check = require('../check')

async function run(fixture, args) {
  let stdout = { out: '' }
  stdout.write = symbols => {
    stdout.out += symbols
  }
  stdout.print = (...lines) => {
    stdout.write(lines.join('\n') + '\n')
  }
  let cwd = join(__dirname, 'fixtures', fixture)
  let exitCode = await check(stdout, cwd, stdout.print, args)
  return [exitCode, stdout.out]
}

async function good(fixture, args) {
  let [exitCode, out] = await run(fixture, args)
  expect(exitCode).toBe(true)
  return out
}

async function bad(fixture, args) {
  let [exitCode, out] = await run(fixture, args)
  expect(exitCode).toBe(false)
  return out
}

jest.setTimeout(20000)

it('supports simple cases', async () => {
  expect(await good('simple')).toMatchSnapshot()
})

it('checks positive tests', async () => {
  expect(await bad('positive')).toMatchSnapshot()
})

it('checks negative tests', async () => {
  expect(await bad('negative')).toMatchSnapshot()
})

it('checks both tests', async () => {
  expect(await bad('both')).toMatchSnapshot()
})

it('checks mixed tests', async () => {
  expect(await good('mixed')).toMatchSnapshot()
})

it('loads custom tsconfig.json', async () => {
  expect(await good('tsconfig')).toMatchSnapshot()
})

it('accepts files', async () => {
  expect(await good('negative', 'b.*')).toMatchSnapshot()
})

it('warns about empty project', async () => {
  let error
  try {
    await bad('empty')
  } catch (e) {
    error = e
  }
  expect(error.message).toContain('TypeScript files were not found')
  expect(error.own).toBe(true)
})
