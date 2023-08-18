import { parse } from "./parser/parse.js";
import { InputSerializer } from "./types.js";
import { isValueObject } from "./is-value-object.js";
import { stringify } from "./stringify.js";
import { setInputSerializer } from "./object-serializer.js";
import symbols from "./symbols.js";

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
};

export default xsv;
