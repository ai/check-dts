import b = require('../b')

interface Events {
  'set': (a: string, b: number) => void,
  'tick': () => void
}
let typed = b<Events>()
// THROWS Wrong
typed.emit('set', 1)
// THROWS Missed
typed.emit('tick')
typed.emit('tick', 1)

// THROWS not assignable to parameter of type '"set" | "tick"'
typed.emit('unknown')

typed.events = {
  // THROWS is not assignable to type
  'set': [
    (b: number) => b
  ]
}
