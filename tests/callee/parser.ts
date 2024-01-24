import { expect } from "chai";
import _ from "../create-callee.js";
import type { TestParser } from "../types.js";

import xsv from "../../src/spreadsheet-light.js";
import parse from "../../src/parser/parse.js";
import { Spreadsheet } from "../../src/spreadsheet/spreadsheet.js";
import ParseContext from "../../src/parser/context.js";
import { ParseOptions } from "../../src/types.js";
import parseCell from "../../src/parser/parse-cell.js";
import parseJSON from "../../src/parser/parse-json.js";
import TextFormat from "../../src/format.js";

export default function createParserTest(key: TestParser) {
  switch (key) {
    case "parse":
      return _(
        key,
        function (item) {
          const context = new ParseContext(item.string, item.options);
          const build = parse(context);
          const csv = new Spreadsheet(build);
          const values: any = {
            string: csv.string,
            hasHeaders: csv.hasHeaders,
            headers: csv.headers,
            data: csv.toMatrix(item.ignoreHeaders),
            isTable: csv.isTable,
          };
          if (csv.isTable) values.size = csv.size;
          expect(values).to.eql(item.expected);
        },
        function (string: string, options?: ParseOptions) {
          if (options?.format) {
            const format = new TextFormat(options.format);
            format.verifiy();
          }
          xsv.parse(string, options);
        },
      );
    case "parse-cell":
      return _(
        key,
        function (item) {
          const context = new ParseContext(item.string, item.options);
          parseCell(context);
          expect(context.value).to.eql(item.expected);
        },
        function (string: string, options?: ParseOptions) {
          const context = new ParseContext(string, options);
          parseCell(context);
        },
      );
    case "parse-json":
      return _(
        key,
        function (item) {
          const context = new ParseContext(item.string);
          const object = parseJSON(context);
          expect(object).to.eql(item.expected);
        },
        function (string: string) {
          const context = new ParseContext(string);
          parseJSON(context);
        },
      );
    default:
      throw new Error(`Check if a parser '${key}' test is missing`);
  }
}
