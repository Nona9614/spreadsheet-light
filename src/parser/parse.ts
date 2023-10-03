import { ParseContext } from "./context.js";
import { reducer } from "./reducer.js";
import { SpreadsheetBuild, ValueObject } from "../types.js";

/**
 * This function parses a string into a CSV object
 * @param {string} string The string to be processed
 * @param options Parse options to customize behaviour
 */
export function parse<V extends ValueObject>(
  context: ParseContext,
): SpreadsheetBuild<V> {
  // If strict mode is on and there is no content throw an error
  if (context.string === "") {
    return {
      data: [[context.format.empty as any]],
      isTable: true,
      headers: [],
      hasHeaders: false,
      format: context.format,
      serializer: context.serializer,
    };
  }

  // Reduce all the values from the string to a valid object
  const { data, headers, isTable } = reducer(context);
  const hasHeaders = context.hasHeaders;
  const format = context.format;

  // Reset the previous context if used
  context.reset();

  // Creates a default CSV
  return {
    data,
    isTable,
    headers,
    hasHeaders,
    format,
    serializer: context.serializer,
  };
}
