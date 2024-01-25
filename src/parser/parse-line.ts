import { alphabet } from "../spreadsheet/alphabet.js";
import ParseContext from "./context.js";
import parseCell from "./parse-cell.js";

/** Parses a CSV line into an array */
export default function parseLine(context: ParseContext) {
  /** The line that will be generated */
  context.line = [];
  // Stops each time a breaker is found or there is pending content
  while (
    (context.index < context.string.length && !context.isBreaker()) ||
    context.pending
  ) {
    // Stops each time a delimiter is found
    parseCell(context);
    // Stacks the cell to the line if it is not EOL
    context.line.push(context.serializer(context.value, context.header()));
    // Moves the pointer to the right
    context.pointer.right();
  }
  // Once a line is generated skips that breaker
  context.index += context.format.brk.length;
}
