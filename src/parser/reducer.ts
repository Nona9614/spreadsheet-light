import {
  HeadersWithoutDataError,
  NotValidHeaderError,
  ObjectNeverClosedError,
} from "../errors.js";
import type { ValueData } from "../types.js";
import { ParseContext } from "./context.js";
import { process } from "./process.js";

/**
 * Reduces the string from the CSV object to JavaScript values
 */
export function reducer(context: ParseContext) {
  const { quote, delimiter, brk, empty } = context.format;
  const { hasHeaders, ignoreEmptyLines } = context;

  /** Flag to use to determine if what is processed is a header or a simple row */
  let isHeader = hasHeaders;
  /** The parsed data */
  let data: ValueData<any> = [[]];
  /** The headers of the data */
  let headers: string[] = [];

  // Get ready the context before iterating
  context.start();
  context.next();
  // Iterate until the "isCollecting" flag is turned off
  do {
    // For cases where there is a single char and this is a delimiter or a breaker
    // it can be assumed that there is "Nothing" before it
    // so there is an empty value to store
    // If that the case: empties the line content and continues
    if (context.line === brk && !isHeader) {
      // Creates and moves to the new row beggining (only if is not set to be ignored)
      // And ignore lines with only breakers
      if (!(ignoreEmptyLines && context.pointer.at(0))) {
        context.insert(empty, data);
      }
      context.restart();
      continue;
    } else if (context.line === delimiter && !isHeader) {
      context.store(empty, data);
      // If the next is the end of line, attach a final empty value
      if (context.isNextEndOfLine) context.store(empty, data);
      context.restart();
      continue;
    }
    // Else if the first characters of the line that is being parsed represents a quote,
    // a escaped value is expected
    else if (context.line === quote && !isHeader) {
      // If the last characters are not a quote continue iterating until the closing quotes are found
      // And the quotes found so far has been even
      while (context.isCollecting && !context.isQuoted) context.next();
      // If the "isQuoted" flag was never set to true and stopped to collect content
      // a CSV cell was never closed
      if (!context.isQuoted) throw ObjectNeverClosedError(context);
    }
    // When some kind of end is found start to check if it is an object
    if (context.isNextLimit) {
      // Stores the processed value to assigned place
      const word = process(context);
      // If was a header it means that the pointer will stay as zero position
      // and will start to be moved until the next session
      if (isHeader) {
        // A header must be a string and not a JavaScript value
        if (
          typeof word !== "string" ||
          word === empty ||
          word === delimiter ||
          word === quote ||
          word === brk ||
          context.isNextDelimiterAndBreaker
        )
          throw NotValidHeaderError;
        headers.push(word);
        context.pointer.right();
        // If a breaker or the end of the line was hit, it means that
        // all of the headers were parsed
        if (context.isNextBreaker || context.isNextEndOfLine) {
          isHeader = false;
          if (context.isNextBreaker) context.pointer.skip();
          context.pointer.reset();
          // Moves the global index after the or break breakline to skip it
          context.index += brk.length;
        } else {
          isHeader = true;
          // Moves the global index after the or delimiter breakline to skip it
          context.index += delimiter.length;
        }
      } else {
        // Sets the current available header if present
        context.relativeHeader = headers[context.pointer.x];
        // For delimiter plus line breaks push "word + empty",
        // then move to the beggining of the next row
        if (context.isNextDelimiterAndBreaker) {
          // Moves the global index after the delimiter and the breakline to skip them
          context.index += delimiter.length + brk.length;
          // Points to the next column in the current row and store the processed value
          context.store(word, data);
          // Points to the next column again in the current row and adds an empty
          // value as a "Nothing" is between the breakline and the delimiter
          // Create a new "row" as there is a breaker and move the pointer
          // to the start of this
          context.insert(empty, data);
        }
        // For line breaks move to the beggining of the next row
        else if (context.isNextBreaker) {
          // Moves the global index after the breakline to skip it
          context.index += brk.length;
          // Stores the value in there then creates a new "row" for the selected array
          // then points to the start of the new row
          // Points to the next column in the current row then to the next row
          // Expands the number of rows
          context.insert(word, data);
        }
        // If is the end of the line just adds the last value and stop the iteration
        else if (context.isNextEndOfLine) {
          // Makes to go to the end in the iteration
          context.index = context.slength;
          // Adds the last value
          // Points to the next column in the current row
          context.store(word, data);
        } else if (context.isNextOpenEndOfLine) {
          // Makes to go to the end in the iteration
          context.index = context.slength;
          // Adds the last value with an extra final "empty" value
          context.store(word, data);
          context.store(empty, data);
        }
        // When just a delimiter is found, just go to the next column
        else {
          // Moves the global index after the delimiter to skip it
          context.index += delimiter.length;
          // Store the value in the assigned position,
          // Points to the next column in the current row
          context.store(word, data);
        }
      }
      // Restart for next iteration
      context.restart();
    }
    // Iterate the string
    context.next();
  } while (context.isCollecting);

  if (hasHeaders && data[0][0] === undefined) throw HeadersWithoutDataError;
  else {
    // Force a last skip to end reading the content
    context.pointer.skip();
    // If x was stable during all the skips it means it is a table like object
    const isTable = context.pointer.isStableX;
    return {
      data,
      headers,
      isTable,
    };
  }
}
