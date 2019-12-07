"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createProxy(space) {
    let stateStack = [];
    let proxy = new Proxy(/* dummy function */ () => { }, {
        get(_, prop) {
            const propStr = prop.toString();
            if (propStr === '$') {
                return (...initArgs) => {
                    const ret = stateStack.reduceRight((prev, { funcName, args }) => space.functions[funcName].apply(null, args.concat(prev)), initArgs);
                    stateStack = null;
                    return ret;
                };
            }
            if (space.functions.hasOwnProperty(propStr)) {
                stateStack.push({
                    funcName: propStr,
                    args: []
                });
                return proxy;
            }
            else {
                stateStack = null;
                throw new Error(`no ${propStr} in ${space.name}`);
            }
        },
        apply(_, __, args) {
            stateStack[stateStack.length - 1].args.push(...args);
            return proxy;
        }
    });
    return proxy;
}
class FunctionComposition {
    constructor(name) {
        this.name = name;
        this.functions = {};
        return new Proxy(this, {
            get(target, prop) {
                if (prop.toString() === '$') {
                    return createProxy(target);
                }
                return target[prop];
            }
        });
    }
    clear() {
        this.functions = {};
    }
    remove(name) {
        delete this.functions[name];
    }
    add(funcs) {
        for (let func of funcs) {
            let name, oriFunc;
            if (typeof func === 'function') {
                name = func.name;
                oriFunc = func;
            }
            else {
                ;
                [oriFunc, name] = func;
            }
            this.functions[name] = oriFunc;
            oriFunc = null;
        }
    }
}
exports.FunctionComposition = FunctionComposition;
//# sourceMappingURL=index.js.map