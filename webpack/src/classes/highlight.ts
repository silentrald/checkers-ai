import { Circle } from 'pixi.js';
import { Vector2d } from './types';

import {
  HALF_TILE_SIZE, OUTLINE_SIZE, TILE_SIZE
} from '../config/values';

class Highlight extends Circle {
  position: Vector2d = {
    x: 0,
    y: 0,
  };

  constructor(x: number, y: number) {
    super(
      x * TILE_SIZE + HALF_TILE_SIZE,
      y * TILE_SIZE + HALF_TILE_SIZE,
      HALF_TILE_SIZE - OUTLINE_SIZE
    );
    this.position.x = x;
    this.position.y = y;
  }
}

export default Highlight;