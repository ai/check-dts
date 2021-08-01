import b from './b.js'

function sealed(target: any) {
  target.seal = 'seal' + b
}

export function all(p1: Promise<void>, p2: Promise<void>) {
  return Promise.allSettled([p1, p2])
}

@sealed
class A {}

export default A
