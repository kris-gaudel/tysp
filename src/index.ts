type LispSymbol = string;
type LispNumber = number;
type LispAtom = LispSymbol | LispNumber;
type LispList = any[];
type LispExp = LispAtom | LispList;
type LispEnv = Map<any, any>;

function tokenize(chars: string): LispList {
    // Convert a string of characters into list of tokens
    return chars
        .replace(/[(]/g, " ( ")
        .replace(/[)]/g, " ) ")
        .split(' ')
        .filter(x => x !== "");
}

// Sanity check 1
// let program: string = "(begin (define r 10) (* pi (* r r)))"
// console.log(tokenize(program))

function parse(program: string): LispExp {
    return read_from_tokens(tokenize(program));
}

function read_from_tokens(tokens: LispList): LispExp {
    if (tokens.length == 0) {
        throw "Unexpected EOF";
    }
    let token: LispAtom | any = tokens.shift();;
    if (token == "(") {
        let L: LispExp = [];
        while (tokens[0] != ')') {
            L.push(read_from_tokens(tokens));
        }
        tokens.shift();
        return L;
    } else if (token == ")") {
        throw "Unexpected )";
    } else {
        return atom(token);
    }
}

function atom(token: string): LispAtom {
    if (/^\d+$/.test(token)) {
        return Number.parseInt(token);
    } else if (/^\d+\.\d+$/.test(token)) {
        return Number.parseFloat(token);
    } 
    return token;
}

// Sanity check 2
// let program: string = "(begin (define r 10) (* pi (* r r)))"
// console.log(parse(program))

function standard_env(): LispEnv {
    let env: LispEnv = new Map<string, any>([]);
    env.set("pi", Math.PI);
    env.set("+", (x: LispNumber, y: LispNumber): LispNumber => x + y);
    env.set("-", (x: LispNumber, y: LispNumber): LispNumber => x - y);
    env.set("*", (x: LispNumber, y: LispNumber): LispNumber => x * y);
    env.set("/", (x: LispNumber, y: LispNumber): LispNumber => x / y);
    env.set(">", (x: LispNumber, y: LispNumber): boolean => x > y);
    env.set("<", (x: LispNumber, y: LispNumber): boolean => x < y);
    env.set(">=", (x: LispNumber, y: LispNumber): boolean => x >= y);
    env.set("<=", (x: LispNumber, y: LispNumber): boolean => x <= y);
    env.set("=", (x: LispNumber, y: LispNumber): boolean => x === y);
    env.set("abs", (x: LispNumber): LispNumber => Math.abs(x));
    env.set("apply", (x: LispList, y: LispList): LispList => [...x, ...y]);
    env.set("expt", (x: LispNumber, y: LispNumber): LispNumber => Math.pow(x, y));
    env.set("begin", (...x: LispList): LispList => x[x.length - 1]);
    // TODO: Add other operations
    return env;
}

const globalEnv: LispEnv = standard_env();

function eval(input: LispExp, env: LispEnv): LispExp | any {
    if (typeof input === "number") {
        return input;
    } else if (typeof input === "string") {
        return env.get(input);
    } else if (input[0] === "if") {
        let [_, test, conseq, alt, ..._rest] = input;
        let exp: LispExp = (eval(test, env) ? conseq : alt);
        return eval(exp, env);
    } else if (input[0] === "define") {
        let [_, symbol, exp, ..._rest] = input;
        env.set(symbol, eval(exp, env));
    } else if (input[0] === "lambda") {
        let [_, params, func] = input;
        return (...args: any[]) => {
            let local_env: LispEnv = new Map<any, any>();
            for (let i = 0; i < Math.min(params.length, args.length); i++) {
                local_env.set(params[i], args[i]);
            }
            let new_env: LispEnv = new Map<any, any>([...local_env, ...env]);
            return eval(func, new_env);
        }
    } else {
        let proc: any = eval(input[0], env);
        let args: LispList = input
        .slice(1)
        .map((element: LispExp) => eval(element, env));
        return proc(...args);
    }
}

// Sanity check 3
// console.log(eval(parse("(begin (define r 10) (* pi (* r r)))")))

function repl(prpmpt = `tysp.ts>`) {
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", (chunk) => {
      if (!/\S/.test(`${chunk}`)) {
        return process.stdout.write(prpmpt);
      }
      const val = eval(parse(`${chunk}`), globalEnv);
      return process.stdout.write(`${scheme_str(val)}\n`);
    });
}

function scheme_str(exp: any): string {
    if (Array.isArray(exp)) {
        return `( ${exp.map((e: any) => scheme_str(e)).join("")})`;
    } else {
        return `${exp}`;
    }
}

repl();