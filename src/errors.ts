import ParseContext from "./parser/context.js";

export const ObjectNeverClosedError = (context: ParseContext) =>
  ParseError(context, "The string was never closed");

export const IsNotTableFormatError = new Error(
  "The CSV object is not in table format",
);

export const NotValidBase26String = new Error(
  'Only letters from "a" to "z" can be used to match a column',
);

export const NotValidMovement = new Error("The movement string is not valid");

type TableErrorInformation = {
  description: string;
};
const NOT_TABLE_ERROR_TEMPLATE_STRING = ({
  description,
}: TableErrorInformation) => `
The CSV object must be validated as a table to take the following action:
${description}
`;

/**
 * Thrown when an action is trying to be taken but the CSV is required to be a table
 */
export const isNotTableError = (description: string) =>
  new Error(NOT_TABLE_ERROR_TEMPLATE_STRING({ description }));

/** Transforms a value to readable text */
const stringify = (value: any) =>
  !value
    ? String(value)
    : typeof value === "string"
    ? value
    : JSON.stringify(value);

export const NotAllowedValueError = (
  value: any,
  parent: any,
  deep: boolean,
) => {
  let text = `
Error when cloning a "${typeof value}". Values like undefined, classes and functions
are not allowed, the only primitives allowed for the CSV format:
 - Text
 - Booleans
 - Numbers
 - Null
 - Symbols
 - Serializable Objects
 - JSON Objects or Arrays containing the previous ones
`;
  if (deep) {
    text += `Invalid value found on parent object:\n${stringify(parent)}`;
  }
  return new Error(text);
};

/**
 * Thrown when an action is trying to access a column in that is undefined
 */
export const NotFoundColumnError = (y: number) =>
  new Error(`The column ${y + 1} was not found in one of the lines`);
/**
 * Thrown when an action is trying to access a row in that is undefined
 */
export const NotFoundRowError = (x: number) =>
  new Error(`The row ${x + 1} was not found in one of the lines`);

export const NotValidLineLimitError = (l: string) =>
  new Error(`The "${l}" is not a valid limit`);

export const NotValidRangeLimitError = (l: string) =>
  new Error(`The "${l}" is not a valid limit`);

type RangeErrorInformation = {
  value: string;
};
const INVAL_RANGE_SELECTOR_TEMPLATE_STRING = ({
  value,
}: RangeErrorInformation) => `
"${value}" is not a valid range selector, please use one of the following valid selectors:
  - @left-up
  - @right-up
  - @left-down
  - @right-down
`;
/**
 * Thrown when an invalid range string selector is passed
 */
export const InvalidRangeSelector = (value: string) =>
  new Error(INVAL_RANGE_SELECTOR_TEMPLATE_STRING({ value }));

/**
 * Notifies that the double quote symbol syntax was not present
 * @param {ParseContext} context The current parse context
 * @returns A new error
 */
export const DoubleQuoteError = (context: ParseContext) => {
  if (context.index > context.string.length)
    context.index = context.string.length;
  return ParseError(
    context,
    `The quote symbol '${context.format.quote}' must be followed by another if will be used as text`,
  );
};

/**
 * @param {ParseContext} context The current parse context
 * Used when a `string` does not start with a double quote
 */
export const NotStringError = (context: ParseContext) => {
  if (context.index > context.string.length)
    context.index = context.string.length;
  return ParseError(context, `Any string must start with the '\"' character`);
};

/**
 * Returns a parse error
 * @param {ParseContext} context The current parse context
 * @param {string} message The cause of the error
 * @returns A new error generated while parsing
 */
export const ParseError = (context: ParseContext, message: string) => {
  if (context.index > context.string.length)
    context.index = context.string.length;
  /** Escaping code to color the arrow */
  const FgArrow = "\u001B[36m";
  /** Escaping code to color the error */
  const FgError = "\u001B[93m";
  /** Escaping code to color the fots */
  const FgDots = "\u001B[91m";
  /** Reset code to color the error */
  const FgReset = "\u001B[0m";
  // Collects strings up to the start to show the content
  const MAX_CHAR_COLLECTION = 50;
  // Add start dots if the error started after 3 chars long
  let text = "";
  // This will contain the arrow that points where is the position located
  let arrow = FgArrow + "↓" + FgReset;
  // Start point [N/2 characters before error index]
  let start = context.index - MAX_CHAR_COLLECTION / 2;
  // If the start point is below 3 there is no fit for the 3 dots
  if (start < 3) start = 0;
  // If the collected content will be below the N/2 range
  let end = context.index + MAX_CHAR_COLLECTION / 2;
  // If it is 3 characters behind the end the index is not lefting more than 3 characters
  if (end > context.string.length - 4) end = context.string.length - 2;
  /** The char to be collected */
  let char = "";
  // The stored virutal position of the error character
  let x = -1;
  // Stop to add when the error index is matched
  const upX = () => {
    if (i <= context.index) x++;
  };
  // The loop index
  let i = start - 1;
  // Loops to create a text reprsentation of the error
  while (i <= end) {
    // Adds 1 for to start the loop
    i++;
    upX();
    // Inserts the new char
    char = context.string[i];
    // The string to insert in the text
    let string = char;
    // If the char is a space use double spaces and represent them
    if (char === "\r") {
      string = "\\r";
      upX(); // Add the extra escape code
    } else if (char === "\n") {
      string = "\\n";
      upX();
    } else if (char === "\t") {
      string = "\\t";
      upX();
    }
    // Attaches the content
    text += string;
  }
  /** The char error that contains the error */
  const errch = context.string[context.index];
  // Adds color to the last character
  let offset = 0;
  if (errch === "\r" || errch === "\n" || errch === "\t") offset = 2;
  else offset = 1;
  // Reinserts the error character with the colored version
  text =
    text.slice(0, x) +
    FgError +
    text.slice(x, x + offset) +
    FgReset +
    text.slice(x + offset);
  // Sets the position of the arrow to the virtual index [excluding itself in the count]
  for (let y = 0; y < x; y++) arrow = " " + arrow;
  // Add end dots if there is more than 3 characters left
  if (end < context.string.length - 3) text += FgDots + "..." + FgReset;
  // Adds start dots color if needed
  if (start >= 3) {
    arrow = "   " + arrow;
    text = FgDots + "..." + FgReset + text;
  }
  // The error to be shown will contain the information of the location
  return new Error(
    `Parse error at position ${context.index}: ${message}\n${arrow}\n${text}`,
  );
};
