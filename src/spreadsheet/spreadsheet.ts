import { alphabet } from "./alphabet.js";
import {
  IsNotTableFormatError,
  isNotTableError,
  NotFoundColumnError,
  NotAllowedValueError,
  NotFoundRowError,
} from "../errors.js";
import type {
  ValueObject,
  CellSelector,
  Size,
  RangeSelector,
  Pointer,
  SpreadsheetContent,
  ValueData,
  SpreadhseetInsertOptions,
  RowSelector,
} from "../types.js";
import { isValueObject } from "../is-value-object.js";
import { clone } from "../clone.js";
import { TextFormat } from "../format.js";

/** Checks if some string can be considered as a limit */
function toCellPosition(dimension: Pointer, s: string | number) {
  switch (s) {
    case "@bottom":
      return dimension.y;
    case "@right":
      return dimension.x;
    default:
      if (typeof s === "string") {
        return alphabet.getNumber(s) - 1;
      } else {
        return s - 1;
      }
  }
}

/** Checks if some string can be considered as a limit */
function toRowIndex(dimension: Pointer, s: RowSelector) {
  if (s === "@bottom") {
    return dimension.y;
  } else {
    const n = s - 1;
    return n <= dimension.y ? (n >= 0 ? n : 0) : dimension.y;
  }
}

/** Checks if some string can be considered as a limit */
function toRangePointer(dimension: Pointer, s: RangeSelector) {
  switch (s) {
    case "@left-bottom":
      return {
        x: 0,
        y: dimension.y,
      };
    case "@left-top":
      return {
        x: 0,
        y: 0,
      };
    case "@right-bottom":
      return {
        x: dimension.x,
        y: dimension.y,
      };
    case "@right-top":
      return {
        x: dimension.x,
        y: 0,
      };
    default:
      return {
        x: toCellPosition(dimension, s.row),
        y: toCellPosition(dimension, s.column),
      };
  }
}

const _getDimension = (data: any[][]): Pointer => {
  return {
    x: data[0].length - 1,
    y: data.length - 1,
  };
};

/** The Spreadsheet parsed object */
export class Spreadsheet<V extends ValueObject> implements SpreadsheetContent {
  /** Tracks a data change */
  #changed: boolean = false;

  // Spreadsheet will be marked as table until proven wrong
  #isTable: boolean;
  get isTable() {
    return this.#isTable;
  }
  #headers: string[];
  get headers() {
    return this.#headers;
  }
  #hasHeaders: boolean;
  get hasHeaders() {
    return this.#hasHeaders;
  }
  #data: ValueData<V>;

  get size(): Size {
    if (!this.#isTable) throw IsNotTableFormatError;
    return {
      rows: this.#data.length,
      columns: this.#data[0].length,
    };
  }

  #string: string = "";
  #format: TextFormat;
  get string(): string {
    return this.#stringify();
  }

  /**
   * @param clone The string where the CSV object comes from
   */
  constructor(
    data: ValueData<V>,
    isTable: boolean,
    headers: string[],
    hasHeaders: boolean,
    format: TextFormat,
    clone?: string,
  ) {
    this.#data = data;

    this.#isTable = isTable;
    this.#headers = headers;
    this.#hasHeaders = hasHeaders;
    this.#data = data;
    this.#format = format;

    if (clone !== undefined) {
      this.#string = clone;
    } else {
      this.#stringify();
    }
  }

  #stringify() {
    let string = "";
    const { delimiter, brk } = this.#format;
    if (this.#hasHeaders) {
      for (let i = 0; i < this.#headers.length; i++) {
        string += this.#format.toSafeString(this.#headers[i]);
        if (i < this.#headers.length - 1) string += delimiter;
      }
      string += brk;
    }
    for (let y = 0; y < this.#data.length; y++) {
      const column = this.#data[y];
      for (let x = 0; x < column.length; x++) {
        string += this.#format.toSafeString(column[x]);
        if (x < column.length - 1) string += delimiter;
      }
      if (y < this.#data.length - 1) string += brk;
    }
    this.#string = string;
    return string;
  }

  /**
   * Moves the cursor to a specified position (if set) then reads the data table content
   * @param cursor The place to point to the data, if no cursor was passed will use the last value from the internal cursor
   */
  read<T extends V>(row: CellSelector, column: CellSelector) {
    if (!this.isTable)
      throw isNotTableError("Read specific value within the table");
    const dimension = _getDimension(this.#data);

    // Validate the first array exists
    let y = toCellPosition(dimension, column);
    if (this.#data.length < y) return undefined;

    // Validate the second array exists
    let x = toCellPosition(dimension, row);
    if (this.#data[y].length < x) return undefined;

    return this.#data[y][x] as T;
  }

  /**
   * Writes a value to a specific cell
   * @param value The value to be writtten
   * @param row The row to select
   * @param column The column to select
   */
  write(value: V, row: CellSelector, column: CellSelector) {
    if (!this.isTable)
      throw isNotTableError("Write specific value within the table");
    if (!isValueObject(value)) throw NotAllowedValueError;
    this.#changed = true;
    const dimension = _getDimension(this.#data);

    // Validate the first array exists
    const y = toCellPosition(dimension, column);
    if (dimension.y < y) throw NotFoundColumnError(y);
    const x = toCellPosition(dimension, row);
    if (dimension.x < x) throw NotFoundRowError(x);

    this.#data[y][x] = value;
  }

  /**
   * Writes a set of values to a specific range
   * @param value The value to be written (Must be a table or the out of boundaries values will be ignored)
   * @param start The point to start writing the content (If not passed will be evaluated as 0, 0)
   */
  bulk<T extends V>(values: ValueData<T>, start: RangeSelector) {
    if (!this.isTable)
      throw isNotTableError("Write specific ranges within the table");
    this.#changed = true;
    const dimension = _getDimension(this.#data);
    const s = toRangePointer(dimension, start);
    const v = {
      x: s.x + values.length - 1,
      y: s.y + values.length - 1,
    };

    // Ignore values boyond the data scope
    if (dimension.y < v.y) v.y = dimension.y;
    if (dimension.x < v.x) v.x = dimension.x;

    for (let y = s.y; y <= v.y; y++) {
      const column = values[y - s.y];
      for (let x = s.x; x <= v.x; x++) {
        const value = column[x - s.x];
        // Validate the value exists
        if (!isValueObject(value)) throw NotAllowedValueError;
        this.#data[y][x] = value;
      }
    }
  }

  /**
   * Insert a new set of rows to the element
   * @param value The value to be written and must be a table with the same amount of spreadsheet rows or the out of boundaries values will be ignored
   */
  insert<T extends V>(
    values: ValueData<T>,
    options?: SpreadhseetInsertOptions,
  ) {
    if (!this.isTable)
      throw isNotTableError("Write specific ranges within the table");
    this.#changed = true;
    const dimension = _getDimension(this.#data);
    const after = options?.after === true;
    let s = toCellPosition(dimension, options?.start ?? 1);
    const v = {
      x: dimension.x,
      y: s + values.length - 1,
    };

    // Ignore values boyond the data scope
    if (dimension.y < v.y) v.y = dimension.y;

    for (let y = s; y <= v.y; y++) {
      const column = values[y - s];
      const newColumn: V[] = [];
      if (dimension.y < y) throw NotFoundColumnError(y);
      for (let x = 0; x <= v.x; x++) {
        const value = column[x];
        // Validate the value exists
        if (!isValueObject(value)) throw NotAllowedValueError;
        newColumn.push(value);
      }
      const start = after ? y + 1 : y;
      this.#data.splice(start, 0, newColumn);
    }
  }

  /**
   * Reads a range of contents from the CSV object
   * @param from The first point to start selecting the content
   * @param to The final point to stop selecting the content
   */
  range<T extends V>(from: RangeSelector, to: RangeSelector): ValueData<T> {
    if (!this.#isTable) throw isNotTableError("Read sets within the table");

    const dimension = _getDimension(this.#data);
    const p1 = toRangePointer(dimension, from);
    const p2 = toRangePointer(dimension, to);

    const range: ValueData<any> = [];
    for (let y = p1.y; y <= p2.y; y++) {
      const column: V[] = [];
      if (dimension.y < y) throw NotFoundColumnError(y);
      for (let x = p1.x; x <= p2.x; x++) {
        column.push(this.#data[y][x]);
        if (dimension.x < x) throw NotFoundRowError(x);
      }
      range.push(column);
    }

    return range as ValueData<T>;
  }

  /**
   * Removes a specified row in the data
   * @param row The row to delete
   * @returns The removed data
   */
  remove(row: RowSelector) {
    // Mark that the data was changed
    this.#changed = true;
    // Get the `y` index to delete
    const index = toRowIndex(_getDimension(this.#data), row);
    // Delete the selected data
    return this.#data.splice(index, 1)[0];
  }

  /**
   * Drops the whole table or a specified section of rows in the data
   * @param rows The row range to delete
   * @param rows.from From where to start deleting (default is `0`)
   * @param rows.to From where to stop deleting (default is `@bottom`)
   * @returns The removed data
   */
  drop(rows?: { from?: RowSelector; to?: RowSelector }) {
    // Object dimenstions
    const dimension = _getDimension(this.#data);
    // Mark that the data was changed
    this.#changed = true;
    // Get the `y` index to delete
    let index = rows?.from ? toRowIndex(dimension, rows.from) : 0;
    // Get the number of items to delete
    let count = rows?.to ? toRowIndex(dimension, rows.to) : dimension.y;
    // Swap internally if the first value overpass the final value
    if (index > count) {
      const _ = count;
      count = index;
      index = _;
    }
    // Sum offset
    count -= index - 1;
    // Delete the selected data
    const spliced = this.#data.splice(index, count);
    // If the whole data was deleted insert an empty value at least
    if (!rows) this.#data = [[this.#format.empty as any]];
    // Return the spliced data
    return spliced;
  }

  /**
   * Sorts the data by headers
   * @param header The header content to use as reference to sort the values
   * @param compareFn The function to use as sorting algorithm to sort values (is the same as the default in javascript)
   * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
   * @throws When the data is not in table format
   */
  sort(header: string | number, compareFn: (a: V, b: V) => number) {
    // Throw an error if the sort function is not valid
    if (!this.isTable)
      throw isNotTableError("Sorting values with no tables values");
    // Mark content as changed when sort is applied
    this.#changed = true;
    // Check what type of header was passed and used it as reference for the column
    let x: number = -1;
    if (typeof header === "string") x = this.headers.indexOf(header);
    else if (typeof header === "number") x = header;
    // Sort using the compare function
    this.#data.sort((a, b) => compareFn(a[x], b[x]));
  }

  /**
   * When the default function "valueOf" is called will return the data
   */
  valueOf() {
    if (!this.#changed) return this.#string;
    else return this.#stringify();
  }

  /**
   * The data from the CSV object. Will return an array of objects using the by default headers,
   * otherwise will use the alphabet as headers.
   * @param ignoreHeaders If set will ignore headers on parsing
   *
   * @example
   *
   * import { xsv } from "spreadsheet-light";
   *
   * xsv.format = { hasHeaders: true }
   * const csv = xsv.parse('"h1","h2","h3"\r\n"a","b","c');
   *
   * // Like an array of objects
   * const array = csv.toArray();
   * let c = array[0].h3;
   *
   */
  toArray<T extends ValueObject>(ignoreHeaders?: boolean): T[] {
    const dimension = _getDimension(this.#data);
    const array: T[] = [];
    let headers = [];
    if (this.#hasHeaders && !ignoreHeaders) headers = this.#headers;
    else {
      const right = dimension.x + 1;
      for (let i = 1; i <= right; i++) {
        headers.push(alphabet.fromNumber(i));
      }
    }
    for (let y = 0; y <= dimension.y; y++) {
      const column = this.#data[y];
      const object: any = {};
      for (let x = 0; x <= dimension.x; x++) {
        object[headers[x]] = clone(column[x]);
      }
      array.push(object);
    }
    return array as any;
  }

  /**
   * The data from the CSV object. Will return an array of objects using the by default headers,
   * otherwise will use the alphabet as headers.
   * A matrix as a matrix object can be returned where any data can
   * be accessed as 'x' and 'y' coordinates.
   * @param ignoreHeaders If set will ignore headers on parsing
   *
   * @example
   *
   * import { xsv } from "spreadsheet-light";
   *
   * xsv.format = { hasHeaders: true }
   * const csv = xsv.parse('"h1","h2","h3"\r\n"a","b","c');
   *
   * // Like a matrix
   * const matrix = csv.toMatrix();
   * c = matrix[0][2];
   */
  toMatrix<T extends V>(ignoreHeaders?: boolean): ValueData<T> {
    if (this.#hasHeaders && !ignoreHeaders) {
      const dimension = _getDimension(this.#data);
      let data: ValueData<V> = [];
      data.push(clone(this.#headers as any[]));
      for (let y = 0; y <= dimension.y; y++) {
        const column: any[] = [];
        for (let x = 0; x <= dimension.x; x++) {
          column.push(clone(this.#data[y][x]));
        }
        data.push(column);
      }
      return data as any;
    } else {
      return clone(this.#data as any);
    }
  }

  /**
   * Returns the data set as a string
   */
  toString() {
    if (!this.#changed) return this.#string;
    else return this.#stringify();
  }

  /** Creates a deep clone from this object */
  clone() {
    const data = clone(this.#data);
    const headers = this.hasHeaders ? clone(this.#headers) : [];
    return new Spreadsheet<V>(
      data,
      this.#isTable,
      headers,
      this.#hasHeaders,
      this.#format,
      this.#string,
    );
  }
}
