import { InputSerializer } from "./types";

/**
 * The global object serializer
 */
export let serializer: InputSerializer = function (value) {
  return typeof value === "string" ? value : JSON.stringify(value);
};

/**
 * Sets the global serializer object
 */
export function setInputSerializer(_: InputSerializer) {
  serializer = _;
}

export default setInputSerializer;
