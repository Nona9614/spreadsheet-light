import parse from "./parser/parse.js";
import { isValueObject } from "./is-value-object.js";
import { stringify } from "./stringify.js";
import map from "./map.js";
import symbols from "./symbols.js";
import isJSON from "./is-json.js";
import { ParseOptions, ValueObject } from "./types.js";
import { Spreadsheet } from "./spreadsheet/spreadsheet.js";
import ParseContext from "./parser/context.js";

/**
 * @module
 * This module handles CSV format strings, either to parse or read them
 */
const xsv = {
  /**
   * This function parses a string into a CSV object
   * @param {string} string The string to be processed
   * @param {ParseOptions} options Parse options to customize behaviour
   */
  parse<T extends ValueObject>(string: string, options?: ParseOptions) {
    /** The generated context for this parsing */
    const context = new ParseContext(string, options);
    // Generates the new CSV object
    const csv = new Spreadsheet<T>(parse(context));
    // Returns the generated CSV object
    return csv;
  },
  /**
   * Transforms a data object into a string using the set format
   * @param object The data to be stringified to CSV format
   * @param format Format to use when stringifying
   * @returns A string with the CSV format
   */
  stringify,
  /**
   * Maps an array into a simple object. It will try to guess the headers
   * based on the name of the keys of the objects, but if the headers are passed
   * in the options, this step can be skipped and the mapping may be speed up
   * to almost `1.8` times faster.
   * @param array The array containing the data to be mapped
   * @param options The options of the mapper to have a customized behaviour
   * @returns A `Spreadsheet` object containing the data represented as a table
   */
  map,
  /**
   * Checks if a value can be considered a plain JSON object or array
   * (subclasses of `Array` will be ignored)
   * @param value The value to be evaluated
   */
  isJSON,
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
   * @param value The value to be evaluated
   */
  isValueObject,
};

export default xsv;
