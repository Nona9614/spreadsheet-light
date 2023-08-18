import {
  CellSelector,
  Pointer,
  RangeSelector,
  SpreadhseetInsertOptions,
  SpreadsheetContent,
  ValueData,
} from "../src/types";
import { TextFormat } from "../src/format";

export type TestCaseUnit<I, X> = {
  _id: string;
  skip: boolean;
  expected: X;
  message: string;
  format?: TextFormat;
} & I;

export type ErrorCaseUnit = {
  _id: string;
  skip: boolean;
  message: string;
  name: string;
  throws: string;
  format?: TextFormat;
  /** The parameters to pass to the function to cause the error */
  params: any[];
};

type GeneralTest<I, X> = {
  _id: string;
  skip: boolean;
  items: TestCaseUnit<I, X>[];
  errors?: ErrorCaseUnit[];
};

// Parse Tests

type Transforms = GeneralTest<
  {
    _id: string;
    string: string;
    serializer: string;
  },
  string | null | undefined | number
>;

type Process = GeneralTest<
  {
    _id: string;
    word: string;
    isQuoted: boolean;
    isJSON: boolean;
    isDate: boolean;
  },
  any
>;

type Parse = GeneralTest<
  {
    string: string;
    ignoreHeaders: boolean;
  },
  SpreadsheetContent & { data: ValueData<any> }
>;

// Alphabet Tests

type FromNumber = GeneralTest<
  {
    number: number;
  },
  string
>;

type GetNumber = GeneralTest<
  {
    string: string;
  },
  number
>;

// Spreadhseet Tests

type WriteContent = GeneralTest<
  {
    data: ValueData<any>;
    content: SpreadsheetContent;
    selector: {
      row: CellSelector;
      column: CellSelector;
    };
    writtable: string;
  },
  string
>;

type RangeContent = GeneralTest<
  {
    data: ValueData<any>;
    content: SpreadsheetContent;
    to: RangeSelector;
    from: RangeSelector;
  },
  ValueData<any>
>;

type BulkContent = GeneralTest<
  {
    data: ValueData<any>;
    content: SpreadsheetContent;
    selector: {
      row: CellSelector;
      column: CellSelector;
    };
    writtable: ValueData<any>;
  },
  string
>;

type InsertContent = GeneralTest<
  {
    data: ValueData<any>;
    content: SpreadsheetContent;
    options: SpreadhseetInsertOptions;
    writtable: ValueData<any>;
  },
  ValueData<any>
>;

type ReadContent = GeneralTest<
  {
    data: ValueData<any>;
    content: SpreadsheetContent;
    selector: {
      row: CellSelector;
      column: CellSelector;
    };
  },
  string
>;

type ToArray = GeneralTest<
  {
    data: ValueData<any>;
    content: SpreadsheetContent;
  },
  any[]
>;

type ToMatrix = GeneralTest<
  {
    data: ValueData<any>;
    content: SpreadsheetContent;
  },
  ValueData<any>
>;

// Source

type IsValueObject = GeneralTest<
  {
    value: any;
  },
  boolean
>;

type Clone = GeneralTest<
  {
    value: any;
  },
  any
>;

type Stringify = GeneralTest<
  {
    object: ValueData<any>;
  },
  string
>;

/// TEST CASES

export type TestAlphabet = "from-number" | "get-number";
export type TestParser = "transforms" | "process" | "parse";
export type TestSpreadsheet =
  | "write"
  | "read"
  | "range"
  | "bulk"
  | "insert"
  | "to-array"
  | "to-matrix";
export type TestSource = "clone" | "stringify" | "is-value-object";

export type TestName = TestAlphabet | TestParser | TestSpreadsheet | TestSource;

// Validations to check mock files
export const isAlphaetTest = (value: string): value is TestAlphabet =>
  value === "from-number" || value === "get-number";
export const isParserTest = (value: string): value is TestParser =>
  value === "transforms" || value === "process" || value === "parse";
export const isSpreadsheetTest = (value: string): value is TestSpreadsheet =>
  value === "write" ||
  value === "read" ||
  value === "bulk" ||
  value === "range" ||
  value == "insert" ||
  value === "to-array" ||
  value === "to-matrix";
export const isSourceTest = (value: string): value is TestSource =>
  value === "stringify" || value === "is-value-object" || value === "clone";

export type Test<T extends TestName> = T extends "transforms"
  ? Transforms
  : T extends "process"
  ? Process
  : T extends "parse"
  ? Parse
  : T extends "from-number"
  ? FromNumber
  : T extends "get-number"
  ? GetNumber
  : T extends "write"
  ? WriteContent
  : T extends "bulk"
  ? BulkContent
  : T extends "insert"
  ? InsertContent
  : T extends "read"
  ? ReadContent
  : T extends "range"
  ? RangeContent
  : T extends "to-matrix"
  ? ToMatrix
  : T extends "to-array"
  ? ToArray
  : T extends "stringify"
  ? Stringify
  : T extends "is-value-object"
  ? IsValueObject
  : T extends "clone"
  ? Clone
  : never;

type UnArray<T> = T extends Array<infer U> ? U : T;
export type Callback<T extends TestName> = (
  this: Mocha.Context,
  item: Omit<UnArray<Test<T>["items"]>, "_id" | "message" | "skip">,
  done: (err?: Error) => void,
) => boolean | void;

export type Thrower = (this: any, ...args: any) => any;

export type Callee<T extends TestName> = {
  key: T;
  cb: Callback<T>;
  th: Thrower;
};

export type Spies = { [T in TestName]: Test<T> };
