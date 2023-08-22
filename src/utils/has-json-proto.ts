const JSON_PROTOTYPE = Object.getPrototypeOf({});

const hasJsonProtoype = (value: any) =>
  Object.getPrototypeOf(value) === JSON_PROTOTYPE;

export default hasJsonProtoype;
