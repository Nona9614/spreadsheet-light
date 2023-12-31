import { NotAllowedValueError } from "./errors";
import symbols from "./symbols";
import hasJsonProtoype from "./utils/has-json-proto";

/**
 * Creates a new object with deep cloning only allowing serializable objects
 */
export function clone(value: any): any {
  if (value === null) return null;
  let type = typeof value;
  if (
    type === "string" ||
    type === "number" ||
    type === "bigint" ||
    type === "boolean"
  ) {
    return value;
  } else if (type === "function" || type === "symbol" || type === "undefined") {
    throw NotAllowedValueError;
  } else {
    if (Array.isArray(value)) {
      const array = [];
      for (let i = 0; i < value.length; i++) {
        array.push(clone(value[i]));
      }
      return array;
    } else {
      if (hasJsonProtoype(value)) {
        let entries = Object.entries(value);
        const object: Record<string, any> = {};
        for (let i = 0; i < entries.length; i++) {
          object[entries[i][0]] = clone(entries[i][1]);
        }
        return object;
      } else {
        if (
          value[symbols.clone] ??
          typeof value[symbols.clone] === "function"
        ) {
          return value[symbols.clone]();
        } else throw NotAllowedValueError;
      }
    }
  }
}
