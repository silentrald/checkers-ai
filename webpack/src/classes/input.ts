import Checkers from './checkers';
import Board from './board';
import Piece from './piece';
import Highlight from './highlight';

import { TILE_SIZE } from '../config/values';

class Input {
  private checkers: Checkers;
  private board: Board;

  constructor(checkers: Checkers) {
    this.checkers = checkers;
    this.board = checkers.board;
  }

  mousedown(ev: any) {
    if (!this.checkers.inputting || !this.board.playerTurn) return;

    const x = Math.floor(ev.data.global.x / TILE_SIZE);
    const y = Math.floor(ev.data.global.y / TILE_SIZE);
    const cell = this.board.getCell(x, y);

    if (!cell) return;

    // Check if highlight/possible player move
    if (cell instanceof Highlight && this.board.selectedPiece) {
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
