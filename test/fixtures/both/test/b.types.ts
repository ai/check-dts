import b = require('../b')

interface Events {
  'set': (a: string, b: number) => void,
  'add': (c: number) => void,
  'tick': () => void
}

function fn (a: string) {
  console.log(a)
}

let ee = b<Events>()
ee.on('set', a => {
  fn(a)
})

ee.emit('set', 'a', 1)
ee.emit('add', 2)
ee.emit('tick')

ee.events = {
  'set': [
    a => {
      fn(a)
    }
  ]
}
