import { NotAllowedValueError } from "./errors";
import { isValueObject } from "./is-value-object";
import { Spreadsheet } from "./spreadsheet/spreadsheet";
import { MapOptions, ValueData, ValueObject, ValueObjects } from "./types";
import { TextFormat } from "./format";

/**
 * Maps an array into a simple object. It will try to guess the headers
 * based on the name of the keys of the objects, but if the headers are passed
 * in the options, this step can be skipped and the mapping may be speed up
 * to almost `1.8` times faster.
 * @param array The array containing the data to be mapped
 * @param options The options of the mapper to have a customized behaviour
 * @returns A `Spreadsheet` object containing the data represented as a table
 */
function map(array: ValueObjects, options?: MapOptions) {
  /** Last header saved position */
  const sizes = {
    rows: 0,
    columns: 0,
  };
  /** Saves the format to be used */
  const format = new TextFormat(options?.format);
  /** The headers to be used when mapping the object to the matrix */
  let headers: string[];
  // If the headers were passed just assigne them to the variable
  if (options?.headers) {
    // Pass the options to the variable
    headers = options.headers;
    // Get the size from the array
    sizes.columns = headers.length;
  }
  // If the headers where not passed it will get them from the objects' keys
  else {
    /** Saved headers */
    const __headers = new Map<string, number>();

    // Iterate the main array to obatain the headers
    for (let y = 0; y < array.length; y++) {
      // Obtaining the objects entries
      const entries = Object.entries(array[y]);
      // Iterate the entries of each object
      for (let x = 0; x < entries.length; x++) {
        // Obtaining key and value
        const [key, value] = entries[x];
        // If the header does not exists, save it
        if (!__headers.has(key)) {
          // Set ready for the next position in headers
          sizes.columns++;
          // Sets the header number
          // And force the key to be a string
          __headers.set(String(key), sizes.columns);
        }
      }
    }
    // Create an array of the size of the found columns
    headers = new Array(sizes.columns);
    // Map the values to a simple array
    for (const object of __headers.entries()) {
      headers[object[1] - 1] = object[0];
    }
  }
  // Get y size from the number of entities
  sizes.rows = array.length;

  /** The main mapped array to be returned */
  const data: ValueData<ValueObject> = new Array(sizes.rows);
  // Now iterate the real values
  for (let y = 0; y < sizes.rows; y++) {
    // Creates a new array to be saved
    const values: ValueObject[] = new Array(sizes.columns);
    for (let x = 0; x < sizes.columns; x++) {
      // Resolve keys that does not exists in the object as empty value
      const value =
        headers[x] in array[y] ? array[y][headers[x]] : format.empty;
      // Check if tha values passed are valid
      if (!isValueObject(value)) throw NotAllowedValueError;
      // Pass the value to the array
      values[x] = value;
    }
    // Append the generated value to the data
    data[y] = values;
  }

  // Return a spreadsheet object
  return new Spreadsheet({
    data,
    hasHeaders: true,
    headers,
    isTable: true,
    format,
    serializer: options?.serializer ?? ((string, header) => string),
  });
}

export default map;
