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
    // King Count
    score += (this.board.aiKings - this.board.playerKings) * this.kingFactor;

    switch (this.checkers.state) {
    case STATES.MID:
      for (const piece of this.board.playerPieces) {
        score -= piece.pos >> 2; // Close to promotion squares
        score -= this.midGamePositionFactors[piece.pos];

        if (piece.king) { // Check for trapped king
          if (this.board.isKingTrapped(piece.pos, piece.player))
            score += this.trapKingFactor;
        } else { // Check for runaway piece
          if (this.board.isRunaway(piece.pos, piece.player))
            score -= this.runawayFactor;
        }
      }

      for (const piece of this.board.aiPieces) {
        score += 7 - (piece.pos >> 2); // Close to promotion squares
        score += this.midGamePositionFactors[piece.pos];

        if (piece.king) { // Check for trapped king
          if (this.board.isKingTrapped(piece.pos, piece.player))
            score -= this.trapKingFactor;
        } else { // Check for runaway piece
          if (this.board.isRunaway(piece.pos, piece.player))
            score += this.runawayFactor;
        }
      }
      break;
    case STATES.END:
      //** Positional */
      // for (const piece of this.board.playerPieces) {
      //   score += this.endGamePositionFactors[piece.pos];
      // }
      // for (const piece of this.board.aiPieces) {
      //   score -= this.endGamePositionFactors[piece.pos];
      // }

      // Ai is winning
      if (playerCount < aiCount) {
        for (const piece of this.board.playerPieces) {
          score -= this.board.countSafeMoves(piece.pos, piece.player) * 10;

          const top = this.board.isTopJumpEdge(piece.pos);
          const bottom = this.board.isBottomJumpEdge(piece.pos);
          const left = this.board.isLeftJumpEdge(piece.pos);
          const right = this.board.isRightJumpEdge(piece.pos);
          const doubleD = this.doubleDiagonal[piece.pos];
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
        score += (7 - playerCount) * 10;

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
          const top = this.board.isTopJumpEdge(piece.pos);
          const bottom = this.board.isBottomJumpEdge(piece.pos);
          const left = this.board.isLeftJumpEdge(piece.pos);
          const right = this.board.isRightJumpEdge(piece.pos);
          // At double corner
          if (bottom && right || top && left) {
            score += 20;
          } else if (top || bottom || left || right) {
            score -= 20;
          } else {
            score -= 5;
          }
        }

        // Dont trade
        score += aiCount * 10;

        // Dog pattern check
        if (
          this.board.isDogPattern(DIRECTIONS.BOTTOM_RIGHT) ||
          this.board.isDogPattern(DIRECTIONS.TOP_LEFT)
        ) {
          score -= 6;
        }
      }

      for (const piece of this.board.playerPieces) {
        score -= piece.pos >> 2; // Close to promotion squares

        // Trapped Pieces
        if (piece.king) {
          if (this.board.isKingTrapped(piece.pos, piece.player))
            score += this.trapFactor;
        } else {
          if (this.board.isPieceTrapped(piece.pos, piece.player))
            score += this.trapFactor;
        }
      }
      for (const piece of this.board.aiPieces) {
        score += piece.pos >> 2; // Close to promotion squares

        // Trapped Pieces
        if (piece.king) {
          if (this.board.isKingTrapped(piece.pos, piece.player))
            score -= this.trapFactor;
        } else {
          if (this.board.isPieceTrapped(piece.pos, piece.player))
            score -= this.trapFactor;
        }
      }
      break;
    }

    return score;
  }
}

export default Heuristic;
