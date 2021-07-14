function sealed (target: any) {
  target.seal = 'seal'
}

function all(p1: Promise<void>, p2: Promise<void>) {
  return Promise.allSettled([p1, p2])
}

@sealed
class A {

}

export default A
