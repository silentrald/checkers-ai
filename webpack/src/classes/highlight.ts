import { Container, Graphics } from 'pixi.js';
import Input from './input';
import Board from './board';
import { Vector2d } from './types';

import {
  HALF_TILE_SIZE, OUTLINE_SIZE, TILE_SIZE
} from '../config/values';
import COLORS from '../config/colors';

interface HighlightConfig {
  pos: number;
  board: Board;
}

class Highlight extends Container {
  pos = 0;
  board: Board;
  graphics = new Graphics();

  constructor(config: HighlightConfig) {
    super();

    this.board = config.board;

    this.graphics.lineStyle(OUTLINE_SIZE, COLORS.WHITE);
    this.graphics.beginFill(COLORS.WHITE, 0.25);
    this.graphics.drawCircle(0, 0, HALF_TILE_SIZE - OUTLINE_SIZE);
    this.graphics.endFill();

    this.addChild(this.graphics);

    this.setPos(config.pos);
    this.hide();

    // Input System
    this.once('mousedown', (ev) => this.mousedown(ev));
  }

  private getVector(): Vector2d {
    const y = 7 - (this.pos >> 2);
    const x = (3 - (this.pos % 4) << 1) + ((y + 1) & 1);
    return {
      x,
      y,
    };
  }

  setPos(pos: number) {
    this.pos = pos;

    const { x, y, } = this.getVector();
    this.x = x * TILE_SIZE + HALF_TILE_SIZE;
    this.y = y * TILE_SIZE + HALF_TILE_SIZE;
  }

  mousedown(ev: any) {
    this.board.mousedownHighlight(ev, this);
  }

  show() {
    this.interactive = true;
    this.visible = true;
  }

  hide() {
    this.interactive = false;
    this.visible = false;
  }
}

export default Highlight;