// Test
import { expect } from "chai";
import _ from "../create-callee.js";

// Types
import { TestSource } from "../types.js";
import { MapOptions, SerializableObject, ValueData } from "../../src/types.js";

// Functions
import { isValueObject } from "../../src/is-value-object.js";
import { stringify } from "../../src/stringify.js";
import { clone } from "../../src/clone.js";
import map from "../../src/map.js";
import symbols from "../../src/symbols.js";

export default function createSourceTest(key: TestSource) {
  switch (key) {
    case "is-value-object":
      return _(key, function (item) {
        let _value: any = item.value;

        switch (item.value) {
          case "undefined":
            _value = undefined;
            break;
          case "symbol":
            const symbol = Symbol("Fake symbol");
            _value = symbol;
            break;
          case "class":
            function Parent(this: any) {}
            Parent.prototype.constructor = Parent;
            const child = Object.create(Parent.prototype);
            _value = child;
            break;
          case "function":
            const _function = () => {};
            _value = _function;
            break;
        }

        expect(isValueObject(_value)).to.equals(item.expected);
      });
    case "clone":
      return _(
        key,
        function (item) {
          if (item.value === "complex") {
            class Parent implements SerializableObject {
              message: string;
              constructor(message: string) {
                this.message = message;
              }
              toString(): string {
                return this.message;
              }
              [symbols.clone]() {
                return new Parent(this.message);
              }
            }
            const object = new Parent("message");
            const copy = new Parent("message");
            expect(clone(object)).to.eql(copy);
          } else {
            expect(clone(item.value)).to.eql(item.expected);
          }
        },
        function (is: string) {
          let _values: any;

          switch (is) {
            case "undefined":
              _values = undefined;
              break;
            case "symbol":
              const symbol = Symbol("Fake symbol");
              _values = symbol;
              break;
            case "class":
              function Parent(this: any) {}
              Parent.prototype.constructor = Parent;
              const child = Object.create(Parent.prototype);
              _values = child;
              break;
            case "function":
              const _function = () => {};
              _values = _function;
              break;
          }

          clone(_values);
        },
      );
    case "stringify":
      return _(
        key,
        function (item) {
          expect(stringify(item.object)).to.equals(item.expected);
        },
        function (is: string) {
          let _values: ValueData<any> = [[]];

          switch (is) {
            case "undefined":
              _values[0].push(undefined);
              break;
            case "symbol":
              const symbol = Symbol("Fake symbol");
              _values[0].push(symbol);
              break;
            case "class":
              class SpreadhseetFake {}
              const _class = new SpreadhseetFake();
              _values[0].push(_class);
              break;
            case "function":
              const _function = () => {};
              _values[0].push(_function);
              break;
          }

          stringify(_values);
        },
      );
    case "map":
      return _(
        key,
        function (item) {
          const options: MapOptions = {
            headers: item.headers,
          };
          const mapped = map(item.array, options);
          const values: any = {
            string: mapped.string,
            hasHeaders: mapped.hasHeaders,
            headers: mapped.headers,
            data: mapped.toMatrix(true),
            isTable: mapped.isTable,
            size: mapped.size,
          };
          expect(values).to.eql(item.expected);
        },
        function (is: string, options) {
          const _values: any[] = [];

          switch (is) {
            case "undefined":
              _values.push({
                undefined: undefined,
              });
              break;
          }

          map(_values, options);
        },
      );
  }
}
