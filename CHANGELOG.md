# Spreadsheet Light Changelog

Select a Spreadsheet Light version below to view the changelog history:

- [Spreadsheet Light 0.2.0](#V0.2.8) **Current**
- [Spreadsheet Light 0.2.0](#V0.2.6)
- [Spreadsheet Light 0.2.0](#V0.2.5)
- [Spreadsheet Light 0.2.0](#V0.2.4)
- [Spreadsheet Light 0.2.0](#V0.2.3)
- [Spreadsheet Light 0.2.0](#V0.2.2)
- [Spreadsheet Light 0.2.0](#V0.2.1)
- [Spreadsheet Light 0.2.0](#V0.2.0)
- [Spreadsheet Light 0.1.11](#V0.1.11)
- [Spreadsheet Light 0.1.10](#V0.1.10)
- [Spreadsheet Light 0.1.9](#V0.1.9)
- [Spreadsheet Light 0.1.7](#V0.1.7)
- [Spreadsheet Light 0.1.6](#V0.1.6)

## V0.2.8

- Adding `reducer` function to `Spreadsheet` class so now the data can be transformed to another custom type line by line
- Adding to readme the use of `toSafeString` more context

## V0.2.6

- Adding logic to `toSafeString` function to change back `empty` values to `zero string` value

## V0.2.5

- Adding missing `changed` flag when a `Spreadsheet` object updates are applied

## V0.2.4

- Fixing `range` function is it was throwing `x` and `y` errors the opposite
- Fixing bug for the `toRange` internal function, it was returning the opposite way the `x` and `y` cordintates
- Fixing type options from `insert` to be optional as they really are
- Fixing type `parse` function to accept a generic and start it as `ValueObject`

## V0.2.3

- Changing evaluation of `this` to `globalThis` to find the function `randomUUID` fixing errors like ECMA bundlers replacing `this` value to `void 0` making the evaluation nonsense.

## V0.2.2

- Fixing issues when generating subscriptions as in backend side will depend on the `crypto` library and in the client side will use the `crypto` from the `window` object.

## V0.2.1

- Adding support for updating the content within the same object with a new CSV string. To this function can be subscribed too.

## V0.2.0

- Adding support for subcriptions for the functions: `write`, `bulk`, `insert`, `remove`, `drop` and `sort` to listen when these are called.
- Fixing bug from `write` function where column and row values where evaluated wrong as they were crossed.

## V0.1.11

- Renaming `umd` to `xsv` removing special characters like `-` to be able to use the library with no need to use the global `this` as prefix.

## V0.1.10

- Fixing special imports to be able to import like `umd`, `esm` and `cjs`. Now any of the imports works with typescript.

## V0.1.9

- Fixing issue when passing headers in the custom serializer. Relative header now is added before the line (cell) is found to be launched with the serializer.

## V0.1.7

- Fixing issue when an empty value is followed by the end of line

## V0.1.6

- Adding support to serializer to identify headers
- Adding support to sort data in the spreadsheet based by headers
