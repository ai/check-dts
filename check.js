let { dirname, basename, join, relative } = require('path')
let { promisify } = require('util')
let { Worker } = require('worker_threads')
let lineColumn = require('line-column')
let globby = require('globby')
let chalk = require('chalk')
let ora = require('ora')
let fs = require('fs')

let readFile = promisify(fs.readFile)

const TS_DIR = dirname(require.resolve('typescript'))
const WORKER = join(__dirname, 'worker.js')
const PREFIX = '// THROWS '

let r = chalk.red
let b = chalk.bold
let g = chalk.green

function checkFiles (files) {
  return new Promise((resolve, reject) => {
    let worker = new Worker(WORKER, { workerData: files })
    worker.on('message', resolve)
    worker.on('error', reject)
  })
}

function text (error) {
  if (typeof error.messageText === 'object') {
    return error.messageText.messageText
  } else {
    return error.messageText
  }
}

function formatName (cwd, file) {
  return chalk.gray(
    relative(cwd, file).replace(basename(file), i => chalk.white.bold(i))
  )
}

function push (list, file, message) {
  if (!list[file]) list[file] = []
  list[file].push(message)
}

async function parseTest (files) {
  let expects = []
  await Promise.all(
    files.map(async fileName => {
      let source = (await readFile(fileName)).toString()
      let prev, pos
      let lines = lineColumn(source)
      while (true) {
        pos = source.indexOf(PREFIX, prev + 1)
        if (pos === -1) break
        let newline = source.indexOf('\n', pos)
        let pattern = source.slice(pos + PREFIX.length, newline)
        let { line, col } = lines.fromIndex(pos)
        expects.push({ fileName, line: line + 1, col, pattern })
        prev = pos
      }
    })
  )
  return expects
}

module.exports = async function check (stdout, cwd, print) {
  let okSpinner = ora({ stream: stdout }).start('Scanning for files')
  let opts = { cwd, ignore: ['node_modules'], gitignore: true, absolute: true }
  let [all, ok, fail] = await Promise.all([
    globby('**/*.{js,ts,jsx,tsx}', opts),
    globby('test/**/{*.,}types.{ts,tsx}', opts),
    globby('test/**/{*.,}errors.{ts,tsx}', opts)
  ])

  if (!all.some(i => /\.tsx?$/.test(i))) {
    let err = new Error(
      'TypeScript files was not found. ' +
      'Create .d.ts files and test/types.ts and test/errors.ts.'
    )
    err.own = true
    throw err
  }

  let files = all.filter(i => !ok.includes(i) && !fail.includes(i))

  files.push(join(TS_DIR, 'lib.dom.d.ts'))
  files.push(join(TS_DIR, 'lib.es2018.d.ts'))

  okSpinner.text = 'Project types and positive tests'
  let errors = await checkFiles(files.concat(ok))
  if (errors.length > 0) {
    okSpinner.fail('Types failed')
    for (let i of errors) {
      let { line, col } = lineColumn(i.file.text).fromIndex(i.start)
      print(
        chalk.red(relative(cwd, i.file.fileName)) + ':' +
        chalk.yellow(line) + ':' +
        chalk.yellow(col) + ' ' +
        chalk.gray(`TS${ i.code }`) + ' ' +
        text(i)
      )
    }
    return false
  }

  okSpinner.succeed()
  for (let i of ok) {
    print(chalk.green('✔ ') + formatName(cwd, i))
  }

  let failSpinner = ora({ stream: stdout }).start('Parsing THROWS statements')
  let expects = await parseTest(fail)

  failSpinner.text = 'Negative tests'
  let found = await checkFiles(files.concat(fail))
  let bad = { }
  for (let i of found) {
    let { line, col } = lineColumn(i.file.text).fromIndex(i.start)
    let expect = expects.find(j => {
      return i.file.fileName === j.fileName && line === j.line && !j.used
    })
    if (!expect) {
      push(
        bad,
        i.file.fileName,
        '  ' + b(r(line + ':' + col + ':') + ' Unexpected error\n') +
        '  ' + r(text(i))
      )
    } else {
      expect.used = true
      if (!text(i).includes(expect.pattern)) {
        push(
          bad,
          i.file.fileName,
          '  ' + b(r(line + ':' + col + ':') + ' Wrong error\n') +
          '  Expected: ' + g(expect.pattern) + '\n' +
          '  Got: ' + r(text(i))
        )
      }
    }
  }
  let unused = expects.filter(i => !i.used)
  for (let i of unused) {
    push(
      bad,
      i.fileName,
      '  ' + b(r(i.line + ':' + i.col + ':') + ' Error was not found\n') +
      '  ' + r(i.pattern)
    )
  }

  let failed = Object.keys(bad).length > 0
  if (failed) {
    failSpinner.fail()
  } else {
    failSpinner.succeed()
  }
  for (let file of fail) {
    if (bad[file]) {
      print(r('✖ ') + formatName(cwd, file) + '\n')
    } else if (!failed) {
      print(g('✔ ') + formatName(cwd, file))
    }
    let messages = (bad[file] || []).sort((msg1, msg2) => {
      let line1 = parseInt(msg1.match(/(\d+):/)[1])
      let line2 = parseInt(msg2.match(/(\d+):/)[1])
      return line1 - line2
    })
    for (let i of messages) {
      print(i + '\n')
    }
  }
  return !failed
}
