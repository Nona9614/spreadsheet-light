import { hasJsonProtoype, hasArrayPrototype } from "./utils/has-json-proto.js";

/**
 * Checks if a value can be considered a plain JSON object
 * @param value The value to be evaluated
 */
export default function isJSON(value: any) {
  return value && (hasJsonProtoype(value) || hasArrayPrototype(value));
}
