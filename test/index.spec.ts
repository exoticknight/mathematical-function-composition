import test from 'tape'

import { FunctionComposition as fc } from '../src'

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

test('should compose functions', t => {
  const s = new fc('s')
  s.add([
    add1,
    double
  ])

  // @ts-ignore
  t.equal(s.$.double.add1.$(3), 8)

  t.end()
})

test('should compose curry function', t => {
  const s = new fc('s')
  s.add([
    multiply,
    linear
  ])

  // @ts-ignore
  // 3 * (2 * 4) + 5
  t.equal(s.$.linear(3)(5).multiply(4).$(2), 29)

  t.end()
})

test('should be called with alias', t => {
  const s = new fc('s')

  s.add([
    multiply,
    [add, 'fadd']
  ])

  // @ts-ignore
  // 3 * (2 * 4) + 5
  t.equal(s.$.fadd(3).multiply(4).$(2), 11)

  t.end()
})

test('should throw no function error', t => {
  const s = new fc('s')

  s.add([
    add,
  ])


  try {
    // @ts-ignore
    s.$.multiply(2).$(1)
  } catch (error) {
    t.equal(error.message, 'no multiply in s')
  }

  t.end()
})

test('should not effect another composition', t => {
  const s = new fc('s')

  s.add([
    add,
    multiply,
    add1,
    double
  ])

  // @ts-ignore
  s.$.add1.multiply(2).$(10)

  // @ts-ignore
  t.equal(s.$.add(3).double.$(2), 7)

  t.end()
})

test('should be cached', t => {
  const s = new fc('s')

  s.add([
    add,
    multiply,
    add1,
    double
  ])

  // @ts-ignore
  const cached = s.$.add1.add(2)
  t.equal(cached.double.multiply(4).$(3), 27)

  t.end()
})

test('should throw exhausted context', t => {
  const s = new fc('s')

  s.add([
    add,
    multiply,
    add1,
    double
  ])

  // @ts-ignore
  const cached = s.$.add1.add(2)
  cached.$(1)
  try {
    // @ts-ignore
    cached.$()
  } catch (error) {
    t.equal(error.message, 'exhausted context')
  }

  t.end()
})

test('should not cached in another composition', t => {
  const s = new fc('s')

  s.add([
    add,
    multiply,
    add1,
    double
  ])

  // @ts-ignore
  const cached = s.$.add1.add(2)
  // @ts-ignore
  t.equal(s.$.double.multiply(4).$(3), 24)

  t.end()
})

test('should not be found after removing', t => {
  const s = new fc('s')

  s.add([
    add,
    multiply,
    add1,
    double
  ])

  s.remove('add')

  try {
    // @ts-ignore
    s.$.add.$(1)
  } catch (error) {
    t.equal(error.message, 'no add in s')
  }

  t.end()
})

test('should not be found after clearing', t => {
  const s = new fc('s')

  s.add([
    add,
  ])

  s.clear()

  try {
    // @ts-ignore
    s.$.add.$(1)
  } catch (error) {
    t.equal(error.message, 'no add in s')
  }

  t.end()
})

test('should support curry function', t => {
  const s = new fc('s')

  s.add([
    [() => x => add(1, x), 'curryAdd'],
    [(a, b) => x => a * x + b, 'curryLinear'],
    add1,
    linear,
  ])

  t.equal(s.$.curryAdd().$(1), 2)
  t.equal(s.$.add1(1).$(), 2)
  t.equal(s.$. linear(3)(2) .$(1), 5)
  t.equal(s.$. curryLinear(3)(2)() .$(1), 5)

  t.end()
})