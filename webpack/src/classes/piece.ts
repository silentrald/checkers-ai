import { Circle } from 'pixi.js';
import { Vector2d } from './types';

import {
  HALF_TILE_SIZE, PIECE_RADIUS, TILE_SIZE
} from '../config/values';

class Piece extends Circle {
  position = 0;
  player: boolean;
  king: boolean;

  constructor(position: number, player: boolean, king?: boolean) {
    super();
    this.radius = PIECE_RADIUS;
    this.setPosition(position);

    this.player = player;
    this.king = !!king;
  }

  private getVector(): Vector2d {
    const y = 7 - (this.position >> 2);
    const x = (3 - (this.position % 4) << 1) + ((y + 1) & 1);
    return {
      x,
      y,
    };
  }

  setPosition(position: number) {
    this.position = position;

    const { x, y, } = this.getVector();
    this.x = x * TILE_SIZE + HALF_TILE_SIZE;
    this.y = y * TILE_SIZE + HALF_TILE_SIZE;
  }
}

export default Piece;