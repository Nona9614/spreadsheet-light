import { EmptyStringError, FirstCharacterInvalidError } from "../errors.js";
import { TextFormat } from "../format.js";
import { ParseContext } from "./context.js";
import { Spreadsheet } from "../spreadsheet/spreadsheet.js";
import { reducer } from "./reducer.js";
import { InputSerializer, ParseOptions, ValueObject } from "../types.js";

/** A stringified CSV object */
let stringified: boolean = false;
let memoized: string | null = null;

/** The current CSV data */
let _csv: Spreadsheet<any>;

/** Cleans the current memoization state */
function cleanMemoization() {
  memoized = null;
  stringified = true;
}

/**
 * This function parses a string into a CSV object
 * @param {string} string The string to be processed
 * @param options Parse options to customize behaviour
 */
export function parse<V extends ValueObject>(
  string: string,
  options?: ParseOptions,
) {
  // If the memoization option is on, check if the value was parsed already
  if (options?.memoize === true) {
    // Rterun the stored data if if memoization is found
    if (memoized === string) return _csv;
  }

  // Creates a new parse context
  const context = new ParseContext(string, options);

  // If strict mode is on and there is no content throw an error
  if (context.string === "") {
    if (context.strictMode) {
      cleanMemoization();
      throw EmptyStringError;
    } else {
      return new Spreadsheet<any>(
        [[context.format.empty]],
        true,
        [],
        false,
        context.format,
      );
    }
  }
  // If the content is just the character quote return an error
  else if (context.format.isQuote(context.string)) {
    cleanMemoization();
    throw FirstCharacterInvalidError;
  }

  // Reduce all the values from the string to a valid object
  const { data, headers, isTable } = reducer(context);
  // Store new memoized on parsing success
  memoized = string;

  // Creates a default CSV
  const csv = new Spreadsheet<V>(
    data,
    isTable,
    headers,
    context.hasHeaders,
    context.format,
  );
  _csv = csv;

  // Reset the previous context if used
  context.reset();

  // Return a copy to avoid reference issues with the memoized version
  return csv.clone();
}
