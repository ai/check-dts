# Check TypeScript Definitions

Unit tests for `.d.ts` TypeScript definitions in your JavaScript
open source library.

It is useful for non-TypeScript project, which wants to provide typing
support for TypeScript users and autocompletion for IDE and text editors.

It becomes especially useful for complex types with generics, like we have
in [Nano Events] or [Storeon].

```ts
// Negative test: test/index.errors.ts
import lib = require('../')

interface Events {
  'set': (a: string, b: number) => void
}
// THROWS Expected 3 arguments, but got 2
lib.on<Events>('set', 2)
```

```ts
// Positive test: test/index.types.ts
import lib = require('../')

interface Events {
  'set': (a: string, b: number) => void
}
lib.on<Events>('set', 'prop', 1)
```

[Nano Events]: https://github.com/ai/nanoevents/#typescript
[Storeon]: https://github.com/storeon/storeon#typescript

<img src="./screenshot.png" alt="Print Snapshots example" width="585">

<a href="https://evilmartians.com/?utm_source=check-dts">
  <img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg"
      alt="Sponsored by Evil Martians" width="236" height="54">
</a>

## Usage

1. Add `.d.ts` files with TypeScript definitions for your JS library.
   You can check example in
   [Nano Events](https://github.com/ai/nanoevents/blob/master/index.d.ts).
2. Install `check-dts`:

   ```sh
   npm install --save-dev check-dts
   ```

3. Create `test/index.types.ts` for positive tests and write correct TypeScript.
   You can test IDE autocompletion in this file.
4. Run `npx check-dts` to test the new file.
5. Create `test/index.errors.ts` for negative tests and add an incorrect usage
   of your library recording to TypeScript. See the next section for details.
6. Run `npx check-dts` to test both files.
7. Add `check-dts` to `npm test` to test types on CI:

   ```diff
     "scripts": {
   -   "test": "jest && eslint ."
   +   "test": "jest && eslint . && check-dts"
     }
   ```

8. If your library requires an additional TypeScript option, you can define it
   for tests in `tsconfig.json`.


## Writing Negative Test

Add code where you expect TypeScript to report an error. Make sure to add a
line above the expected error like `// THROWS some error messages`

```ts
import lib = require('../')

interface Events {
  set: (a: string, b: number) => void
}
lib.on<Events>('set', 2)
```

In this case, we expect the error message `Expected 3 arguments, but got 2`.
So we should add comments. You can put only part of the error message
to the `// THROWS comment`.

```diff
  import lib = require('../')

  interface Events {
    set: (a: string, b: number) => void
  }
+ // THROWS Expected 3 arguments, but got 2
  lib.on<Events>('set', 2)
```

If TypeScript does not report the error or reports a different error,
`check-dts` will fall with a description:

```bash
$ npx check-dts
✖ Check types
✖ test/index.errors.ts

  errors.ts:7:23: Wrong error
  Expected: Expected 0 arguments, but got 1
  Got: Expected 3 arguments, but got 2.
```
