import STATES from '../config/states';
import Board from './board';
import Checkers from './checkers';
// import Piece from './piece';

class Heuristic {
  checkers: Checkers;
  board: Board;

  winFactor = 1000;
  pieceFactor = 4;
  kingFactor = 8;
  trapKingFactor = 3;
  runawayFactor = 4;
  trapFactor = 3;
  oppositionFactor = 3;

  /* eslint-disable */
  // Mid Game Position Factors
  midGamePositionFactors = [
    [ 0, 4, 0, 4, 0, 4, 0, 4 ],
    [ 4, 0, 3, 0, 3, 0, 3, 0 ],
    [ 0, 3, 0, 2, 0, 2, 0, 4 ],
    [ 4, 0, 2, 0, 1, 0, 3, 0 ],
    [ 0, 3, 0, 1, 0, 2, 0, 4 ],
    [ 4, 0, 2, 0, 2, 0, 3, 0 ],
    [ 0, 3, 0, 3, 0, 3, 0, 4 ],
    [ 4, 0, 4, 0, 4, 0, 4, 0 ]
  ];
  endGamePositionFactors = [
    [ 0, 6, 0, 8, 0, 2, 0, 1 ],
    [ 6, 0, 2, 0, 7, 0, 3, 0 ],
    [ 0, 2, 0, 9, 0, 5, 0, 2 ],
    [ 1, 0, 9, 0, 9, 0, 3, 0 ],
    [ 0, 3, 0, 9, 0, 9, 0, 1 ],
    [ 2, 0, 5, 0, 9, 0, 2, 0 ],
    [ 0, 3, 0, 7, 0, 2, 0, 6 ],
    [ 1, 0, 2, 0, 8, 0, 6, 0 ]
  ];
  /* eslint-enable */

  constructor(checkers: Checkers) {
    this.checkers = checkers;
    this.board = checkers.board;
  }

  getHeuristic(): number {
    const playerCount = this.board.playerPieces.length;
    const aiCount = this.board.aiPieces.length;

    let score = 0;
    // const tmp = 0;

    //** Value Factors */
    // Piece Count
    score += (aiCount - playerCount) * this.pieceFactor;
    // King Count
    score += (this.board.aiKings - this.board.playerKings) * this.kingFactor;

    switch (this.checkers.state) {
    case STATES.MID:
      for (const piece of this.board.playerPieces) {
        const { x, y, } = piece.position;
        score += this.midGamePositionFactors[y][x]; // Positional
        if (piece.king) { // Check for trapped king
          if (this.board.isKingTrapped(x, y, piece.player))
            score += this.trapKingFactor;
        } else { // Check for runaway piece
          if (this.board.isRunaway(x, y, piece.player))
            score -= this.runawayFactor;
        }
      }
      for (const piece of this.board.aiPieces) {
        const { x, y, } = piece.position;
        score -= this.midGamePositionFactors[y][x]; // Positional
        if (piece.king) { // Check for trapped king
          if (this.board.isKingTrapped(x, y, piece.player))
            score -= this.trapKingFactor;
        } else { // Check for runaway piece
          if (this.board.isRunaway(x, y, piece.player))
            score += this.runawayFactor;
        }
      }
      break;
    case STATES.END:
      //** Positional */
      for (const piece of this.board.playerPieces) {
        const { x, y, } = piece.position;
        score += this.endGamePositionFactors[y][x];
      }
      for (const piece of this.board.aiPieces) {
        const { x, y, } = piece.position;
        score -= this.endGamePositionFactors[y][x];
      }

      // Distance to from corner edge
      // AI Advantage
      if (playerCount < aiCount) {
        // Force the piece to a corner rather than a double corner
        // for (const piece of this.board.playerPieces) {
        //   const { x, y, } = piece.position;
        //   score += (14 - x + Math.abs(7 - y));
        // }

        // for (const piece of this.board.aiPieces) {
        //   const { x, y } = piece.position;
        //   score +=
        // }
      }
      // else {
      //   for (const piece of this.board.aiPieces) {
      //     const { x, y, } = piece.position;
      //     score -= 12 - x - Math.abs(y - 6);
      //   }
      // }

      // Sum of distances
      for (const { position: pPos, } of this.board.playerPieces) {
        for (const { position: aPos, } of this.board.aiPieces) {
          score += (14 - (Math.abs(pPos.x - aPos.x) + Math.abs(pPos.y - aPos.y))) * 3;
        }
      }

      // Farthest Distance
      // tmp = 0;
      // for (const { position: pPos, } of this.board.playerPieces) {
      //   for (const { position: aPos, } of this.board.aiPieces) {
      //     tmp = Math.max(tmp, Math.abs(pPos.x - aPos.x) + Math.abs(pPos.y - aPos.y));
      //   }
      // }
      // score += 14 - tmp;

      // Trapped Pieces
      for (const piece of this.board.playerPieces) {
        const { x, y, } = piece.position;
        if (piece.king) {
          if (this.board.isKingTrapped(x, y, piece.player))
            score += this.trapFactor;
        } else {
          if (this.board.isPieceTrapped(x, y, piece.player))
            score += this.trapFactor;
        }
      }
      for (const piece of this.board.aiPieces) {
        const { x, y, } = piece.position;
        if (piece.king) {
          if (this.board.isKingTrapped(x, y, piece.player))
            score -= this.trapFactor;
        } else {
          if (this.board.isPieceTrapped(x, y, piece.player))
            score -= this.trapFactor;
        }
      }
      break;
    }

    return score;
  }
}

export default Heuristic;
