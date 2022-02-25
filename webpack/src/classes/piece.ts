import {
  Container, Sprite, Texture, Graphics, Circle
} from 'pixi.js';
import { Vector2d } from './types';

import {
  HALF_TILE_SIZE, OUTLINE_SIZE, PIECE_RADIUS, TILE_SIZE
} from '../config/values';
import COLORS from '../config/colors';
import Board from './board';

const blackKing = Texture.from('/img/black-king.png');
const whiteKing = Texture.from('/img/white-king.png');

interface PieceConfig {
  pos: number;
  player: boolean;
  black: boolean;
  king?: boolean;
  board: Board;
}

class Piece extends Container {
  pos = 0;
  player: boolean;
  king: boolean;
  board: Board;

  // Draw
  pieceGraphics: Graphics;
  jumpingGraphics: Graphics;
  selectedGraphics: Graphics;
  colors: {
    primary: number;
    outline: number;
  };
  kingSprite: Sprite;

  constructor(config: PieceConfig) {
    super();
    this.board = config.board;
    this.setPos(config.pos);

    // Values for player
    this.player = config.player;
    this.king = !!config.king;
    this.colors = {
      primary: config.black ? COLORS.BLACK : COLORS.WHITE,
      outline: config.black ? COLORS.WHITE : COLORS.BLACK,
    };

    // Create Piece Graphics
    this.pieceGraphics = new Graphics();
    this.pieceGraphics.beginFill(this.colors.primary);
    this.pieceGraphics.lineStyle(OUTLINE_SIZE, this.colors.outline);
    this.pieceGraphics.drawCircle(0, 0, PIECE_RADIUS);
    this.pieceGraphics.endFill();
    this.addChild(this.pieceGraphics);
    this.pieceGraphics.interactive = false;

    // King Image
    this.kingSprite = new Sprite(config.black ? blackKing : whiteKing);
    this.addChild(this.kingSprite);
    this.kingSprite.visible = false;
    this.kingSprite.x = -16;
    this.kingSprite.y = -16;
    this.kingSprite.interactive = false;

    // Outline graphics
    // Jumping Piece
    this.jumpingGraphics = new Graphics();
    this.jumpingGraphics.lineStyle(OUTLINE_SIZE, COLORS.RED);
    this.jumpingGraphics.beginFill(undefined, 0);
    this.jumpingGraphics.drawCircle(0, 0, PIECE_RADIUS);
    this.addChild(this.jumpingGraphics);
    this.jumpingGraphics.visible = false;
    this.jumpingGraphics.interactive = false;

    // Selected Piece
    this.selectedGraphics = new Graphics();
    this.selectedGraphics.lineStyle(OUTLINE_SIZE, COLORS.YELLOW);
    this.selectedGraphics.beginFill(undefined, 0);
    this.selectedGraphics.drawCircle(0, 0, PIECE_RADIUS);
    this.addChild(this.selectedGraphics);
    this.selectedGraphics.visible = false;
    this.selectedGraphics.interactive = false;

    // Input System
    this.interactive = true;
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

  toggleKing(val: boolean) {
    this.king = val;
    this.kingSprite.visible = val;
  }

  toggleJumping(visible: boolean) {
    this.jumpingGraphics.visible = visible;
  }

  toggleSelected(visible: boolean) {
    this.selectedGraphics.visible = visible;
  }

  hide() {
    this.interactive = false;
    this.visible = false;
  }

  show() {
    this.interactive = true;
    this.visible = true;
  }

  mousedown(ev: any) {
    this.board.mousedownPiece(ev, this);
  }
}

export default Piece;