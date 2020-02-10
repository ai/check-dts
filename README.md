# Check TypeScript Definitions

Unit tests for `.d.ts` TypeScript definitions in your JavaScript
open source library.

It is useful for non-TypeScript project, which want to provide good typing
support for TypeScript users and good autocompletion for IDE and text editors.

It became especially useful if you have complex types with generics, like
we have in [Storeon](https://github.com/storeon/storeon#typescript).

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
