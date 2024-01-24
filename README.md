# Spreadsheet Light

This is a configurable **Spreadsheet** based algorithm, used to parse or create strings in CSV format. To have easy access to it.

You can install it like below.

```npm
  npm install spreadsheet-light --save-dev
```

Or use it from the `unpkg` cdn as a simple script tag via the browser to have it as a global object named `{umd-name}`.

```html
<script src="https://unpkg.com/spreadsheet-light@{version}/umd/index.js"></script>
<script type="module">
  console.log({umd-name}); // Now can be used globally in the HTML app
</script>
```

> **Note:** As `umd` must contain only one default exported object, all named imports (like `symbol`) are contained within the global object `{umd-name}`.

All of the examples in this document uses `ECMA` syntax to import or export code from the library, but this supports `CommonJS` syntax as well.

```js
// ECMA Syntax
import xsv from "spreadsheet-light";

// CommonJS Syntax
const { xsv } = require("spreadsheet-light");

// Some libraries will support conditional imports poorly
// or not even support it.
// For these cases you can force the imports like below.

// For ECMA Scripts
import xsv from "spreadsheet-light/esm";
// For CommonJS Scripts
const { xsv } = require("spreadsheet-light/cjs");
// For browser applications UMD
import * as xsv from "spreadsheet-light/umd";
const xsv = require("spreadsheet-light/umd");
```

> **Note:** This library uses a top level `await` when the `esm` mode is used. If you are using svelte, go to the [target](https://github.com/vitejs/vite/issues/13756) link for more information as this framework for retrocompatibility skips this types of imports. At this point if you go to the [can i use](https://caniuse.com/?search=top%20level%20await) page about this topic most modern browsers supports this feature. Set `optimizeDeps.esbuildOptions.target` and `build.target` to `esnext` in vite.config to enable this one if you would like to use it or if you really need to keep another `target` mode import the library as `cjs`.

## Format

You can pass a `SpreadsheetFormat` object to many of the functions for this libarry to create the best spreadsheet that fits your needs.
This class contains help functions to use the CSV in your own way.

> **_Note:_** All of the following examples are shown using the above text format in the example.

### Format default values

```js
import TextFormat from "spreadsheet-light";

const values = {
  // The string to scape special values
  quote: '"',
  // The string to separate columns
  delimiter: ",",
  // The string to separate columns
  brk: "\n",
  // What to do write when finding no content in a CSV cell
  empty: "",
};
```

### Format function `verify`

If you want to test if your new format will work you can use the `verifiy` function that will check that any of the characters between the special strings are not repeated in any way.
This function is costly, use it only for test purposes;

```js
import TextFormat from "spreadsheet-light";
const format = new TextFormat({ delimiter: "\n", brk: "\n" });
format.verify(); // Throws an error as the delimiter and the breaker are the same
```

### Format function `toSafeString`

You can use this function to create safe strings that can be parsed easily on any CSV libary the library already uses this internally so be carefull where you use this any `SerializableInput` does not need it on the `toString` method as it managed this way already.

The best use case for this is when you have your own algorithm that transforms
`ValueData` into CSV `string`.

```js
import TextFormat from "spreadsheet-light";
const format = new TextFormat();
const string = format.toSafeString('\r\n",'); // '"\r\n\"\","'
```

## Value Object

A _Value Object_ is any valid javascript primitive that can be parsed without issues to some text, such as:

- Strings
- Numbers
- _null_
- JSON Objects and Arrays containing the previous ones

Classes, functions, symbols or _undefined_ are not supported as this library tries to help you to keep your CSV content consistent.

### isValueObject

This function then is for validating that any passed value is valid to be serialized into CSV content.

## Spreadsheet Class

The **Spreadsheet** class is a representation of rows and columns. You can think this like a literal table or list, where you read, add, or modify the content within.

### Parsing

Parsing is a _serialization algorithm_ meant to have input information from one type then transforming this one to another type. For this case the input type is the **string** type that will be transformed to the **Spreadsheet** class to be handled as a small database chunk.

```js
import { xsv } from "spreadsheet-light";

// Imagine this how your CSV file would look like
const csv = `
a,b
c,d
`;

// You can create your custom behaviour
const options = {
  // The custom format
  format: {
    quote: "'",
  },
  // What to do when finding empty lines
  ignoreEmptyLines: true,
  // If the string comes from contains a not well formatted file,
  // here can be set to true if there is not ending character there
  hasEndCharacter: false,
  // If your content contains headers set this to true
  hasHeaders: false,
  // The function to serialize special strings when transforming values
  serializer: String,
};

// This library allows you to create a Spreadsheet object
// so you can immediately start to work with your data!
const spreadsheet = xsv.parse(csv, options);

// The spreadsheet contains information about the parsing result, like:

// Checks if the parsed content is a table like object
spreadsheet.isTable == true;
// Wether the spreadsheet has headers
spreadsheet.hasHeaders == false;
// And what the headers are
spreadsheet.headers == false;
```

### JSON Parser

Instead of the native one the CSV parser uses an embed JSON parser that is based on the standard [ECMA-404](https://www.json.org/json-en.html). The most important features to focus are:

- `JSON` objects cannot have comments.
- The `key` names must be surrounded by double quotes.
- Inside an `array` or `object` leading commas are not valid.
- The `undefined` and `NaN` values are not valid.

As the CSV strings are intended for storage, there are some edge cases that will be parsed:

- The `Infinity` and `-Infinity` numbers will be parsed.
- Hexadecimal numbers will be parsed.
- Numbers smaller than `1` can start without digits before the `.` symbol.
- Numbers can start with `+` or `-` or none (none will be taken as a positive number).

### OS Compatibility

To allow compatibility between the common Operational Systems on default line breakers (i.e. Windows uses `\r\n` while Linux uses `\n`). There are special static methods in the `TextFormat` class that allows to change between those breaklines quickly. Must be used before any parsing.

```js
import TextFormat from "spreadsheet-light";
// Sets the breaker for Windows files
TextFormat.useWindowsBreaker();
// Sets the breaker for Linux files
TextFormat.useLinuxBreaker();
```

### Spreadsheet Comparison

A spreadsheet can be compared with other to check if they are the same using the JavaScript comparator symbol `==`.

```js
// The CSV content
const csv = `
a,b
c,d
`;

// Create two spreadsheets with the same csv content
const sp1 = xsv.parse(csv);
const sp2 = xsv.parse(csv);
// Create another with a different content
const sp3 = xsv.parse("d,e");

// This first comparison will be `true`
sp1 == sp2;
// This second comparison will be `false`
sp1 == sp3;
```

## Spreadsheet Data Functions

The parsing will check if the passed content can be considered as a **Table** like content. If so, you can use the methods below.

### Insert

You can insert new rows with the method _insert_.

```js
// Now the content will be:
// a,b
// c,d
// e,f
spreadsheet.insert([["e", "f"]]);
```

### Write and Bulk

You can modify the rows that already exists, either just a cell with the _write_ method or a whole mini table with the _bulk_ method

```js
// Here just a cell will be overriden:
// a,b
// c,d
// e,X
spreadsheet.write("X", 2, 3);

// But here a whole set is changed:
// 0,1
// 2,3
// e,X
spreadsheet.bulk(
  [
    [0, 1],
    [2, 3],
  ],
  // Here you can use the shorthands like "@left-top" if you don't want to hardcode the start
  {
    row: 1,
    column: 1,
  },
);
```

### Read and Range

The same way you can modify you can access the rows content, either just a cell with the _read_ method or a whole section with the _range_ method

```js
// From here just "d" will be returned:
// a,b
// c,d
spreadsheet.read("@right", 3);

// But here a whole set is being read:
// a,b,c
// d,e,f
// g,h,i
//
// The extracted content will look like this
// e,f
// h,i
spreadsheet.range(
  {
    row: 2,
    column: 2,
  },
  "@right-bottom",
);
```

### Remove and Drop

You can delete some part of the data if needed, either just a row with the _read_ method or a the whole data or a section of it with the _drop_ method. Both of these returns the deleted section, for the _remove_ function a single array and for the _drop_ method a matrix object.

```js
// From here ["d","e","f"] will be removed and returned:
// a,b,c
// d,e,f
// g,h,i
spreadsheet.remove(2);

// Here a whole set will be removed:
// a,b,c
// d,e,f
// g,h,i
//
// The extracted content will look like  [["d","e","f"],["g","h","i"]]
// and the final value like [["a","b","c"]]
spreadsheet.drop({
  from: 2, // If ommited will default to `0`
  to: "@bottom", // If ommited will default to `@bottom`
});

// The whole data set can be dropped if no arguments are passed
spreadsheet.drop(); // The data now is [[""]]

// To address the case where you want to delete a number of items after
// a certain row, you can use some math like this:

// Your start row
const row = 2;
// This will start after the desired row
const from = row + 1;

// Your number of items to remove
const items = 5;
// This will stop after deleting the desired items
const to = from + items;

// This will deelete the number of items after the desired row
spreadsheet.drop({ from, to });
```

> **_Note:_** Consider the below when using the function.
>
> - Any selector below 0 will be capped to `0` and any value beyond the bottom will be capped to `@bottom`.
> - When using the `drop` function the selectors will be swapped if the `from` value is bigger than the `to` value.

### Shorthands

As mentioned before to access or modify the data there are two objects _CellSelector_ and _RangeSelector_. These can be numbers, objects or shorthands.

Each can be represented in the following way:

**Cell Selector**:

- Any `number` that is within the bounds of `x` or `y`
- Any `letter` that represents a column like excel
- The `@bottom` shorthand that is the maximum `y` value from the table
- The `@right` shorthand that is the maximum `x` value from the table

```js
// This is how a selector may look as excel
const selector = "E"; // This should select the 2th column
```

**Range Selector**:

This can be either shorthands or an `object` containing a `row` and a `column` property that are _CellSelector_ themselves.

```js
// This is how a selector may look as an object
const selector = {
  row: 1,
  column: "@bottom",
};
```

The shorhands are:

- The `@left-top` shorthand that is for `y = 0` and `x = 0`
- The `@left-bottom` shorthand that is for the maximum `y` value from the table and `x = 0`
- The `@right-top` shorthand that is for `y = 0` and the maximum `x` value from the table
- The `@right-bottom` shorthand that is for the maximum `y` and `x` value from the table

### Sorting

Some times you will need to sort the data in one way or another. When that happens you can use the `sort` function
to sort the data onces is parsed. The wai it will work is the same as described in the default [JavaScript sort function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) the only difference is that the data will be sorted using as reference one header.

```js
// At the end the data will be sorted like this
//
// name   | country
// -----------------
// Andres | Mexico
// Maria  | Brasil
// Won    | China

import { xsv } from "spreadsheet-light";

const sp = xsv.parse(`
name,country
Maria,Brasil
Andres,Mexico
Won,China
`);

// You can sort this data by `name` as follows
sp.sort("name", (a, b) => a.localeCompare(b));
```

### Updating

Sometimes you may want the same `Spreadsheet` object with the same format and subscriptions to update the whole dataset. If that is the case the `update` function will help to generate new values with the same object.
Keep in mind this is a complete update thus the last parse options that were passed are missing at this point, be sure to pass them again if you want to have the same behavior as before else the default ones will be used. Only the following values are preserved:

- serializer
- format
- hasHeaders

If any of the previous values are passed in the options these will be overwritten.

```js
import fs from "fs/promises";
import xsv from "spreadsheet-light";

async function main() {
  const file_1 = await fs.readFile("file-1.csv");
  const file_2 = await fs.readFile("file-2.csv");
  // Generate the object
  const sp = xsv.parse(file_1, { hasHeaders: true });
  // Update with new options and preserve some ones
  sp.update(file_2, { hasHeaders: false });
}

main().catch(console.error);
```

### Serialization

You can _serialize_ your content again if you want to use it for other purposes;

```js
/**
 * You can get back a cleaned version of the original string so
 * you can use to create a save CSV file to be used in programs like excel.
 * Uses the last text format when this element was created.
 */
spreadsheet.toString();

// Or you can get the content as an array of headers and objects
let array = spreadsheet.toArray();

// Or you can get a plain matrix of columns (y), rows (x) to play with
// To access information you should place the y first like in matrix[y][x];
let matrix = spreadsheet.toMatrix();

// Or you can have a customized behavior using the `reduce` function
// to go line by line and return your custom object
// The function ignores the headers becuase as headers are already an
// array and they be missing they can be reduced separately
// Plus these can be added to the reducer as the first line setting the
// option `ignore` option to false
let reduced = spreadsheet.reduce(() => line, "");

// Or you can create a clone from the original object if you don't want to
// interfere with the data from the original one
spreadsheet.clone();
```

## Stringify

Stringify is a _serialization algorithm_ meant to have as input either a **matrix** or a **Spreadsheet** object then output a save CSV `string` representation. You can serialize your matrix to a simple `string` as long as it is a column-row matrix.

```js
// Like so
// This is the matrix
// a,b
// c,d
let string = xsv.stringify([
  ["a", "b"],
  ["c", "d"],
]);
```

## Object Serializer

To create `Serializable Objects` should follow the next rules:
The xsv contains a `symbol` called _clone_ that can be used to set a class as _Clonable_ where you will assign a function that returns the mentioned clone.
The other important function is `toString` that will be when the object is being serialized to the mentioned type.

```js
// We can add this to a custom date object like this
import { symbols } from "spreadsheet-light";

class Day {
  #date: Date;

  constructor({ day, month, year }) {
    this.#date = new Date(`${month}/${day}/${year}`);
  }

  toObject() {
    const date = this.#date;
    const year = date.getFullYear();
    let month: any = date.getMonth() + 1;
    month = month < 10 ? `0${month}` : month;
    let day: any = date.getDate();
    day = day < 10 ? `0${day}` : day;
    return {
      day,
      month,
      year,
    };
  }

  [symbols.clone]() {
    return new Day(this.toObject());
  }

  toString() {
    const { day, month, year } = this.toObject();
    return `${month}/${day}/${year}`;
  }
}
```

### Input Serializing

The `serializer` function will be called each time a cell is parsed. These values are expected to be objects or arrays ussually and handled by the parser, but with this function you can identify and transform special strings to complex objects.

```js
import xsv from "spreadsheet-light";

// Looks for a string like DD/MM/YYYY or DD-MM-YYY
const DATE_REGEX = /$(\d{2})[\/-](\d{2})[\/-](\d{4})^/gu;

// In this example:
// - If found by a regex transforms the value
// - If it is just another string just returns it
const serializer = function (string, header) {
  // Start the matches as null
  let matches = null;
  // Chec if the header is Date
  if (typeof string === "string" && header === "Date") {
    // Execute your cutom regex to fin what you are looking for
    matches = DATE_REGEX.exec(string);
    // And if found create your custom object
    if (matches) {
      DATE_REGEX.lastIndex = 0;
      // Here you can return the matched string as your customized object
      return new Day({
        day: matches[1],
        month: matches[2],
        year: matches[3],
      });
    } else return string;
  } else {
    // For any other case just return the `string`
    return string;
  }
};

// Remember to pass your custom serializer in the parse options
const options = { serializer };
const sp = xsv.parse("Date,B,C\r\n10/10/2050,2,3", options);
```

## Mapping

The `map` function, helps you to transform simple array of **JSON** objects
to a **Spreadsheet** object. This helps in cases you have a **JSON** list but you want a more visual text representation of this one.

```js
import xsv from "spreadsheet-light";

// This could be a sample list that may be recovered from some request
const list = [
  {
    food: "Cake",
    flavor: "sweet",
  },
  {
    food: "T-Bone",
    flavor: "meaty",
    healthy: true,
  },
  {
    food: "Orange",
    flavor: "citrix",
    healthy: true,
  },
];

/**
 * This object will hold a CSV the belowone:
 *
 *  food  | flavor |  healthy   |
 * ----------------------------
 * Cake   | sweet  |            |
 * T-Bone | meaty  |   true     |
 * Orange | citrix |   true     |
 */
let spreadsheet = xsv.map(list);

// You can pass the headers and help the function to not
// 'guess' the headers, to speed up the mapping to almost
// 1.8 times faster
const headers = ["food", "flavor", "healthy"];

// There are options that can be passed to the function
// depending on your needs
const options = {
  format: {
    quote: "'",
  },
  headers,
};

// Now we can generate the spreadsheet again with
// the customization of the format and a predefined
// headers
spreadsheet = xsv.map(list, options);
```

> **_Note_:** If a value for a field is not found when mapping, the empty value from the format will be used.

## Subscriptions

The `Spreadsheet` object supports internally subscriptions to `write`, `bulk`, `insert`, `remove`, `drop`, `sort` and `update` functions. You can subscribe to listen for these actions when taken and update your app content. To subscribe call the `subscribe` function from the generated object with have two parameters. The first is the action to `function` to listen and the second a `listener` for when this action happens.

```js
import xsv from "spreadsheet-light";
// Read some CSV file
const csv = await fs.readFile("file.csv");
// Generate your object
const sp = xsv.parse(csv);
// Subscribe to some action
sp.subscribe("insert", (values, row) => {
  // Do something when new data is inserted
});
// Take your action
sp.insert([[1, 2, 3]], "@bottom");
```
