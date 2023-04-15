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
   [Nano Events](https://github.com/ai/nanoevents/blob/main/index.d.ts).
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

✖ test/index.errors.ts:7:23: Wrong error
  Expected: Expected 0 arguments, but got 1
  Got: Expected 3 arguments, but got 2.
```


## CLI Options

Test all `.ts` and `.js` files in project and run `*.types.ts` and `*.errors.ts`
tests:

```bashsh
npx check-dts
```

You can test only specific files by:

```sh
npx check-dts **/*.tsx?
npx check-dts **/*.ts !**/index.ts
```


## FAQ

### It seems that check-dts ignores all d.ts-files. How can I fix this?

Please make sure that your tsconfig.json doesn’t include `skipLibCheck: true`.
Becuase with this [option](https://www.typescriptlang.org/tsconfig#skipLibCheck)
all `d.ts`-files will be ignored.


### Can I use check-dts as a simple validator for d.ts-files?

Yes you can. But note if you have the typescript in your project
you can validate whether `d.ts`-files have some issues with the following command:

```sh
npx tsc path/to/your/dts/files/**/*.d.ts --noEmit
```


### I am getting an error **from Node types**, how do I skip `node_modules`?

If you are getting an error that looks something like this:

```
✖ node_modules/@types/node/globals.d.ts:68:13: Type error TS2502
  'AbortController' is referenced directly or indirectly in its own type annotation.
```

You can skip the whole `node_modules` by adding to `tsconfig.json`:


```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```
