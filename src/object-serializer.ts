import { InputSerializer, OutputSerializer } from "./types";

/**
 * A class to create a object serializer for special cases when parsing values for the "Spreadsheet".
 * @remarks This will be ignored if the "strictMode" flag and the "transforms" flag is not set to `true`.
 */
class ObjectSerializer {
  input: InputSerializer;
  output: OutputSerializer;

  /**
   * @param serializers
   * @param serializers.input The function to serialize input data and transforms it to customized data
   * @param serializers.output The function to serialize output data and transforms it to string
   */
  constructor({
    input,
    output,
  }: {
    input?: InputSerializer;
    output?: OutputSerializer;
  }) {
    this.input =
      input ??
      function (value) {
        return typeof value === "string" ? value : JSON.stringify(value);
      };
    this.output =
      output ??
      function (s) {
        return s;
      };
  }
}

/**
 * The global object serializer
 */
export let serializer = new ObjectSerializer({});

/**
 * Sets the global serializer object
 */
export function setObjectSerializer(_: ObjectSerializer) {
  serializer = _;
}

export default ObjectSerializer;
