import Checkers from './checkers';
import Piece from './piece';
import Highlight from './highlight';

import { TILE_SIZE } from '../config/values';

class Input {
  private checkers: Checkers | undefined;

  constructor(checkers: Checkers) {
    this.checkers = checkers;
  }

  mousedown(ev: any) {
    if (!this.checkers || !this.checkers.inputting || !this.checkers.playerTurn) return;
    const board = this.checkers.board;

    const x = Math.floor(ev.data.global.x / TILE_SIZE);
    const y = Math.floor(ev.data.global.y / TILE_SIZE);
    const cell = board.getCell(x, y);

    if (!cell) return;

    // Check if highlight/possible player move
    if (cell instanceof Highlight && this.checkers.selectedPiece) {
      this.checkers.handlePlayerMove(x, y);
      return;
    }

    if (this.checkers.capturing) return;

    // Check if piece
    if (cell instanceof Piece) {
      this.checkers.highlightPlayerMoves(cell);
    }
  }
}

export default Input;
