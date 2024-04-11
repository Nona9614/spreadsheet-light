import { expect } from "chai";
import _ from "../create-callee.js";
import { TestSpreadsheet } from "../types.js";
import { Spreadsheet } from "../../src/spreadsheet/spreadsheet.js";

import {
  CellSelector,
  RangeSelector,
  SpreadhseetInsertOptions,
  SpreadsheetContent,
  ValueData,
} from "../../src/types.js";
import TextFormat from "../../src/format.js";

const buildCSV = function (item: any) {
  const {
    content,
    data,
  }: {
    content: SpreadsheetContent;
    data: ValueData<any>;
    serializer: undefined | string;
  } = item;

  return new Spreadsheet({
    data,
    isTable: content.isTable,
    headers: content.headers,
    hasHeaders: content.hasHeaders,
    format: new TextFormat(item.format),
    serializer: (string, header) => string,
  });
};

type InvalidCase = "undefined" | "symbol" | "function" | "class";

export default function createSpreadsheetTest(key: TestSpreadsheet) {
  switch (key) {
    case "sort":
      return _(key, function (item) {
        const csv = buildCSV(item);
        csv.sort(item.sortHeader, (a, b) => a.localeCompare(b));
        expect(item.expected).to.eql(csv.toMatrix());
      });
    case "bulk":
      return _(
        key,
        function (item) {
          const csv = buildCSV(item);
          const { expected, selector, writtable } = item;
          csv.bulk(writtable, selector);
          expect(csv.string).to.eql(expected);
        },
        function (is: InvalidCase | ValueData<any>, start: RangeSelector) {
          const csv = buildCSV({
            data: [["a"]],
            content: {
              isTable: true,
              headers: [],
              hasHeaders: false,
            },
          });

          let _values: ValueData<any> = [[]];

          switch (is) {
            case "undefined":
              _values[0].push(undefined);
              break;
            case "symbol":
              const symbol = Symbol("Fake symbol");
              _values[0].push(symbol);
              break;
            case "class":
              class SpreadhseetFake {}
              const _class = new SpreadhseetFake();
              _values[0].push(_class);
              break;
            case "function":
              const _function = () => {};
              _values[0].push(_function);
              break;
            default:
              _values = is;
              break;
          }

          csv.bulk(_values, start);
        },
      );
    case "insert":
      return _(
        key,
        function (item) {
          const csv = buildCSV(item);
          const { expected, options, writtable } = item;
          csv.insert(writtable, options);
          const data = csv.toMatrix();
          expect(expected).to.eql(data);
        },
        function (is: InvalidCase, options?: SpreadhseetInsertOptions) {
          const csv = buildCSV({
            data: [["a"]],
            content: {
              isTable: true,
              headers: [],
              hasHeaders: false,
            },
          });

          let _values: ValueData<any> = [[]];

          switch (is) {
            case "undefined":
              _values[0].push(undefined);
              break;
            case "symbol":
              const symbol = Symbol("Fake symbol");
              _values[0].push(symbol);
              break;
            case "class":
              class SpreadhseetFake {}
              const _class = new SpreadhseetFake();
              _values[0].push(_class);
              break;
            case "function":
              const _function = () => {};
              _values[0].push(_function);
              break;
            default:
              _values = is;
              break;
          }
          csv.insert(_values, options);
        },
      );
    case "range":
      return _(
        key,
        function (item) {
          const csv = buildCSV(item);
          const { expected, from, to } = item;
          const value = csv.range(from, to);
          expect(expected).to.eql(value);
        },
        function (
          values: ValueData<any>,
          from: RangeSelector,
          to: RangeSelector,
        ) {
          const csv = buildCSV({
            data: values,
            content: {
              isTable: true,
              headers: [],
              hasHeaders: false,
            },
          });
          csv.range(from, to);
        },
      );
    case "read":
      return _(key, function (item) {
        const csv = buildCSV(item);
        const { expected, selector } = item;
        const v = csv.read(selector.row, selector.column);
        expect(expected).to.eql(v);
      });
    case "write":
      return _(
        key,
        function (item) {
          const csv = buildCSV(item);
          const { expected, selector, writtable } = item;
          csv.write(writtable, selector.row, selector.column);
          expect(csv.string).to.eql(expected);
        },
        function (is: InvalidCase, row: CellSelector, column: CellSelector) {
          const csv = buildCSV({
            data: [["a"]],
            content: {
              isTable: true,
              headers: [],
              hasHeaders: false,
            },
          });
          let value: any = null;
          switch (is) {
            case "undefined":
              value = undefined;
              break;
            case "symbol":
              const symbol = Symbol("Fake symbol");
              value = symbol;
              break;
            case "class":
              class SpreadhseetFake {}
              const _class = new SpreadhseetFake();
              value = _class;
              break;
            case "function":
              const _function = () => {};
              value = _function;
              break;
            default:
              value = is;
              break;
          }
          csv.write(value, row, column);
        },
      );
    case "to-array":
      return _(key, function (item) {
        const csv = buildCSV(item);
        const { expected } = item;
        const value = csv.toArray();
        expect(expected).to.eql(value);
      });
    case "to-matrix":
      return _(key, function (item) {
        const csv = buildCSV(item);
        const { expected } = item;
        const value = csv.toMatrix();
        expect(expected).to.eql(value);
      });
    case "reduce":
      return _(key, function (item) {
        const csv = buildCSV(item);
        const { expected } = item;
        const liner = (
          line: any[],
          value: string,
          index: number,
          data: any[],
          isLast: boolean,
        ) => value + line.join(",") + (isLast ? "" : "\n");
        const value = csv.reduce<string>(
          item.initialValue,
          liner,
          item.includeHeaders,
        );
        expect(expected).to.eql(value);
      });
    case "remove":
      return _(key, function (item) {
        const csv = buildCSV(item);
        const { expected, selector } = item;
        csv.remove(selector);
        expect(csv.toString()).to.eql(expected);
      });
    case "drop":
      return _(key, function (item) {
        const csv = buildCSV(item);
        const { expected, rows } = item;
        csv.drop(rows);
        expect(expected).to.eql(csv.toString());
      });
    default:
      throw new Error(`Check if a spreadsheet '${key}' test is missing`);
    case "find":
    case "match":
      return _(key, function (item) {
        const csv = buildCSV(item);
        const {
          expected,
          mode,
          predicate: { header, value },
        } = item;
        const predicate = (v: any) => v[header] == value;
        const found = csv[key](predicate, mode);
        expect(expected).to.eql(found);
      });
  }
}
