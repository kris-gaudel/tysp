# tysp
An interpreter for a simple Scheme (dialect of Lisp), written in Typescript. Heavily inspired by [Peter Norvig](http://norvig.com/lispy.html)'s guide to creating a Scheme interpreter in Python. 

## Why?
+ Learn about the basics of PL design (e.g., What is an interpreter? How is syntax evaluated?)
+ Get better at programming in Typescript
+ Explore functional programming (again - perhaps I'll include features from Racket in future updates, as seen in CS135)

## Overview
The interpreter is comprised of 2 main components:
+ Parser - Tokenizing and Abstract Syntax Tree generation
+ Evaluator - Perform desired operations based on an environment and scheme specific keywords (e.g., `if`, `lambda`, `define`)

The main features of this interpreter include:
+ Mathematical and comparison operators 
+ Variable declarations
+ Conditionals (if statements)
+ Anonymous functions (e.g., Lambda functions)
+ REPL for in-line evaluation

## Setup
```sh
git clone https://github.com/kris-gaudel/tysp
```

## Usage

#### To start the interpreter and its REPL, enter the directory and run :
```sh
npm start
```
## Examples
```sh
tysp.ts> (expt 4 2)
16
tysp.ts> (define r 10)
undefined
tysp.ts> (* pi (* r r))
314.159265359
tysp.ts> (if (> (* 11 11) 120) (* 7 6) oops)
42
tysp.ts> (define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))))
undefined
tysp.ts> (fact 10)
362880
```

## Next Steps
+ Implement more functions (e.g., `cons`, `eq?`, etc)
+ Testing
