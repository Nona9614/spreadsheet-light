import { CellPointer } from "../types.js";
import { Cursor } from "./cursor.js";

/**
 * An x,y position from a table
 */
export class Pointer implements CellPointer {
  x: number = 0;
  y: number = 0;

  /**
   * Returns the current pointer coordinates
   */
  public get coordinates(): CellPointer {
    return {
      x: this.x,
      y: this.y,
    };
  }

  /**
   * @param coordinates The start coordinates from the pointer
   */
  constructor(coordinates?: CellPointer) {
    if (coordinates) {
      this.x = coordinates.x;
      this.y = coordinates.y;
    }
  }

  /**
   * @param coordinates The new position for the coordinates
   */
  go(coordinates: Partial<CellPointer>) {
    if (coordinates.x) this.x = coordinates.x;
    if (coordinates.y) this.y = coordinates.y;
    return this;
  }

  /**
   * @param coordinates Adds the passed coordinates to the current ones
   */
  move(coordinates: Partial<CellPointer>) {
    if (coordinates.x) this.x += coordinates.x;
    if (coordinates.y) this.y += coordinates.y;
    return this;
  }

  /**
   * Clones this object and creates a new copy
   */
  clone() {
    return new Pointer({
      x: this.x,
      y: this.y,
    });
  }

  /**
   * Transforms the pointer onto a position
   */
  toCursor() {
    return new Cursor({
      row: this.y - 1,
      column: this.x - 1,
    });
  }
}
