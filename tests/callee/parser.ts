import { expect } from "chai";
import _ from "../create-callee";
import type { TestParser } from "../types";

import { transforms } from "../../src/parser/transforms";
import { parse } from "../../src/parser/parse";
import { process } from "../../src/parser/process";
import { ParseContext } from "../../src/parser/context";

export default function createParserTest(key: TestParser) {
  switch (key) {
    case "transforms":
      return _(key, function (item) {
        const context = new ParseContext(item.string);
        context.line = item.string;
        let _transforms = transforms(context);
        if (item.serializer === "date") {
          const date = new Date(item.string);
          const year = date.getFullYear();
          let month: any = date.getMonth() + 1;
          month = month < 10 ? `0${month}` : month;
          let day: any = date.getDate();
          day = day < 10 ? `0${day}` : day;
          _transforms = `${year}/${month}/${day}`;
        }
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
          const _parse = parse(item.string, item.options);
          const values: any = {
            string: _parse.string,
            hasHeaders: _parse.hasHeaders,
            headers: _parse.headers,
            data: _parse.toMatrix(item.ignoreHeaders),
            isTable: _parse.isTable,
          };
          if (_parse.isTable) values.size = _parse.size;
          expect(values).to.eql(item.expected);
        },
        parse,
      );
    default:
      throw new Error(`Check if a parser '${key}' test is missing`);
  }
}
