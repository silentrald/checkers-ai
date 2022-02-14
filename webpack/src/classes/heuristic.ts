import Board from './board';
import Checkers from './checkers';
import Piece from './piece';

class Heuristic {
  checkers: Checkers;
  board: Board;

  winFactor = 1000;
  pieceFactor = 4;
  kingFactor = 40;
  edgeFactor = 2;
  centerFactor = 2;

  edges = [
    [ 0, 1 ],
    [ 0, 3 ],
    [ 0, 5 ],
    [ 0, 7 ], // Left Edge
    [ 7, 0 ],
    [ 7, 2 ],
    [ 7, 4 ],
    [ 7, 6 ] // Right Edge
  ];
  centers = [
    [ 3, 4 ],
    [ 4, 5 ],
    [ 5, 4 ],
    [ 6, 4 ]
  ];

  // TODO: Add more factors here
  constructor(checkers: Checkers) {
    this.checkers = checkers;
    this.board = checkers.board;
  }

  // TODO: Create a heuristic here
  getHeuristic(): number {
    const playerCount = this.checkers.playerPieces.length;
    const aiCount = this.checkers.aiPieces.length;
    if (playerCount < 1) {
      return this.winFactor;
    }
    if (aiCount < 1) {
      return -this.winFactor;
    }

    let score = 0;
    //** Value Factors */
    // Piece Factor
    score += (aiCount - playerCount) * this.pieceFactor;
    // King Factor
    score += (this.checkers.aiKings - this.checkers.playerKings) * this.kingFactor;

    //** Positional */
    for (const [ x, y ] of this.edges) {
      const cell = this.board.getCell(x, y);
      if (cell instanceof Piece)
        score += (cell.player ? -1 : 1) * this.edgeFactor;
    }
    for (const [ x, y ] of this.centers) {
      const cell = this.board.getCell(x, y);
      if (cell instanceof Piece)
        score += (cell.player ? -1 : 1) * this.centerFactor;
    }

    return score;
  }
}

export default Heuristic;
