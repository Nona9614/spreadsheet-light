import { expect } from "chai";
import _ from "../create-callee";
import type { TestParser } from "../types";

import xsv from "../../src/spreadsheet-light";
import { transforms } from "../../src/parser/transforms";
import { parse } from "../../src/parser/parse";
import { process } from "../../src/parser/process";
import { ParseContext } from "../../src/parser/context";
import { Spreadsheet } from "../../src/spreadsheet/spreadsheet";

export default function createParserTest(key: TestParser) {
  switch (key) {
    case "transforms":
      return _(key, function (item) {
        const context = new ParseContext(item.string);
        context.line = item.string;
        if (item.serializer === "date") {
          context.relativeHeader = "Date";
          context.serializer = function (string, header) {
            if (header === "Date") {
              const date = new Date(string);
              const year = date.getFullYear();
              let month: any = date.getMonth() + 1;
              month = month < 10 ? `0${month}` : month;
              let day: any = date.getDate();
              day = day < 10 ? `0${day}` : day;
              return `${year}/${month}/${day}`;
            } else return string;
          };
        }
        let _transforms = transforms(context);
        expect(_transforms).to.eql(item.expected);
      });
    case "process":
      return _(
        key,
        function (item) {
          const context = new ParseContext(item.word, {
            format: item.format,
          });
          context.line = item.word;
          context.isQuoted = item.isQuoted;
          const _process = process(context);
          expect(_process).to.eql(item.expected);
          if (item.isQuoted)
            expect(typeof _process === "string").to.equals(true);
        },
        function (
          word: string,
          _context: { isJSON: boolean; isQuoted: boolean },
        ) {
          const context = new ParseContext(word);
          context.line = word;
          context.isQuoted = _context.isQuoted;
          process(context);
        },
      );
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
        xsv.parse,
      );
    default:
      throw new Error(`Check if a parser '${key}' test is missing`);
  }
}
