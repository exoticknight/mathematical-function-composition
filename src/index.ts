interface State {
  funcName:string
  args:any[][]
}

function dummy() {}

function createProxy(space:FunctionComposition, functions:{[k:string]:Function}) {
  let stateStack:State[] = []
  let proxy = new Proxy(dummy, {
    get(_, prop) {
      if (!stateStack) throw new Error('exhausted context')

      const propStr = prop.toString()

      if (propStr === '$') {
        return (...initArgs) => {
          const [ret] = stateStack.reduceRight((prevFuncRet:any[], {funcName, args}) => {
            args.push(prevFuncRet)

            // make sure ending with a call
            if (prevFuncRet.length) args.push([])

            const [funcRet] = args.reduce(([func, prevRet], arg) => {
              if (arg.length) {
                // push arguments
                return [func, prevRet.concat(arg)]
              } else {
                // call function, result is in index 0
                return [func.apply(null, prevRet), []]
              }
            }, [functions[funcName], []])

            return funcRet === undefined ? [] : [funcRet]
          }, initArgs)

          stateStack = null
          return ret
        }
      }

      if (functions.hasOwnProperty(propStr)) {
        stateStack.push({
          funcName: propStr,
          args: []
        })
        return proxy
      } else {
        stateStack = null
        throw new Error(`no ${propStr} in ${space.name}`)
      }
    },

    apply(_, __, args) {
      stateStack[stateStack.length-1].args.push(args)
      return proxy
    }
  })

  return proxy
}

export class FunctionComposition {
  name:string
  $:{[key:string]:Function}

  private functions:{[k:string]:Function}

  constructor(name:string) {
    this.name = name
    const functions = this.functions = {}

    return new Proxy(this, {
      get(target, prop) {
        if (prop.toString() === '$') {
          return createProxy(target, functions)
        }
        return target[prop]
      }
    })
  }

  clear() {
    Object.keys(this.functions).forEach(p => delete this.functions[p])
  }

  remove(name:string) {
    delete this.functions[name]
  }

  add(funcs:(Function | [Function, string])[]) {
    for (let func of funcs) {
      let name, oriFunc
      if (typeof func === 'function') {
        name = func.name
        oriFunc = func
      } else {
        ;[oriFunc, name] = func
      }
      this.functions[name] = oriFunc
      oriFunc = null
    }
  }

}