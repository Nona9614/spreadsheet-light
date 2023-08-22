import hasJsonProtoype from "./utils/has-json-proto";

/**
 * Checks if a value can be considered a plain JSON object
 * @param value The value to be evaluated
 */
export default function isJSON(value: any) {
  return value !== undefined && value !== null && hasJsonProtoype(value);
}
