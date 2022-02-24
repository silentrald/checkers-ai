import Checkers from './checkers';
import Board from './board';
import Piece from './piece';
import Highlight from './highlight';

import { TILE_SIZE } from '../config/values';
import { Vector2d } from './types';

class Input {
  private checkers: Checkers;
  private board: Board;

  constructor(checkers: Checkers) {
    this.checkers = checkers;
    this.board = checkers.board;
  }

  // TODO: Implement flip
  private convertVectorToPosition({ x, y, }: Vector2d, flip = false): number {
    return flip ? 0 : ((7 - y) << 2) + 3 - (x >> 1);
  }

  mousedown(ev: any) {
    if (!this.checkers.inputting || !this.board.playerTurn) return;

    const position = this.convertVectorToPosition({
      x: Math.floor(ev.data.global.x / TILE_SIZE),
      y: Math.floor(ev.data.global.y / TILE_SIZE),
    });
    const cell = this.board.getCell(position);

    if (!cell) return;

    // Check if highlight/possible player move
    if (cell instanceof Highlight && this.board.selectedPiece) {
      this.checkers.handlePlayerMove(position);
      return;
    }

    if (this.checkers.jumping) return;

    // Check if piece
    if (cell instanceof Piece) {
      this.checkers.highlightPlayerMoves(cell);
    }
  }
}

export default Input;
