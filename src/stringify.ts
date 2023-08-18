import { NotAllowedValueError } from "./errors";
import { TextFormat } from "./format";
import { isValueObject } from "./is-value-object";
import { Spreadsheet } from "./spreadsheet/spreadsheet";
import { ValueData } from "./types";

/**
 * Transforms a data object into a string using the set format
 * @param object The data to be stringified to CSV format
 * @param format Format to use when stringifying
 * @returns A string with the CSV format
 */
export function stringify(
  object: ValueData<any> | Spreadsheet<any>,
  format?: TextFormat,
) {
  const _format = new TextFormat(format);
  const { quote, delimiter, brk } = _format;

  let string = "";
  let data: ValueData<any> =
    object instanceof Spreadsheet ? object.toMatrix() : object;
  for (let y = 0; y < data.length; y++) {
    const column = data[y];
    for (let x = 0; x < column.length; x++) {
      let element: any = column[x];
      if (!isValueObject(element)) throw NotAllowedValueError;
      string += _format.toSafeString(element);
      if (x < column.length - 1) string += delimiter;
    }
    if (y < data.length - 1) string += brk;
  }
  return string;
}
