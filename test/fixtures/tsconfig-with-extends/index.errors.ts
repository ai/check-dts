declare const a: number | null

// THROWS Type 'number | null' is not assignable to type 'number'.
export const b: number = a

// This file checks whether the compiler performs strictNullChecks if it is enabled in the config file specified via extends
