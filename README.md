# Check TypeScript Definitions

Check `.d.ts` files in open source library according to types tests.

It will be useful for JavaScript projects, which want to provide good typing
support for TypeScript and IDE/VS Code users.

```ts
// test/index.types.ts
import lib = require('../')

interface Events {
  'set': (a: string, b: number) => void
}
lib.on<Events>('set', 'prop', 1)

// test/index.errors.ts
import lib = require('../')

interface Events {
  'set': (a: string, b: number) => void,
  'add': (c: number) => void
}
// THROWS Expected 3 arguments, but got 2
lib.on<Events>('set', 2)
```

<a href="https://evilmartians.com/?utm_source=check-dts">
  <img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg"
       alt="Sponsored by Evil Martians" width="236" height="54">
</a>
