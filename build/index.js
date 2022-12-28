"use strict";
function isLispList(x) {
    return Array.isArray(x);
}
function isLispSymbol(x) {
    return typeof x === "string";
}
function isNum(x) {
    return typeof x === "number";
}
function tokenize(chars) {
    // Convert a string of characters into list of tokens
    return chars
        .replace(/[(]/g, " ( ")
        .replace(/[)]/g, " ) ")
        .split(' ')
        .filter(x => x !== '');
}
function parse(program) {
    return readFromTokens(tokenize(program));
}
function readFromTokens(tokens) {
    if (tokens.length == 0) {
        throw new Error('Unexpected EOF');
    }
    // Length of tokens will never be 0, hence token will never be undefined
    // @ts-ignore
    let token = tokens.shift(); // Shift "pops" off the first element in list
    if (token == "(") {
        let L = [];
        while (tokens[0] != ")") {
            // Length of tokens will never be 0, hence token will never be undefined
            // @ts-ignore
            L.push(readFromTokens(tokens));
        }
        tokens.shift(); // Pop off ')'
        return L;
    }
    else if (token == ")") {
        throw new Error('Unexpected )');
    }
    return atom(token);
}
function atom(token) {
    if (/^\d+$/.test(token)) {
        return Number.parseInt(token);
    }
    else if (/^\d+\.\d+$/.test(token)) {
        return Number.parseFloat(token);
    }
    return token;
}
function standardEnv() {
    let globalEnv = new Map([
        ["+", (x, y) => x + y],
        ["-", (x, y) => x - y],
        ["*", (x, y) => x * y],
        ["/", (x, y) => x / y],
        [">", (x, y) => x > y],
        ["<", (x, y) => x < y],
        [">=", (x, y) => x >= y],
        ["<=", (x, y) => x <= y],
        ["=", (x, y) => x === y],
        ["abs", (x) => Math.abs(x)],
        ["append", (x, y) => [...x, ...y]],
        ["apply", (x, f) => f(...x)],
        ["begin", (...x) => x[x.length - 1]],
        ["car", (...x) => x[0]],
        ["cdr", (...x) => x.slice(1)],
        ["cons", (x, y) => [x, y]],
        ["eq?", (x, y) => Object.is(x, y)],
        ["expt", (x, y) => Math.pow(x, y)],
        ["equal?", (x, y) => x === y],
        ["length", (x) => x.length],
        ["list", (...x) => x],
        ["list?", (...x) => isLispList(x)],
        ["not", (...x) => !!!x],
        ["null", (...x) => x === undefined || x === null],
        ["symbol?", (...x) => isLispSymbol(x)],
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
const globalEnv = standardEnv();
function evaluate(x, env = globalEnv) {
    if (isLispSymbol(x)) {
        return env.get(x);
    }
    else if (isNum(x)) {
        return x;
    }
    else if (x[0] === "if") {
        const [_, test, conseq, alt, ..._rest] = x;
        const exp = evaluate(test, env) ? conseq : alt;
        return evaluate(exp, env);
    }
    else if (x[0] === "define") {
        const [_, symbol, exp, ..._rest] = x;
        env.set(symbol, evaluate(exp, env));
    }
    else {
        const proc = evaluate(x[0], env);
        const args = x
            .slice(1)
            .map((element) => evaluate(element, env));
        return proc(...args);
    }
}
// console.log(evaluate(parse("(begin (define r 10) (* 3.14159265358979323485 (* r r)))")));
function repl(prpmpt = "ljsp> ") {
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
function schemestr(exp) {
    if (isLispList(exp)) {
        return `( ${exp.map((e) => schemestr(e)).join("")})`;
    }
    else {
        return toString(exp);
    }
}
function toString(x) {
    return `${x}`;
}
;
repl();
