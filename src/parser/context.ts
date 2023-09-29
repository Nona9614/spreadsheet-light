import { TextFormat } from "../format";
import { ParseOptions, ValueData } from "../types";

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
   * Checks if the `x` value is at the value passed
   */
  at(index: number) {
    return this.x === index;
  }

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

/** Parsing context information used to trigger certain events */
export class ParseContext implements Required<Omit<ParseOptions, "memoize">> {
  trim = false;
  ignoreEmptyLines = true;
  hasEndCharacter = false;
  strictMode = true;
  hasHeaders = false;
  transform = true;
  serializer = (value: string, header?: string) => value;
  /** The possible header relative to the current line to be stored */
  relativeHeader?: string;
  /** Text format passed to the parser */
  format: TextFormat;
  /** The string to be working on */
  string: string;
  /** Global index, indicating where in the string is the parsing process */
  index: number;
  /** Gets the real string length in case the text did not have an end character string */
  slength: number;
  /** Start index reference for the error function */
  startIndex: number;
  /** Index reference for the error function */
  errorIndex: number;
  /** Global pointer for the iteration process */
  pointer: ContextPointer;
  /** The final sum of flags to determine if the parsed values should be transformed */
  shouldTransform: boolean;
  /**
   * During the reducer process if the strictMode and transform options are set
   * if a line starts and ends with "{}" or "[]", will be marked as a JSON object
   */
  isJSON: boolean;
  /**
   * On reducer saves only once the regex instance to find double quotes
   * on process
   */
  quoteRegex: RegExp;
  /**
   * @param string The string to be parsed as a CSV object
   */
  constructor(string: string, options?: ParseOptions) {
    // Insert all of the options passed to the context
    if (options) Object.assign(this, options);
    // Set initial context values
    this.format = new TextFormat(options?.format);
    /** Always removes any whitespaces before and after the string */
    this.string = string.trim();
    /** Real string length in case that has no end character the string */
    this.slength = this.hasEndCharacter
      ? this.string.length - 1
      : this.string.length;
    this.index = 0;
    this.startIndex = 0;
    this.errorIndex = 0;
    this.isQuoted = false;
    this.isJSON = false;
    this.shouldTransform = false;
    this.quoteRegex = new RegExp(this.format.quote, "gum");
    this.pointer = new ContextPointer();
  }

  /** Resets the regex to be used for the process function */
  clear() {
    this.quoteRegex.lastIndex = 0;
    this.isQuoted = false;
    this.isJSON = false;
  }

  /** Resets the values from the context */
  reset() {
    this.string = "";
    this.index = 0;
    this.startIndex = 0;
    this.errorIndex = 0;
    this.isQuoted = false;
    this.isJSON = false;
    this.shouldTransform = false;
    this.quoteRegex.lastIndex = 0;
    this.pointer = new ContextPointer();
  }

  /** Stores a value in the data array then moces the cursor to the right */
  store(word: any, data: ValueData<any>) {
    this.pointer.right();
    data[this.pointer.y].push(word);
  }

  /**
   * Inserts a value to the data then moves to the cursor to the right
   * and then inserts a new row and moves the cursor to that place
   */
  insert(word: any, data: ValueData<any>) {
    this.store(word, data);
    data.push([]);
    this.pointer.skip();
  }

  /** The current collected char */
  char: string = "";
  /** This line will represent a found enclosed text */
  line: string = "";
  /** Flag to check if the iteration is still collecting values */
  isCollecting: boolean = false;
  /** Flag to use to determine if some content is surrounded by quotes */
  isEven: boolean = false;
  /** Flag to check if next value is a delimiter or breaker and end of line */
  isNextOpenEndOfLine: boolean = false;
  /** Flag to check if the next character is the end of line */
  isNextEndOfLine: boolean = false;
  /** Flag to check if the next character is the delimiter symbol */
  isNextDelimiter: boolean = false;
  /** Flag to check if the next character is the line breaker symbol */
  isNextBreaker: boolean = false;
  /** Flag to check if the next characters are the line breaker and delimiter symbol */
  isNextDelimiterAndBreaker: boolean = false;
  /** Flag to check if any of the next values are a limit */
  get isNextLimit() {
    return (
      this.isNextBreaker ||
      this.isNextDelimiter ||
      this.isNextDelimiterAndBreaker ||
      this.isNextEndOfLine
    );
  }

  /** Determines if the value was in quote mode (If the text existed between quote symbols) */
  isQuoted: boolean;

  /**
   * Restarts the collected content so far
   */
  restart() {
    // Before storing new values store the previous state
    this.char = "";
    this.line = "";
    this.isEven = true;
    this.isNextEndOfLine = false;
    this.isNextDelimiter = false;
    this.isNextBreaker = false;
    this.isNextOpenEndOfLine = false;
    this.isNextDelimiterAndBreaker = false;
    this.isQuoted = false;
  }

  /**
   * Starts any variable needed before iteration
   */
  start() {
    this.index = -1;
    this.isCollecting = true;
    this.isEven = true;
  }

  /**
   * Goes to the next character in the iteration
   * and makes all the evaluation that helps to the parser
   */
  next() {
    // Sets the new index for the new iteration
    const index = this.index + 1;
    // Stores the global index from the whole string in the parsing process
    this.index = index;
    // Store as the possible error index the current one
    this.errorIndex = index;
    // Set the start index for the error function if needed
    this.startIndex = this.line.length - index;
    // Store if the last character was reached and if is still collecting characters
    // plus should consider if the end of line was reached but the previous value was a limit
    // and the open quote flag is not on
    this.isCollecting = index < this.slength;
    // Store if follows an end of line
    this.isNextEndOfLine =
      this.string.substring(this.index + 1, this.index + 2).length === 0;
    // Store if follows a delimiter
    this.isNextDelimiter =
      this.string.substring(
        this.index + 1,
        this.index + this.format.delimiter.length + 1,
      ) === this.format.delimiter;
    // Store if follows a breaker
    this.isNextBreaker =
      this.string.substring(
        this.index + 1,
        this.index + this.format.brk.length + 1,
      ) === this.format.brk;
    // Checks if the next is some kind of limit folloed by end of line
    this.isNextOpenEndOfLine =
      (this.isNextDelimiter &&
        this.string.substring(this.index + this.format.delimiter.length + 1)
          .length === 0) ||
      (this.isNextBreaker &&
        this.string.substring(this.index + this.format.brk.length + 1)
          .length === 0);
    // Store if follows a delimiter and a breaker
    this.isNextDelimiterAndBreaker =
      this.string.substring(
        this.index + 1,
        this.index + this.format.delimiter.length + this.format.brk.length + 1,
      ) ===
      this.format.delimiter + this.format.brk;
    // Logic that only happens if it is yet collecting characters
    if (this.isCollecting) {
      // Stores the current char
      const char: string = this.string[index];
      this.char = char;
      // Stores the new char to the line
      this.line += char;
      // Switches the is even flag if a quote is found
      // Marks the char as a quote
      if (this.format.isQuote(char)) {
        this.isEven = !this.isEven;
        this.isQuoted = this.isNextLimit && this.isEven;
      }
    }
  }
}

/**
 * Creates and starts the parse context for all kind of
 * references needed during all the process
 * @param string The string to be parsed as a CSV object
 */
export function createContext(string: string, format: TextFormat) {}
