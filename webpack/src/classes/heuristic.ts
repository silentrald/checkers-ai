import DIRECTIONS from '../config/directions';
import STATES from '../config/states';
import Board from './board';
import Checkers from './checkers';
// import Piece from './piece';

class Heuristic {
  checkers: Checkers;
  board: Board;

  pieceFactor = 4;
  kingFactor = 10;
  trapKingFactor = 5;
  runawayFactor = 6;
  trapFactor = 5;

  /* eslint-disable */
  // Mid Game Position Factors
  midGamePositionFactors = [
    4, 4, 4, 4,
    4, 3, 3, 3,
    3, 2, 2, 4,
    4, 2, 1, 3,
    3, 1, 2, 4,
    4, 2, 2, 3,
    3, 3, 3, 4,
    4, 4, 4, 4
  ];
  endGamePositionFactors = [
    6, 8, 2, 1,
    6, 2, 7, 3,
    2, 9, 5, 2,
    1, 9, 9, 3,
    3, 9, 9, 1,
    2, 5, 9, 2,
    3, 7, 2, 6,
    1, 2, 8, 6
  ];
  doubleDiagonal = [
    1, 0, 0, 0,
    1, 1, 0, 0,
    1, 1, 0, 0,
    0, 1, 1, 0,
    0, 1, 1, 1,
    0, 0, 1, 1,
    0, 0, 1, 1,
    0, 0, 0, 1
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

    switch (this.checkers.state) {
    case STATES.MID:
      // King Count
      score += (this.board.aiKings - this.board.playerKings) * this.kingFactor;

      for (const piece of this.board.playerPieces) {
        score -= piece.position >> 2; // Close to promotion squares
        score -= this.midGamePositionFactors[piece.position];

        if (piece.king) { // Check for trapped king
          if (this.board.isKingTrapped(piece.position, piece.player))
            score += this.trapKingFactor;
        } else { // Check for runaway piece
          if (this.board.isRunaway(piece.position, piece.player))
            score -= this.runawayFactor;
        }
      }

      for (const piece of this.board.aiPieces) {
        score += 7 - (piece.position >> 2); // Close to promotion squares
        score += this.midGamePositionFactors[piece.position];

        if (piece.king) { // Check for trapped king
          if (this.board.isKingTrapped(piece.position, piece.player))
            score -= this.trapKingFactor;
        } else { // Check for runaway piece
          if (this.board.isRunaway(piece.position, piece.player))
            score += this.runawayFactor;
        }
      }
      break;
    case STATES.END:
      // King Count
      score += (this.board.aiKings - this.board.playerKings) * this.kingFactor * 2;

      //** Positional */
      // for (const piece of this.board.playerPieces) {
      //   score += this.endGamePositionFactors[piece.position];
      // }
      // for (const piece of this.board.aiPieces) {
      //   score -= this.endGamePositionFactors[piece.position];
      // }

      // Ai is winning
      if (playerCount < aiCount) {
        for (const piece of this.board.playerPieces) {
          score -= this.board.countSafeMoves(piece.position, piece.player) * 10;

          const top = this.board.isTopJumpEdge(piece.position);
          const bottom = this.board.isBottomJumpEdge(piece.position);
          const left = this.board.isLeftJumpEdge(piece.position);
          const right = this.board.isRightJumpEdge(piece.position);
          const doubleD = this.doubleDiagonal[piece.position];
          // At double corner
          if (bottom && right || top && left) {
            score += 1;
          } else if (doubleD) {
            score += 3;
          } else if (top || bottom || left || right) {
            score += 9;
          } else {
            score += 6;
          }
        }

        // incentivize trading pieces
        score += (12 - playerCount - aiCount) * 10;

        // for (const pp of this.board.playerPieces) {
        //   for (const ap of this.board.aiPieces) {
        //     score += 10 - this.board.getDistance(pp.position, ap.position);
        //   }
        // }

        // Dog pattern check
        if (
          this.board.isDogPattern(DIRECTIONS.BOTTOM_RIGHT) ||
          this.board.isDogPattern(DIRECTIONS.TOP_LEFT)
        ) {
          score += 6;
        }
      } else if (playerCount === aiCount) {
        score -= 40;
      } else { // piece disadvantage
        for (const piece of this.board.aiPieces) {
          const top = this.board.isTopJumpEdge(piece.position);
          const bottom = this.board.isBottomJumpEdge(piece.position);
          const left = this.board.isLeftJumpEdge(piece.position);
          const right = this.board.isRightJumpEdge(piece.position);
          // At double corner
          if (bottom && right || top && left) {
            score += 20;
          } else if (top || bottom || left || right) {
            score -= 20;
          } else {
            score -= 5;
          }
        }
      }

      // Trapped Pieces
      for (const piece of this.board.playerPieces) {
        if (piece.king) {
          if (this.board.isKingTrapped(piece.position, piece.player))
            score += this.trapFactor;
        } else {
          if (this.board.isPieceTrapped(piece.position, piece.player))
            score += this.trapFactor;
        }
      }
      for (const piece of this.board.aiPieces) {
        if (piece.king) {
          if (this.board.isKingTrapped(piece.position, piece.player))
            score -= this.trapFactor;
        } else {
          if (this.board.isPieceTrapped(piece.position, piece.player))
            score -= this.trapFactor;
        }
      }
      break;
    }

    return score;
  }
}

export default Heuristic;
