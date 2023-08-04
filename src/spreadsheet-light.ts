import { setTextFormat, format, setDefaultTextFormat } from "./text-format.js";
import { parse } from "./parser/parse.js";
import { InputSerializer, SerializableObject, TextFormat } from "./types.js";
import { isValueObject } from "./is-value-object.js";
import { stringify } from "./stringify.js";
import { setInputSerializer } from "./object-serializer.js";
import { clone } from "./clone.js";
import symbols from "./symbols.js";

// Populates the global text format with a default format
setDefaultTextFormat();

/**
 * @module
 * This module handles CSV format strings, either to parse or read them
 */
const xsv = {
  /**
   * Parses a string into a valid Spreadsheet with multiple functions
   */
  parse,
  /**
   * Parses an object into a string with CSV formt currently set
   */
  stringify,
  /**
   * Sets the global serializer to be used when transforming data to create
   * Spreadsheets or CSV strings to custom objects
   */
  set serializer(v: InputSerializer) {
    setInputSerializer(v);
  },
  /**
   * Symbol used to assign the clone function in a serializable object.
   *
   * @example
   * import { symbols } from 'spreadsheet-light';
   *
   * class Data {
   * this.data;
   *  constructor(data) {
   *    this.data = data;
   *  }
   *  [symbols.clone]: function {
   *    return new Data(this.data);
   *  }
   * }
   *
   */
  symbols,
  /**
   * Checks if an element is valid candidate to be a CSV value
   */
  isValueObject,
  /** Gets a copy from the current text format */
  get format(): TextFormat {
    return clone(format);
  },
  /** Sets the text format to be used while parsing */
  set format(v: TextFormat) {
    setTextFormat(v);
  },
};

export default xsv;
