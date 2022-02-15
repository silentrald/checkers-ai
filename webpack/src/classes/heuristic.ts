import Board from './board';
import Checkers from './checkers';
import Piece from './piece';

class Heuristic {
  checkers: Checkers;
  board: Board;
  playerPieces: Piece[];
  aiPieces: Piece[];

  winFactor = 1000;
  pieceFactor = 4;
  kingFactor = 40;

  /* eslint-disable */
  positionFactors = [
    [ 0, 4, 0, 4, 0, 4, 0, 4 ],
    [ 4, 0, 3, 0, 3, 0, 3, 0 ],
    [ 0, 3, 0, 2, 0, 2, 0, 4 ],
    [ 4, 0, 2, 0, 1, 0, 3, 0 ],
    [ 0, 3, 0, 1, 0, 2, 0, 4 ],
    [ 4, 0, 2, 0, 2, 0, 3, 0 ],
    [ 0, 3, 0, 3, 0, 3, 0, 4 ],
    [ 4, 0, 4, 0, 4, 0, 4, 0 ]
  ];
  /* eslint-enable */

  constructor(checkers: Checkers) {
    this.checkers = checkers;
    this.board = checkers.board;
    this.playerPieces = checkers.playerPieces;
    this.aiPieces = checkers.aiPieces;
  }

  getHeuristic(): number {
    const playerCount = this.playerPieces.length;
    const aiCount = this.aiPieces.length;
    if (playerCount < 1) {
      return this.winFactor;
    }
    if (aiCount < 1) {
      return -this.winFactor;
    }

    let score = 0;
    //** Value Factors */
    // Piece Count
    score += (aiCount - playerCount) * this.pieceFactor;
    // King Count
    score += (this.checkers.aiKings - this.checkers.playerKings) * this.kingFactor;

    // TODO: Trapped kings
    // TODO: Runaway piece -> a piece that can king without getting blocked
    // for (const piece of this.playerPieces) {
    //   if (piece.king) { // Check for trapped king
    //     //
    //   } else { // Check for runaway piece
    //     //
    //   }
    // }
    // for (const piece of this.aiPieces) {
    //   if (piece.king) { // Check for trapped king
    //     //
    //   } else { // Check for runaway piece
    //     //
    //   }
    // }

    //** Positional */
    let cell: any;
    for (let y = 0; y < 8; y++) {
      for (let x = y + 1 & 1; x < 8; x += 2) {
        cell = this.board.getCell(x, y);
        if (cell instanceof Piece) {
          score += this.positionFactors[y][x] * (cell.player ? -1 : 1);
        }
      }
    }

    return score;
  }
}

export default Heuristic;
