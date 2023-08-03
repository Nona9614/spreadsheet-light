import { expect } from "chai";
import _ from "../create-callee";
import type { TestParser } from "../types";

import { transforms } from "../../src/parser/transforms";
import { parse } from "../../src/parser/parse";
import { process } from "../../src/parser/process";
import { context, createContext } from "../../src/parser/context";

export default function createParserTest(key: TestParser) {
  switch (key) {
    case "transforms":
      return _(key, function (item) {
        const _transforms = transforms(item.string);
        expect(_transforms).to.eql(item.expected);
      });
    case "process":
      return _(
        key,
        function (item) {
          createContext(item.word);
          context.line = item.word;
          context.isQuoted = item.isQuoted;
          context.isJSON = item.isJSON;
          context.isDate = item.isDate;
          const _process = process();
          const value =
            _process instanceof Date ? _process.toISOString() : _process;
          expect(value).to.eql(item.expected);
          if (item.isQuoted)
            expect(typeof _process === "string").to.equals(true);
        },
        function (
          word: string,
          _context: { isJSON: boolean; isQuoted: boolean },
        ) {
          createContext(word);
          context.line = word;
          context.isQuoted = _context.isQuoted;
          context.isJSON = _context.isJSON;
          process();
        },
      );
    case "parse":
      return _(
        key,
        function (item) {
          const _parse = parse(item.string);
          expect(_parse.string).to.equals(item.expected.string);
          expect(_parse.isTable).to.equals(item.expected.isTable);
          expect(_parse.hasHeaders).to.equals(item.expected.hasHeaders);
          expect(_parse.headers).to.eql(item.expected.headers);
          const array = _parse.toArray(true);
          if (array[0][0] instanceof Date)
            item.expected.data[0][0] = new Date(item.expected.data[0][0]);
          expect(array).to.eql(item.expected.data);
          if (item.expected.isTable)
            expect(_parse.size).to.eql(item.expected.size);
        },
        parse,
      );
    default:
      throw new Error(`Check if a parser '${key}' test is missing`);
  }
}
