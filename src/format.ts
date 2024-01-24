import { SpreadhseetFormat, ValueEmpty, ValueObject } from "./types.js";
import hasJsonProtoype from "./utils/has-json-proto.js";

const ZERO_STRING: ValueEmpty = "";
let BREAK_LINE: string = "\n";
const COMMA_DELIMITER: string = ",";
const QUOTE_DELIMITER: string = '"';

class TextFormat implements Required<SpreadhseetFormat> {
  quote = QUOTE_DELIMITER;
  delimiter = COMMA_DELIMITER;
  brk = BREAK_LINE;
  empty = ZERO_STRING;

  constructor(format?: SpreadhseetFormat) {
    // If there is a new format uses it
    if (format) {
      if (format.quote?.length) this.quote = format.quote;
      if (format.delimiter?.length) this.delimiter = format.delimiter;
      if (format.brk?.length) this.brk = format.brk;
      if ("empty" in format) this.empty = format.empty;
    }
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
   * Verifies the format does not contain repeated characters
   * between the special strings
   */
  verifiy() {
    // Checks the empty value is a primitive value
    if (
      !(
        this.empty === undefined ||
        this.empty === null ||
        typeof this.empty === "symbol" ||
        typeof this.empty === "string" ||
        typeof this.empty === "number" ||
        typeof this.empty === "bigint" ||
        typeof this.empty === "boolean"
      )
    )
      throw Error(`The empty value cannot be type of '${typeof this.empty}'`);
    // Transforms the values to array
    const transform = (value: any) => {
      if (value === "") return [-1];
      else if (typeof value === "string") {
        const array = new Array<number>(value.length);
        for (let i = 0; i < array.length; i++)
          array[i] = value[i].codePointAt(0)!;
        // Removes internal repeated values
        return Array.from(new Set(array));
      } else return [-2];
    };
    // Creates a matrix with the array codes
    const matrix = [
      transform(this.quote),
      transform(this.delimiter),
      transform(this.brk),
      transform(this.empty),
    ];
    // Contains the length of all items sum
    const checksum =
      matrix[0].length + matrix[1].length + matrix[2].length + matrix[3].length;
    // Creates a hash that removes repeated characters
    const hash = new Set(matrix.flat());
    // Checks if the sum of the items is the same again
    if (hash.size !== checksum)
      throw Error(
        "The empty value, delimiter, breaker and quote symbol cannot be similar between them in any of their characters",
      );
  }

  /**
   * Creates a "safe" string for some value, so can be stored at any CSV file
   * using this format
   */
  toSafeString(object: ValueObject) {
    if (object === this.empty) return "";
    const string =
      object !== null && hasJsonProtoype(object)
        ? JSON.stringify(object)
        : String(object).replace(this.quote, this.quote + this.quote);
    if (
      (object && string.includes(this.delimiter)) ||
      string.includes(this.brk)
    ) {
      return this.quote + string + this.quote;
    } else return string;
  }

  /**
   * Sets as the default breaker the Windows file breaker
   */
  static useWindowsBreaker() {
    BREAK_LINE = "\r\n";
  }

  /**
   * Sets as the default breaker the Linux text file breaker
   */
  static useLinuxBreaker() {
    BREAK_LINE = "\n";
  }
}

export default TextFormat;
