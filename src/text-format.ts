import { TextFormat } from "./types";

export const ZERO_STRING = "";
export const WINDOWS_BREAK_LINE = "\r\n";
export const COMMA_DELIMITER = ",";
export const QUOTE_DELIMITER = '"';

/** This is a global format to be stored in case none was passed */
export let format: Required<TextFormat> = undefined as any;

/** Builds the way to handle the text format during parsing */
export function setTextFormat(v: TextFormat) {
  // Inserts the new options to the global text format
  format = { ...format, ...v };
}

/** Sets the default values for the format object */
export function setDefaultTextFormat() {
  // All default values will be written to the global object in case, no values were passed
  format = {
    quote: QUOTE_DELIMITER,
    delimiter: COMMA_DELIMITER,
    brk: WINDOWS_BREAK_LINE,
    ignoreEmptyLines: true,
    hasEndCharacter: false,
    strictMode: true,
    hasHeaders: false,
    memoize: true,
    transform: true,
    empty: ZERO_STRING,
  };
}