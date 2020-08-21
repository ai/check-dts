import a = require('.')

// THROWS type 'string' is not assignable to parameter of type 'number'.
a('abc', '1')
