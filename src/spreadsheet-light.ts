import { parse } from "./parser/parse.js";
import { isValueObject } from "./is-value-object.js";
import { stringify } from "./stringify.js";
import map from "./map.js";
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
   * Maps an array of objects into a Spreadsheet
   */
  map,
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
