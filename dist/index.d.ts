export declare class FunctionComposition {
    name: string;
    functions: {
        [k: string]: Function;
    };
    $: {
        [key: string]: Function;
    };
    constructor(name: string);
    clear(): void;
    remove(name: string): void;
    add(funcs: (Function | [Function, string])[]): void;
}
