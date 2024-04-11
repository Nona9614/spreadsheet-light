# Spreadsheet Light Changelog

Select a Spreadsheet Light version below to view the changelog history:

- [Spreadsheet Light 0.3.4](#V0.3.4) **Current**
- [Spreadsheet Light 0.3.3](#V0.3.3)
- [Spreadsheet Light 0.3.2](#V0.3.2)
- [Spreadsheet Light 0.3.1](#V0.3.1)
- [Spreadsheet Light 0.3.0](#V0.3.0)

- [Spreadsheet Light 0.2.9](#V0.2.9)
- [Spreadsheet Light 0.2.8](#V0.2.8)
- [Spreadsheet Light 0.2.6](#V0.2.6)
- [Spreadsheet Light 0.2.5](#V0.2.5)
- [Spreadsheet Light 0.2.4](#V0.2.4)
- [Spreadsheet Light 0.2.3](#V0.2.3)
- [Spreadsheet Light 0.2.2](#V0.2.2)
- [Spreadsheet Light 0.2.1](#V0.2.1)
- [Spreadsheet Light 0.2.0](#V0.2.0)

- [Spreadsheet Light 0.1.11](#V0.1.11)
- [Spreadsheet Light 0.1.10](#V0.1.10)
- [Spreadsheet Light 0.1.9](#V0.1.9)
- [Spreadsheet Light 0.1.7](#V0.1.7)
- [Spreadsheet Light 0.1.6](#V0.1.6)

## V0.3.4

- The `find` and `match` functions where added to the spreadsheet object.
- The date regex example was fixed as it was using the wrong order on the `$` and `^` symbols.
- Changed logic of `headers` property of the spreadsheet object to always return information althou headers are not set. The only time a empty array is returned is in the case that the object has no `data`.

## V0.3.3

- Fixed bug that not detects multiple quote symbols when using the function `toSafeString`.
- Improving the error notification of the `NotAllowedValueError` to let know the user the type of value found and if it is the case who is the parent object.

## V0.3.2

- Fixed bug that not detects empty values before EOL.
- `symbol` was added as a new possible value in the serialization yet `undefined` remains invalid, even for empty values.
- Adding information on how to use the `empty` value.

## V0.3.1

- Fixed bundler issue that ignores some evaluation as takes it always true when is not taking into account the inner function context. This cauased to skip escaped CSV strings logic.

## V0.3.0

- Now the project is full `ESM`.

- The parse logic was replaced to be more efficient and to evaluate character by character when parsing. Thus the errors are tracked more easily and at the exact point.

- The parse error was updated to be more readable and clean.

- The limitation to have only string headers was removed. Any type of header is now valid.

- The `serializer` function will be launched every time a cell is parsed as now the `transform` flag was removed. Still this won't luanch on headers parsing.

- When a parsed cell is launched in the `serializer` function, the headers will be replaced by an `Excel` like column letter when the flag `hasHeaders` is false.

- The `empty` value now can be of any `primitive` type not including `object` , `array` and `function`.

- The default line break was changed to `\n` and an internal method was added to quickly change the default one to `\r\n` using the function `TextFormat.useWindowsBreaker()`

- An empty CSV string is parsed as a `matrix` that is an empty array, does not throw any `error` and `isTable` is set to `false`.

- The JSON parser it is now embed in the CSV parser. For better performance between them is based on the [ECMA-404](https://www.json.org/json-en.html) standard. You can read the [README.md](README.md#json-parser) file to know more.

- Now the JSON objects, JSON arrays and CSV escaped values can contain whitespaces between delimiters, breakers or the end of line and still the parser will recognize them and remove the extra spaces.

- An escaped CSV string that was never closed will be marked always as an error.

- Added control for verification of appropiate CSV format for the parser.

- Memoization was removed as is intended that once a spreadsheet is loaded by the parser, that is the one that should be manipulated via the `Spreadsheet` instance methods.

- Added missing documentation about the use of `Excel` like columns when using the selectors for a `Spreadsheet` instance.

- Improving `clone` logic when generating arrays by creating one with a preset size.

## V0.2.9

- Removing external dependencies

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
