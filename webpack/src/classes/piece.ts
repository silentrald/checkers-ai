import { Circle } from 'pixi.js';
import { Vector2d } from './types';

import {
  HALF_TILE_SIZE, PIECE_RADIUS, TILE_SIZE
} from '../config/values';

class Piece extends Circle {
  position: Vector2d = {
    x: 0,
    y: 0,
  };
  player: boolean;
  king = false;

  constructor(x: number, y: number, player: boolean) {
    super(
      x * TILE_SIZE + HALF_TILE_SIZE,
      y * TILE_SIZE + HALF_TILE_SIZE,
      PIECE_RADIUS
    );
    this.position.x = x;
    this.position.y = y;
    this.player = player;
  }

  setPosition(x: number, y: number) {
    this.x = x * TILE_SIZE + HALF_TILE_SIZE;
    this.y = y * TILE_SIZE + HALF_TILE_SIZE;

    this.position.x = x;
    this.position.y = y;
  }
}

export default Piece;