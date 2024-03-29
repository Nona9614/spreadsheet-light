import { expect } from "chai";
import _ from "../create-callee.js";
import type { TestAlphabet } from "../types.js";

import { alphabet } from "../../src/spreadsheet/alphabet.js";

export default function createAlphabetTest(key: TestAlphabet) {
  switch (key) {
    case "from-number":
      return _(key, function (item) {
        const _string = alphabet.fromNumber(item.number);
        expect(_string).to.eql(item.expected);
      });
    case "get-number":
      return _(
        key,
        function (item) {
          const _number = alphabet.getNumber(item.string);
          expect(_number).to.eql(item.expected);
        },
        function (string: string) {
          alphabet.getNumber(string);
        },
      );
    default:
      throw new Error(`Check if a alphabet '${key}' test is missing`);
  }
}
