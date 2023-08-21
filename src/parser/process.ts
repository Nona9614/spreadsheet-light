import { NotValidUseOfQuotes } from "../errors.js";
import { ParseContext } from "./context.js";
import { transforms } from "./transforms.js";

/**
 * Process a word to remove extra quotes to set a clean value
 * @param word The word to be processed
 */
export function process(context: ParseContext) {
  let word = "";

  // Read format options
  const { quote, delimiter, empty } = context.format;

  // If has no content is an empty value
  if (context.line.length === 0) return empty;

  // If is Quoted check if there is some serialization thus saves an unquoted line
  if (context.isQuoted) context.line = context.format.unquote(context.line);

  // All needed content is collected at this point
  // Clean the surrounding quotes
  // Stores a trimmed version from the line
  const trimmed = context.line.trim();

  // Saves the trimmed content if needed
  if (context.trim) context.line = trimmed;

  // Falsy values may be considered as numbers, so trimmed values with no content
  // are either spaces or nothing, thus the best is just return the line as it is
  if (!trimmed) return context.line;

  // Evaluates if is a JSON value
  if (
    (trimmed[0] === "{" && trimmed[trimmed.length - 1] === "}") ||
    (trimmed[0] === "[" && trimmed[trimmed.length - 1] === "]")
  )
    // If the processed value is a JSON object process it
    return JSON.parse(trimmed);

  // The start index to be picking content
  let startIndex = 0;
  let array: RegExpExecArray | null;
  while ((array = context.quoteRegex.exec(context.line)) !== null) {
    // When a match is present check if the following characters are another quote
    const isNextQuote: boolean =
      context.line.substring(
        context.quoteRegex.lastIndex,
        context.quoteRegex.lastIndex + quote.length,
      ) === quote;
    // If the next value is a quote, simplify the double quotes and save
    // Then move the last index after the double quotes
    if (isNextQuote) {
      word += context.line.substring(startIndex, array.index) + quote;
      // Move the last index after the double quotes
      startIndex = context.quoteRegex.lastIndex + quote.length;
      context.quoteRegex.lastIndex = startIndex;
    }
    // If the next value is not a quote it is a parse error
    else throw NotValidUseOfQuotes;
  }
  // Concatenate any residual content
  if (startIndex <= context.line.length)
    word += context.line.substring(startIndex, context.line.length);

  // Store the processed line
  context.line = word;
  // Clears context for values needed for next time `process` is called
  context.clear();
  // Finally returns the processed line as a parsed string and transform if necessary
  return context.transform ? transforms(context) : word;
}
