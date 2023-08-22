import { SpreadhseetFormat, ValueEmpty, ValueObject } from "./types";
import hasJsonProtoype from "./utils/has-json-proto";

export const ZERO_STRING: ValueEmpty = "";
export const WINDOWS_BREAK_LINE: string = "\r\n";
export const COMMA_DELIMITER: string = ",";
export const QUOTE_DELIMITER: string = '"';

export class TextFormat implements Required<SpreadhseetFormat> {
  /** Double quote for other uses*/
  #dbquote = QUOTE_DELIMITER + QUOTE_DELIMITER;
  /** Internal quote */
  #quote = QUOTE_DELIMITER;
  get quote() {
    return this.#quote;
  }
  set quote(v: string) {
    this.#dbquote = v + v;
    this.#quote = v;
  }
  delimiter = COMMA_DELIMITER;
  brk = WINDOWS_BREAK_LINE;
  memoize = true;
  empty = ZERO_STRING;

  constructor(format?: SpreadhseetFormat) {
    if (format) Object.assign(this, format);
  }

  /**
   * Removes the surrounding quotes
   * @param string The string to clean
   */
  unquote(string: string) {
    return string.substring(
      string.length - this.quote.length,
      this.quote.length,
    );
  }

  /**
   * Creates a "safe" string for some value, so can be stored at any CSV file
   * using this format
   */
  toSafeString(object: ValueObject) {
    const string =
      object !== null && hasJsonProtoype(object)
        ? JSON.stringify(object)
        : String(object).replace(this.#quote, this.#dbquote);
    if (
      (object && string.includes(this.delimiter)) ||
      string.includes(this.brk)
    ) {
      return this.#quote + string + this.#quote;
    } else return string;
  }

  /**
   * Checks if some string is equivalent to the current quote value
   */
  isQuote(string: string) {
    return string === this.quote;
  }

  /**
   * Checks if the last part of the collected line contains a quote
   * @param string The string to check if there is an ending quote
   */
  hasEndingQuote(string: string) {
    return string.substring(string.length - this.quote.length) === this.quote;
  }
}
