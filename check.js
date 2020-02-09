let { dirname, basename, join } = require('path')
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

function formatName (fileName) {
  return chalk.gray(
    fileName.replace(basename(fileName), i => chalk.white.bold(i))
  )
}

function push (list, file, message) {
  if (!list[file]) list[file] = []
  list[file].push(message)
}

function print (message) {
  process.stdout.write(message + '\n')
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

module.exports = async function check () {
  let okSpinner = ora('Scanning for files').start()
  let ignore = { ignore: ['node_modules'], gitignore: true }
  let [all, ok, fail] = await Promise.all([
    globby('**/*.{js,ts,jsx,tsx}', ignore),
    globby('test/**/{*.,}types.{ts,tsx}', ignore),
    globby('test/**/{*.,}errors.{ts,tsx}', ignore)
  ])
  let files = all.filter(i => !ok.includes(i) && !fail.includes(i))

  files.push(join(TS_DIR, 'lib.dom.d.ts'))
  files.push(join(TS_DIR, 'lib.es2018.d.ts'))

  okSpinner.text = 'Project types and positive tests'
  let errors = await checkFiles(files.concat(ok))
  if (errors.length > 0) {
    let inTest = errors.every(i => i.file.fileName.endsWith('types.ts'))
    okSpinner.fail(inTest ? 'Possitive tests failed' : 'Types failed')
    for (let i of errors) {
      let { line, col } = lineColumn(i.file.text).fromIndex(i.start)
      print(
        chalk.red(i.file.fileName) + ':' +
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
    print(chalk.green('✔ ') + formatName(i))
  }

  let failSpinner = ora('Parsing THROWS statements').start()
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
        '  ' + r.bold(line + ':' + col + ':') + ' Unexpected error\n' +
        '  ' + r(text(i))
      )
    } else {
      expect.used = true
      if (!text(i).includes(expect.pattern)) {
        push(
          bad,
          i.file.fileName,
          '  ' + r.bold(line + ':' + col + ':') + ' Wrong error\n' +
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
      '  ' + r.bold(i.line + ':' + i.col + ':') + ' Error was not found\n' +
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
      print(r('✖ ') + formatName(file))
    } else if (!failed) {
      print(g('✔ ') + formatName(file))
    }
    for (let i of bad[file] || []) {
      print(i)
    }
  }
  return !failed
}
