// Types for the Tysp language that aren't already defined in default library
type LispSymbol = string;
type Atom = string | number;
type List = any[]
type Exp = Atom | List;
type Env = Map<any, any>;

function isLispList(x: any): boolean {
    return Array.isArray(x);
}

function isLispSymbol(x: any): boolean {
    return typeof x === "string";
}

function isNum(x: any): boolean {
    return typeof x === "number";
}

function tokenize(chars: string): List {
    // Convert a string of characters into list of tokens
    return chars
        .replace(/[(]/g, " ( ")
        .replace(/[)]/g, " ) ")
        .split(' ')
        .filter(x => x !== '');
}

function parse(program: string): Exp {
    return readFromTokens(tokenize(program));
}

function readFromTokens(tokens: string[]): Exp {
    if (tokens.length == 0) {
        throw new Error('Unexpected EOF');
    }
    // Length of tokens will never be 0, hence token will never be undefined
    // @ts-ignore
    let token: string = tokens.shift(); // Shift "pops" off the first element in list

    if (token == "(") {
        let L: string[] = [];
        while (tokens[0] != ")") {
            // Length of tokens will never be 0, hence token will never be undefined
            // @ts-ignore
            L.push(readFromTokens(tokens));
        }
        tokens.shift(); // Pop off ')'
        return L;
    } else if (token == ")") {
        throw new Error('Unexpected )');
    }
    return atom(token);
}

function atom(token: string): Atom {
    if (/^\d+$/.test(token)) {
        return Number.parseInt(token);
    } else if (/^\d+\.\d+$/.test(token)) {
        return Number.parseFloat(token);
    } 
    return token;
}

function standardEnv(): Env {
    let globalEnv = new Map<string, any>([
        ["+", (x: number, y: number) => x + y],
        ["-", (x: number, y: number) => x - y],
        ["*", (x: number, y: number) => x * y],
        ["/", (x: number, y: number) => x / y],
        [">", (x: any, y: any) => x > y],
        ["<", (x: any, y: any) => x < y],
        [">=", (x: any, y: any) => x >= y],
        ["<=", (x: any, y: any) => x <= y],
        ["=", (x: any, y: any) => x === y],
        ["abs", (x: number) => Math.abs(x)],
        ["append", (x: any[], y: any[]) => [...x, ...y]],
        ["apply", (x: any, f: any) => f(...x)],
        ["begin", (...x: any[]) => x[x.length - 1]],
        ["car", (...x: any[]) => x[0]],
        ["cdr", (...x: any[]) => x.slice(1)],
        ["cons", (x: any, y: any) => [x, y]],
        ["eq?", (x: any, y: any) => Object.is(x, y)],
        ["expt", (x: number, y: number) => Math.pow(x, y)],
        ["equal?", (x: any, y: any) => x === y],
        ["length", (x: any[]) => x.length],
        ["list", (...x: any[]) => x],
        ["list?", (...x: any[]) => isLispList(x)],
        ["not", (...x: any) => !!!x],
        ["null", (...x: any[]) =>  x === undefined || x === null],
        ["symbol?", (...x: any) => isLispSymbol(x)],
        // TODO: Implement other methods
        // ["map", (...x: any[]) => Array.isArray(x)],
        // ["max", (...x: any[]) => Array.isArray(x)],
        // ["min", (...x: any[]) => Array.isArray(x)],
        // ["number", (...x: any[]) => Array.isArray(x)],
        // ["print", (...x: any[]) => Array.isArray(x)],
        // ["procedure", (...x: any[]) => Array.isArray(x)],
        // ["round", (...x: any[]) => Array.isArray(x)],
    ]);
    return globalEnv;
}

const globalEnv: Env = standardEnv();

function evaluate(x: any, env = globalEnv): any {
    if (isLispSymbol(x)) {
      return env.get(x);
    } else if (isNum(x)) {
      return x;
    } else if (x[0] === "if") {
      const [_, test, conseq, alt, ..._rest] = x;
      const exp: any = evaluate(test, env) ? conseq : alt;
      return evaluate(exp, env);
    } else if (x[0] === "define") {
      const [_, symbol, exp, ..._rest] = x;
      env.set(symbol, evaluate(exp, env) as any);
    } else {
      const proc: any = evaluate(x[0], env);
      const args: any[] = x
        .slice(1)
        .map((element: any) => evaluate(element, env));
      return proc(...args);
    }
}

function repl(prpmpt = "tysp> ") {
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", (chunk) => {
      if (!/\S/.test(toString(chunk))) {
        return process.stdout.write(prpmpt);
      }
      const val = evaluate(parse(toString(chunk)));
      return process.stdout.write(schemestr(val));
    });
}

function schemestr(exp: any): string {
    if (isLispList(exp)) {
        return `( ${exp.map((e: any) => schemestr(e)).join("")})`;
    } else {
        return toString(exp);
    }
}

function toString(x: any) {
    return `${x}`;
};

// Start the REPL
repl();