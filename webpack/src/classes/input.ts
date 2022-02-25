import Checkers from './checkers';
import Board from './board';
import Piece from './piece';
import Highlight from './highlight';

import { Vector2d } from './types';

class Input {
  private checkers: Checkers;
  board: Board | undefined;
  private clicking = false;

  constructor(checkers: Checkers) {
    this.checkers = checkers;
  }

  private convertVectorToPosition({ x, y, }: Vector2d, flipped: boolean): number {
    return flipped ? (y << 2) + (x >> 1) : ((7 - y) << 2) + 3 - (x >> 1);
  }

  mousedownPiece(ev: any, piece: Piece) {
    if (!this.board || !this.checkers.inputting || !this.board.playerTurn)
      return;

    if (this.checkers.jumping)
      return;

    this.checkers.highlightPlayerMoves(piece);
  }

  mousedownHighlight(ev: any, highlight: Highlight) {
    if (!this.board || !this.checkers.inputting || !this.board.playerTurn)
      return;

    // Check if there is a selected piece
    if (!this.board.selectedPiece)
      return;

    this.checkers.handlePlayerMove(highlight.pos);
  }
}

export default Input;
