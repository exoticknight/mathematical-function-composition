# mathematical-function-composition

function composition, in the mathematical way

## Install

```bash
npm i -S mathematical-function-composition
```

## Usage

suppose that you have some functions to compose

```javascript
function add(x, y) {
  return x + y
}

function add1(x) {
  return add(x, 1)
}

function multiply(x, y) {
  return x * y
}

function double(x) {
  return multiply(2, x)
}

function linear(a, b, x) {
  return a * x + b
}
```

just add them to a 'space'

```javascript
import { FunctionComposition as fc } from 'mathematical-function-composition'

const s = new fc('s')

s.add([
  [add, 'fadd'],  // Yes! You can rename it too!
  add1,
  multiply,
  double,
  linear,
])
```

and use it beginning with `$` and ending with `$`

```javascript
// equals to add(2, add1( multiply(4, 3) ) )
s.$. add(2) . add1 . multiply(4) .$(3)  // 2 + 4 * 3 + 1 = 15

// implicitly supports curry function
s.$. linear(3)(2) .$(1)  // 3 * 1 + 2 = 5

// you must trigger a call with `()` to get a curry out
s.add([
  [(a, b) => x => a * x + b, 'curryLinear']
])
s.$. curryLinear(3)(2)() .$(1)  // 5
s.$. curryLinear(3)(2)(1) .$()  // sorry, won't work as you expected :(
```

can be cached

```javascript
const foo = s.$.add(3)

// blablabla
// you can call another composition
s.$.add1.$(1)  // 2
// blablabla

foo.add1.$(4)  // 8
foo.$()  // Error: exhausted context
```

remove and clear

```javascript
s.remove('add')

s.clear()
```

## License

MIT