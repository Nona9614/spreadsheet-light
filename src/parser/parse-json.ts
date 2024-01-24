import { NotStringError, ParseError } from "../errors.js";
import ParseContext from "./context.js";

/**
 * Checks that the value of some character is a valid HEX number
 * @param {string} char The character to be evaluated
 */
const isHexChar = (char: string) =>
  char === "A" ||
  char === "a" ||
  char === "B" ||
  char === "b" ||
  char === "C" ||
  char === "c" ||
  char === "D" ||
  char === "d" ||
  char === "E" ||
  char === "e" ||
  char === "F" ||
  char === "f" ||
  (char >= "0" && char <= "9");

/**
 * Checks that the value of some character is a valid digit number
 * @param {string} char The character to be evaluated
 */
const isDigitChar = (char: string) => char >= "0" && char <= "9";

/**
 * Tries to parse a JSON string to an object
 * @param {ParseContext} context The context to be parsed
 * @returns The parsed object
 */
export default function parseJSON(context: ParseContext) {
  /**
   * Used for the evaluation of while loops ensuring the `context.index`
   * is still inside bounds
   * @param {boolean} evaluation
   */
  const check = (evaluation: boolean) =>
    evaluation && context.index < context.string.length;

  /** The string to be parsed */
  const string = context.string;

  /** Checks if the following text is `true` */
  function parseTrue() {
    // "true".length = 4
    const _ = string.substring(context.index, context.index + 4);
    // Check the following characters spells `true`
    if (_ === "true") {
      context.index += 4;
      return true;
    } else throw NotStringError(context);
  }

  /** Checks if the following text is `false` */
  function parseFalse() {
    // "false".length = 5
    const _ = string.substring(context.index, context.index + 5);
    // Check the following characters spells `false`
    if (_ === "false") {
      context.index += 5;
      return false;
    } else throw NotStringError(context);
  }

  /** Checks if the following text is `null` */
  function parseNull() {
    // "null".length = 4
    const _ = string.substring(context.index, context.index + 4);
    // Check the following characters spells `null`
    if (_ === "null") {
      context.index += 4;
      return null;
    } else throw NotStringError(context);
  }

  /** Skips any space until another character is found */
  function skipSpaces() {
    // Checks that the character is not a whitespace or breaker
    while (
      string[context.index] !== undefined &&
      (string[context.index] === " " ||
        string[context.index] === "\r" ||
        string[context.index] === "\n" ||
        string[context.index] === "\t")
    ) {
      // Go to the next character until the colon is found
      context.index++;
    }
  }

  // Parse any string value to memory
  function parseValue(): any {
    // Skip spaces until the first character is found
    skipSpaces();
    /** The first found character when a value is started to being parsed */
    const char = string[context.index];
    // A open curly bracket is expected to be an `object`
    if (char === "{") {
      return parseObject(context.index);
    }
    // A open square bracket is expected to be an `array`
    else if (char === "[") {
      return parseArray(context.index);
    }
    // A double quote is expected to be a `string`
    else if (char === '"') {
      return parseString(context.index);
    }
    // A minus or plus sign is expected to be a `number` or `Inifnity` or negative infinity
    else if (char === "-" || char === "+") {
      // If `I` letter is the next character is expected to be a `Infinity` value
      if (string[context.index + 1] === "I") return parseInfinity(char);
      // Any other thing will be parsed as `number`
      else return parseNumber(char);
    }
    // A dot symbol is expected to be a `number`
    else if (char === ".") {
      // Parses the number
      return parseNumber(char);
    }
    // Any number is expected to be a positive `number`
    else if (isDigitChar(char)) {
      // Parses the number
      return parseNumber();
    }
    // A `t` letter is expected to be a `true` value
    else if (char === "t") {
      return parseTrue();
    }
    // A `f` letter is expected to be a `false` value
    else if (char === "f") {
      return parseFalse();
    }
    // A `n` letter is expected to be a `null` value
    else if (char === "n") {
      return parseNull();
    }
    // A `I` letter is expected to be a `Infinity` value
    else if (char === "I") {
      return parseInfinity();
    }
    // Any other character that is not followed by a double quote is not valid
    else {
      throw ParseError(context, `Unexpected character "${char}"`);
    }
  }

  function parseObject(start: number) {
    /** The object that is parsed */
    let obj: Record<string, any> = {};
    // Skip the opening curly brace
    context.index++;
    // Iterates throu character until the close bracket is found
    while (check(string[context.index] !== "}")) {
      // Skips any whitespace until the first character is found
      skipSpaces();
      // Checks if the key starts with a quote
      if (string[context.index] !== '"')
        throw ParseError(
          context,
          "JSON objects with not double quote surrounded keys are not supported",
        );
      /** The key of the current parsed value */
      const key = parseString(context.index);
      // Throw an error if there is an empty key
      if (key === "") throw ParseError(context, "Empty keys are not valid");
      // Skips the middle colon
      skipSpaces();
      // If the found character is not a colon throw an error
      if (string[context.index] !== ":")
        throw ParseError(
          context,
          "Between a key and a value, only colons are valid",
        );
      // Once the colon is found continue skiping spaces until the value starts
      else {
        // Skip the colon
        context.index++;
      }
      /** The value of the parsed key */
      const value = parseValue();
      // Assing the value to the key
      obj[key] = value;
      // Skip any space before a sibling comma is found
      skipSpaces();
      // Check if the last value is a sibling and skip the comma if present
      if (string[context.index] === ",") context.index++;
      // If there is not followed by an ending bracket is bad format
      else if (string[context.index] !== "}") {
        // If after the end bracket was found EOL the object was never closed
        if (string[context.index + 1] === undefined) {
          context.index = start;
          throw ParseError(context, "The JSON object was never closed");
        } else {
          throw ParseError(
            context,
            "Between a value and the closing curly bracket '}', only spaces are valid",
          );
        }
      }
    }
    // Skip the closing curly brace
    context.index++;
    return obj;
  }

  /** Parses an array object */
  function parseArray(start: number) {
    /** The `array` object that will be generated */
    const array = [];
    // Skip the opening square bracket
    context.index++;
    // Iterates throu each value of the array
    while (check(string[context.index] !== "]")) {
      // Collects the value in the
      const value = parseValue();
      array.push(value);
      // Skip spaces until the comma is found
      skipSpaces();
      // Skip the comma if present
      if (string[context.index] === ",") context.index++;
      // If there is not followed by an ending bracket is bad format
      else if (string[context.index] !== "]")
        throw ParseError(
          context,
          "Between a value and the closing bracket ']', only spaces are valid",
        );
    }
    // If after the end bracket was found EOL the array was never closed
    if (
      string[context.index] !== "]" &&
      string[context.index + 1] === undefined
    ) {
      context.index = start;
      throw ParseError(context, "The JSON array was never closed");
    }
    // Skip the closing square bracket
    context.index++;
    return array;
  }

  /** Collects a string value (expects that the value has a final double quote) */
  function parseString(start: number) {
    /** Stores the collected `string` */
    let result = "";
    // Skip the opening double quote
    context.index++;
    // Iterates throu each character before the final double quote `"` is found
    // (that is not followed by a scape character)
    function loopCharacters() {
      while (check(string[context.index] !== '"')) {
        result += string[context.index];
        context.index++;
      }
      if (string[context.index - 1] === "\\") {
        result += '"';
        context.index++;
        loopCharacters();
      }
    }
    // Collects the characters
    loopCharacters();
    // If after the end quote was found EOL the string was never closed
    if (
      string[context.index] !== '"' &&
      string[context.index + 1] === undefined
    ) {
      context.index = start;
      throw ParseError(context, "The JSON string was never closed");
    }
    // Skip the closing double quote
    context.index++;
    return result;
  }

  /**
   * Checks if the following text is `Infinity`
   * @param [sign=""] The sign symbol of the infinity value
   */
  function parseInfinity(sign = "") {
    // Skip the special character if there was a sign symbol
    if (sign) context.index++;
    // "Infinity".length = 8
    const _ = string.substring(context.index, context.index + 8);
    // Check the following characters spells `Infinity`
    if (_ === "Infinity") {
      context.index += 8;
      return Number(sign + "Infinity");
    } else throw NotStringError(context);
  }

  /**
   * Parses a string into a number
   * @param {string} sign If passed is the sign symbol for the number
   */
  function parseNumber(sign: string = "") {
    /** Each of the character of the iteration */
    let substring = "";
    // Skip the special character if there was a sign symbol
    if (sign) context.index++;
    /** Iterates throu each character until a dot or a exponent is found */
    function loopNumbers() {
      while (isDigitChar(string[context.index])) {
        substring += string[context.index];
        context.index++;
      }
    }
    // Loop the first numbers part
    loopNumbers();
    // If the character is an exponent concat then try to find a sign
    if (string[context.index] === "E" || string[context.index] === "e") {
      // Go to the next character
      substring += string[context.index];
      context.index++;
      // If the following is a sign concat then loop numbers
      if (string[context.index] === "+" || string[context.index] === "-") {
        substring += string[context.index];
        context.index++;
      }
      // Collect the remaining numbers
      loopNumbers();
    }
    // If following value is a `x` may be a Hex value
    else if (string[context.index] === "x" || string[context.index] === "X") {
      // Skip to the numbers
      context.index++;
      // Iterate and checks if the current value is an hex value
      while (isHexChar(string[context.index])) {
        substring += string[context.index];
        context.index++;
      }
    }
    // If the following is a dot just concat numbers
    else if (string[context.index] === ".") {
      substring += string[context.index];
      context.index++;
      loopNumbers();
    }
    // Parses the collected string to a valid `number` object
    const number = parseFloat(sign + substring);
    // If the object is not a valid number, notify
    if (isNaN(number)) throw ParseError(context, "Invalid number");
    // Returns the collected `number` value as an object in memory
    return number;
  }

  // Returns the main parent value
  const object = parseValue();

  // Returns the final value
  return object;
}
