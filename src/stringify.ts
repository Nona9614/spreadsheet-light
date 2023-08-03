import { NotAllowedValueError } from "./errors";
import { isValueObject } from "./is-value-object";
import { serializer } from "./object-serializer";
import { Spreadsheet } from "./spreadsheet/spreadsheet";
import { format } from "./text-format";
import { ValueData } from "./types";

/**
 * Transforms a data object into a string using the set format
 * @param object The data to be stringified to CSV format
 * @returns A string with the CSV format
 */
export function stringify(object: ValueData<any> | Spreadsheet<any>) {
  let string = "";
  let data: ValueData<any> =
    object instanceof Spreadsheet ? object.toArray(true) : object;
  if (object instanceof Spreadsheet) {
    data = object.toArray(true);
  } else {
    data = object;
  }
  for (let y = 0; y < data.length; y++) {
    const column = data[y];
    for (let x = 0; x < column.length; x++) {
      let element: any = column[x];
      if (!isValueObject(element)) throw NotAllowedValueError;
      if (typeof element === "string")
        element = `${format.quote}${element}${format.quote}`;
      else element = serializer.output(element);
      string += element;
      if (x < column.length - 1) string += format.delimiter;
    }
    if (y < data.length - 1) string += format.brk;
  }
  return string;
}
