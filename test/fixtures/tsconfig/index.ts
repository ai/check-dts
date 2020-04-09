function sealed (target: any) {
  target.seal = 'SEAL'
}

@sealed
class A {

}

export default A
