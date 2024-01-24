import symbols from "./symbols.js";
import { ValueObject } from "./types.js";
import hasJsonProtoype from "./utils/has-json-proto.js";

/**
 * Checks if the passed value is a valid ValueObject that only contains:
 * - Text
 * - Booleans
 * - Numbers
 * - Objects or Arrays containing the previous ones
 */
export function isValueObject(value: any): value is ValueObject {
  if (value === null) return true;
  let type = typeof value;
  if (
    type === "string" ||
    type === "number" ||
    type === "bigint" ||
    type === "boolean"
  ) {
    return true;
  } else if (type === "function" || type === "symbol" || type === "undefined") {
    return false;
  } else {
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const isValid = isValueObject(value[i]);
        if (!isValid) return false;
      }
    } else {
      if (hasJsonProtoype(value)) {
        let entries = Object.entries(value);
        for (let i = 0; i < entries.length; i++) {
          const isValid = isValueObject(entries[i][1]);
          if (!isValid) return false;
        }
        return true;
      } else
        return (
          value[symbols.clone] ?? typeof value[symbols.clone] === "function"
        );
    }
    return true;
  }
}
