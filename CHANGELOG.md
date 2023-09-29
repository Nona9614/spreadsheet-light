# Spreadsheet Light Changelog

Select a Spreadsheet Light version below to view the changelog history:

- [Spreadsheet Light 0.1.10](#V0.1.11) **Current**
- [Spreadsheet Light 0.1.10](#V0.1.10)
- [Spreadsheet Light 0.1.9](#V0.1.9)
- [Spreadsheet Light 0.1.7](#V0.1.7)
- [Spreadsheet Light 0.1.6](#V0.1.6)

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
