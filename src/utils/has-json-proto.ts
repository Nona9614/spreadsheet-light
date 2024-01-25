const JSON_PROTOTYPE = Object.getPrototypeOf({});
const ARRAY_PROTOTYPE = Object.getPrototypeOf([]);

/** Checks if some value contains a JSON `object` prototype */
export const hasJsonProtoype = (value: any) =>
  Object.getPrototypeOf(value) === JSON_PROTOTYPE;

/** Checks if some value contains a JSON `array` prototype */
export const hasArrayPrototype = (value: any) =>
  Object.getPrototypeOf(value) === ARRAY_PROTOTYPE;
