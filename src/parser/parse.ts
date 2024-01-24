import ParseContext from "./context.js";
import { InputSerializer, ParseOptions, SpreadsheetBuild } from "../types.js";
import parseLine from "./parse-line.js";

/**
 * This function parses a string into a CSV object
 * @param {ParseContext} context The generated context
 */
export default function parse(context: ParseContext): SpreadsheetBuild<any> {
  /** The final generated matrix */
  const data = [];

  // If the CSV has headers it will store them here
  if (context.hasHeaders && context.string) {
    // Stops each time a breaker is found
    parseLine(context);
    // Stacks the line in the matrix
    context.headers = context.line;
    // Moves the pointer to a new row
    context.pointer.skip();
    // Resets the pointer to be ready when content is collected
    context.pointer.reset();
  }

  // Iterates from start to end the string
  while (context.index <= context.string.length) {
    // Stops each time a breaker is found
    parseLine(context);
    // Stacks the line in the matrix
    if (!context.ignoreEmptyLines || context.line.length > 0) {
      context.pointer.skip();
      data.push(context.line);
    }
  }

  // Returns the generated matrix
  return {
    data,
    hasHeaders: context.hasHeaders,
    format: context.format,
    headers: context.headers,
    isTable: context.string ? context.pointer.isStableX : false,
    serializer: context.serializer,
  };
}
