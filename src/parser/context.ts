import TextFormat from "../format.js";
import { alphabet } from "../spreadsheet/alphabet.js";
import { InputSerializer, ParseOptions } from "../types.js";

/**
 * The processed value will be saved then "x" will update the value (plus one)
 * each time a delimiter is found in the string.
 * The pointer is meant to reset to "{x:0,y:y++}" each time a breaker is added
 * to point to the new row that will be added.
 */
class ContextPointer {
  /** X is stable state if it's value is the same at every skip */
  isStableX: boolean = true;
  /** The previous larges "x" reached before every skip */
  lastLargestX: number = 0;
  /**
   * Detects that at least once there was a skip or reset
   */
  changed = false;
  /** X coordintate */
  x: number = 0;
  /** Y coordintate */
  y: number = 0;

  /**
   * Moves to the right the pointer "x++"
   */
  right() {
    this.x++;
  }

  /**
   * Moves to the start of the next current row "{x:0,y:y++}"
   */
  skip() {
    // Saves the last largest x before reset and checks if the x is stable
    // at every new skip
    if (this.changed && this.isStableX)
      this.isStableX = this.lastLargestX === this.x;
    this.lastLargestX = this.x;
    this.x = 0;
    this.y++;
    this.changed = true;
  }

  /**
   * Resets the pointer without reseting the last largest X;
   */
  reset() {
    this.y = 0;
    this.x = 0;
    this.changed = true;
  }
}

/**
 * Context to be parsed
 */
export default class ParseContext implements Required<ParseOptions> {
  format: TextFormat;
  /** The string to be working on */
  string: string;
  /** Trims collected string content that is not double quote surround */
  trim = true;
  /** The index string */
  index = 0;
  /** Any generated cell value */
  value: any = "";
  /** Any generated line content */
  line: any[] = [];
  /** The final generated headers */
  headers: any[] = [];
  /** Sets the content as it does contain headers */
  hasHeaders = false;
  /** Ignore empty lines */
  ignoreEmptyLines = true;
  /** The serializer function for CSV strings */
  serializer: InputSerializer = (value: any) => value;
  /** Flag indicating if there is pending cell to be parsed */
  pending = false;
  /** The pointer to store values */
  pointer = new ContextPointer();

  constructor(string: string, options?: ParseOptions) {
    // Always removes any whitespaces before and after the string
    this.string = string;
    // Generates a format in the content
    this.format = new TextFormat(options?.format);
    // Saves the passed options
    if (options) {
      // Always removes any whitespaces before and after the string
      if (options.trim) this.string = string.trim();
      // Checks if these options exists and saves them
      if (typeof options.hasHeaders === "boolean")
        this.hasHeaders = options.hasHeaders;
      if (typeof options.ignoreEmptyLines === "boolean")
        this.ignoreEmptyLines = options.ignoreEmptyLines;
      // Saves the serializer if it is a function
      if (typeof options.serializer === "function")
        this.serializer = options.serializer;
    }
    // Sets the pending content flag
    this.pending = !!string;
  }

  /**
   * Used for the evaluation of while loops ensuring the `context.index`
   * is still inside bounds
   * @param {boolean} evaluation
   */
  check(evaluation: boolean) {
    return evaluation && this.index <= this.string.length;
  }

  /**
   * Obtains the current relative header.
   * If there is headers obtains the current relative header and if not the relative column as excel
   */
  header() {
    return this.hasHeaders
      ? this.headers[this.pointer.x]
      : alphabet.fromNumber(this.pointer.x);
  }

  /**
   * Checks if a character is a special character:
   * - Breaker
   * - Delimiter
   * - EOL
   * - Quote Symbol
   */
  isSpecial() {
    return (
      this.isBreaker() ||
      this.isDelimiter() ||
      this.string[this.index] === undefined ||
      this.isQuote()
    );
  }

  /**
   * Checks if the following characters from the string is the `breaker`
   */
  isBreaker() {
    return (
      this.string.substring(this.index, this.index + this.format.brk.length) ===
      this.format.brk
    );
  }

  /**
   * Checks if the following characters from the string is the `breaker`
   */
  isDelimiter() {
    return (
      this.string.substring(
        this.index,
        this.index + this.format.delimiter.length,
      ) === this.format.delimiter
    );
  }

  /**
   * Checks if the following characters from the string is the `quote`
   * @param {number} offset The offset to be applied to the current index
   */
  isQuote(offset: number = 0) {
    return (
      this.string.substring(
        this.index + offset,
        this.index + this.format.quote.length + offset,
      ) === this.format.quote
    );
  }
}

/**
 * Creates and starts the parse context for all kind of
 * references needed during all the process
 * @param string The string to be parsed as a CSV object
 */
export function createContext(string: string, format: TextFormat) {}
