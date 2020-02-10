import b = require('../b')

interface Events {
  'set': (a: string, b: number) => void,
  'add': (c: number) => void,
  'tick': () => void
}

let typed = b<Events>()

// THROWS not assignable to parameter of type '"add" | "set" | "tick"'
typed.emit('unknown')
// THROWS Wrong
typed.emit('set', 1)
// THROWS Missed
typed.emit('tick')

typed.emit('tick', 1)

typed.events = {
  // THROWS not assignable to type '((c: number) => void)[]
  'add': [
    (a: string) => a
  ]
}
