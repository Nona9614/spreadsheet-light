import { NotAllowedValueError } from "./errors.js";
import symbols from "./symbols.js";
import { hasArrayPrototype, hasJsonProtoype } from "./utils/has-json-proto.js";

/**
 * Creates a new object with deep cloning only allowing serializable objects
 */
export function clone(value: any, parent: any, deep: boolean = false): any {
  if (value === null) return null;
  let type = typeof value;
  if (
    type === "string" ||
    type === "number" ||
    type === "bigint" ||
    type === "boolean" ||
    type === "symbol"
  ) {
    return value;
  } else if (type === "function" || type === "undefined") {
    throw NotAllowedValueError(value, parent, deep);
  } else {
    if (hasArrayPrototype(value)) {
      const array = new Array(value.length);
      for (let i = 0; i < value.length; i++) {
        array[i] = clone(value[i], value, true);
      }
      return array;
    } else {
      if (hasJsonProtoype(value)) {
        let entries = Object.entries(value);
        const object: Record<string, any> = {};
        for (let i = 0; i < entries.length; i++) {
          object[entries[i][0]] = clone(entries[i][1], value);
        }
        return object;
      } else {
        if (
          value[symbols.clone] ??
          typeof value[symbols.clone] === "function"
        ) {
          return value[symbols.clone]();
        } else throw NotAllowedValueError(value, parent, deep);
      }
    }
  }
}
