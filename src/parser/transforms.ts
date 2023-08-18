import { ParseContext } from "./context";

/** Quick function just to evaluate if a value can be considered as number or not */
export function transformsNumber(value: string) {
  if (isNaN(value as any)) return value;
  else return Number(value);
}

/**
 * Transforms a string to a JavaScript value
 */
export function transforms(context: ParseContext) {
  // Check that is not a number neither a JSON object
  if (isNaN(context.line as any)) {
    if (context.line === "false" || context.line === "FALSE") return false;
    else if (context.line === "true" || context.line === "TRUE") return true;
    else if (context.line === "null" || context.line === "NULL") return null;
    else return context.serializer(context.line);
  } else return Number(context.line);
}
