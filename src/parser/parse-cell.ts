import {
  DoubleQuoteError,
  ObjectNeverClosedError,
  ParseError,
} from "../errors.js";
import ParseContext from "./context.js";
import parseJSON from "./parse-json.js";

/**
 * Checks if some character is a whitespace:
 * - Space
 * - Tab
 */
const isWhitespace = (char: string) => char === " " || char === "\t";

/** Skips any space until another character is found */
const skipSpaces = (context: ParseContext) => {
  // Checks that the character is not a whitespace or breaker
  while (isWhitespace(context.string[context.index])) {
    // Go to the next character until the colon is found
    context.index++;
  }
};

/** Parses a cell into a JavaScript object   */
export default function parseCell(context: ParseContext) {
  /** The string to be parsed */
  const string = context.string;
  /** The quote string */
  const quote = context.format.quote;
  /** Restarts with empty value the cell */
  context.value = context.format.empty;
  /** Loops the content before matching a special char */
  function loopText(value: string = "") {
    // The flag indicating if some of the values were special characters
    // Iterate until a word is obtained
    while (!context.isSpecial()) {
      // Attaches the character to the word if it is not a special character
      value += string[context.index];
      context.index++;
    }
    // Checks if the last saved value is the quote symbol
    if (context.isQuote()) {
      // If it is not followed by another one throw an error
      if (!context.isQuote(context.format.quote.length)) {
        throw DoubleQuoteError(context);
      }
      // If it is a double quote, save the special character and start again
      else {
        // Attaches the quote symbol to the word
        value += quote;
        // Skips the double quote symbols
        context.index += quote.length * 2;
        // Starts again the loop
        value = loopText(value);
      }
    }
    // Returns the generated value
    return value;
  }

  /** Loops the content until a quote is found */
  function loopWord(value: string = "") {
    // Iterate until the quote symbol or the EOL is found
    while (context.index <= string.length && !context.isQuote()) {
      // Attaches the content to the value
      value += string[context.index];
      // Updates to the following index
      context.index++;
    }
    // As EOL was reached the object was never closed
    if (string[context.index] === undefined) {
      const quote = context.format.quote;
      // Removes from the value the word `undefined`
      value = value.substring(0, value.length - "undefined".length);
      // Replaces single quotes by double quotes for the message
      const original = value.replace(new RegExp(quote, "gui"), quote + quote);
      // Points the index where the quote started
      context.index = string.length - original.length - 1;
      throw ObjectNeverClosedError(context);
    }
    // If it is a double quote, save the special character and start again
    else if (context.isQuote(context.format.quote.length)) {
      // Attaches the quote symbol to the word
      value += quote;
      // Skips the double quote symbols
      context.index += quote.length * 2;
      // Starts again the loop
      value = loopWord(value);
    }
    // The text is closed with a quote symbol
    else {
      // Skips the closing quote
      context.index += quote.length;
      // Checks there is only space left until a special character is found
      while (!context.isSpecial()) {
        // If it is not a whitespace the syntax is invalid
        if (isWhitespace(string[context.index])) context.index++;
        else
          throw ParseError(
            context,
            "A closing quote symbol must be followed by a delimiter, a breaker or an end of a line with optional space between",
          );
      }
    }
    // Returns the generated value
    return value;
  }

  // Starts the iteration until a delimiter is found
  // Any special character will be handled by its level
  if (context.check(!context.isDelimiter())) {
    // Collects any start space
    let space = "";
    while (isWhitespace(string[context.index])) {
      // Saves the space if found
      space += string[context.index];
      // Goes to the next value
      context.index++;
    }
    // Checks if the following text is scaped
    if (context.isQuote()) {
      // Start collecting content after first quote symbol
      context.index += quote.length;
      // Loops simple text until a special character is found
      const value = loopWord();
      // Saves the content with the start space found
      if (value !== "") context.value = space + value;
    }
    // If not only values are expected
    else {
      /** The current character of the cell in the iteration */
      const char = string[context.index];
      // Checks if the first character may be expected as a JSON value
      if (char === "[" || char === "{") {
        // Parses the content as a JSON until the object is closed
        context.value = parseJSON(context);
        skipSpaces(context);
      }
      // Any other character will be parsed as value
      else {
        // The index where the content started to be parsed
        const startIndex = context.index;
        // Loops for the first time the text
        const value = loopText();
        // Trims the content to see if has special values
        const _ = value.trimEnd();
        // If there was content update the context
        if (startIndex < context.index) {
          // If should trim and there is no content return empty
          if (!_ && context.trim) context.value = context.format.empty;
          // If the parsed value is a not a number just store it
          else if (isNaN(value as any)) {
            // Checks some of the special values
            // Check the following characters spells `true`
            if (_ === "true" || _ === "TRUE") context.value = true;
            // Check the following characters spells `null`
            else if (_ === "null" || _ === "NULL") context.value = null;
            // Check the following characters spells `false`
            else if (_ === "false" || _ === "FALSE") context.value = false;
            // Collects as simple string and trims if needed
            else context.value = context.trim ? _ : space + value;
          }
          // If it is a number reparse it to a number object then store it
          else context.value = Number(value);
        }
      }
    }
  }

  // Skips the delimiter that stopped the content if found
  // and marks that there is a pending cell
  if (string[context.index] === ",") {
    context.pending = true;
    context.index += context.format.delimiter.length;
  }
  // As there is no pending content mark as finished
  else {
    context.pending = false;
  }
}
