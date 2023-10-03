import { TextFormat } from "./format";
import { Spreadsheet } from "./spreadsheet/spreadsheet";
import symbols from "./symbols";

export interface SpreadhseetFormat {
  /** The quote separator */
  quote?: '"' | string;
  /** The delimiter between objects */
  delimiter?: "," | "|" | string;
  /** The breaker between rows */
  brk?: "\r\n" | "\r" | string;
  /**
   * The empty value to place when a empty cell is found during parsing
   * @default empty = ""
   */
  empty?: ValueEmpty;
}

export type Props = {
  startIndex: number;
  errorIndex: number;
  index: number;
  slength: number;
  isTable: boolean;
};

/**
 * A row, column position
 */
export type Position = {
  row: number;
  column: number | string;
};

/**
 * A x, y coordintates
 */
export type Pointer = {
  x: number;
  y: number;
};

export type BottomLimit = "@bottom";
export type LineLimit = BottomLimit | "@right";
export type RangeLimit =
  | "@left-top"
  | "@left-bottom"
  | "@right-bottom"
  | "@right-top";

export type RowSelector = number | BottomLimit;
export type CellSelector = number | string | LineLimit;
export type RangeSelector =
  | RangeLimit
  | {
      row: CellSelector;
      column: CellSelector;
    };

export type Size = {
  rows: number;
  columns: number;
};

/** Reprecents a cell value that is empty */
export type ValueEmpty = "" | 0 | null;
/** Represents the types that a cell from the CSV object may contain */
export type ValueObject =
  | string
  | number
  | boolean
  | object
  | SerializableObject
  | ValueEmpty;
/** A key-pair object array of `KeyObject` data */
export type ValueObjects = { [key in string]: ValueObject }[];
/** Represents the CSV content */
export type ValueData<O extends ValueObject> = O[][];
/** Represents the Spreadsheet Data */
export interface SpreadsheetContent {
  /** The string that was converted to a CSV object */
  readonly string: string;
  /**
   * Returns if this object is a table or not
   */
  readonly isTable: boolean;
  /**
   * If contains headers, will be stored here as an array
   * if not the array will be empty
   */
  readonly headers: string[];
  /**
   * Passed from "Options" shows if the current CSV file
   * has headers
   */
  readonly hasHeaders: boolean;
  /**
   * If table mode is on, will describe the table size
   * @emits IsNotTableFormatError if the object is not in table format
   */
  readonly size: Size;
}

/**
 * The insert options for the spreadsheet
 */
export type SpreadhseetInsertOptions = {
  /** The row to start writing the content (If not passed will be evaluated as 1) */
  start: CellSelector;
  /**  If passed the data will be inserted after the desired row */
  after: boolean;
};

/**
 * This function serializes strings to a customize type.
 * When a passed string is not quoted (escaped) will activate this function.
 * @param string The value to be converted to a custom type
 * @param header If present, will be the relative header to this value
 */
export type InputSerializer<T = any> = (string: string, header?: string) => T;

/**
 * Marks an object class as serializable
 */
export interface SerializableObject {
  toString(): string;
  [symbols.clone]: () => SerializableObject;
}

/**
 * These are the options that can be passed to the serializer to
 * have a custom behaviour
 */
export type ParseOptions = {
  /** The custom format to use when parsing the CSV content  */
  format?: SpreadhseetFormat;
  /** The custom serializer for parse special strings */
  serializer?: InputSerializer;
  /** If set to true, all parsed `cells` will have their content trimmed */
  trim?: boolean;
  /** If set, all memoization logic will be used otherwise will be ignored */
  memoize?: boolean;
  /** Use this so the parser assumes the first line of the string are the headers */
  hasHeaders?: boolean;
  /** If set an open quoted value that was never closed will be rejected */
  strictMode?: boolean;
  /** Empty lines (No content between two breakers) will be ignored */
  ignoreEmptyLines?: boolean;
  /** Use in case your string contains the end character */
  hasEndCharacter?: boolean;
  /**
   * Only if the strict mode is activated, parses the following texts
   * as JavaScript values if they are not quoted:
   * - numbers
   * - true, false, TRUE, FALSE
   * - null, NULL
   * - JSON Objects
   * - Custom types generated from the object input serializer
   */
  transform?: boolean;
};

/**
 * The mapping options to create a customized mapping behaviour
 */
export type MapOptions = {
  /** The headers to be used as reference (if passed it will speed the mapping by x0.8 approx) */
  headers?: string[];
  /** The custom format to use when mapping the data */
  format?: SpreadhseetFormat;
  /** Seriazer to be stored just in case the generated object will be updated */
  serializer?: InputSerializer;
};

/** The types of subscriptions to listen for these actions in the object */
export type SpreadsheetSubscriberType =
  | "write"
  | "bulk"
  | "insert"
  | "remove"
  | "drop"
  | "sort"
  | "update";

/** The action to be taken when a value is written in the `spreadsheet` object */
export type WriteRunner<V extends ValueObject> = (
  /** The value that was changed */
  value: V,
  /** The row where this change happened */
  row: number,
  /** The column where this change happened */
  column: number,
) => void;
/** The action to be taken when multiple values are written inside the `spreadsheet` object */
export type BulkRunner<T extends ValueObject> = (
  /** The values that where inserted */
  values: ValueData<T>,
  /** The row where the insertion started */
  row: number,
  /** The column where the insertion started */
  column: number,
) => void;
/** The action to be taken when a new row is inserted in the `spreadsheet` object */
export type InsertRunner<V extends ValueObject> = (
  /** The row values inserted */
  values: ValueData<V>,
  /** The row start position where the new values are */
  row: number,
) => void;
/** The action to be taken when a single row is removed from the `spreadsheet` object */
export type RemoveRunner<T extends ValueObject> = (
  /** The values that where removed from the object */
  values: T[],
  /** The row where use to be the content */
  row: number,
) => void;
/** The action to be taken when a multple rows are removed from the `spreadsheet` object */
export type DropRunner<T extends ValueObject> = (
  /** The values that where removed from the object */
  values: ValueData<T>,
  /** The row where the content started to be cut */
  row: number,
  /** The number of removed rows from the object */
  count: number,
) => void;
/** The action to be taken when the data is sorted */
export type SortRunner = (
  /** The header where the sorting was applied */
  header: number | string,
) => void;
/** The action to be taken when the data is updated */
export type UpdateRunner<V extends ValueObject> = (
  /** The updated object */
  spreadsheet: Spreadsheet<V>,
) => void;

export type SpreadsheetRunner<T extends SpreadsheetSubscriberType> =
  T extends "write"
    ? WriteRunner<any>
    : T extends "bulk"
    ? BulkRunner<any>
    : T extends "insert"
    ? InsertRunner<any>
    : T extends "remove"
    ? RemoveRunner<any>
    : T extends "drop"
    ? DropRunner<any>
    : T extends "sort"
    ? SortRunner
    : T extends "update"
    ? UpdateRunner<any>
    : never;

/** The for of the internal subscriptions from an Spreadsheet object */
export type SpreadsheetSubscriptions = {
  [key in SpreadsheetSubscriberType]: Map<string, SpreadsheetRunner<key>>;
};

/** Internal properties needed to build a Spreadsheet object  */
export type SpreadsheetBuild<V extends ValueObject> = {
  /** The data of the object */
  data: ValueData<V>;
  /** Indicates if when parsed this object was found to be a table */
  isTable: boolean;
  /** The spreadsheet format to be used */
  format: TextFormat;
  /** The flag to check if the content has headers */
  hasHeaders: boolean;
  /** The headers of the object if exists */
  headers: string[];
  /** The serializer from this object */
  serializer: InputSerializer;
  /** The string where the CSV object comes from */
  clone?: string;
  /** The subscriptions to the object actions */
  subscriptions?: SpreadsheetSubscriptions;
};

export type UpdateOptions = Exclude<ParseOptions, "hasHeaders" | "format">;
