import Checkers from './checkers';
import Board from './board';
import Piece from './piece';
import Heuristic from './heuristic';

import { Move } from './types';
import {
  MAX_DEPTH_MID, MAX_DEPTH_END, MAX_DEPTH_END_4
} from '../config/values';
import STATES from '../config/states';
import DIRECTIONS from '../config/directions';
import { AI_FIRST_OPENING, AI_SECOND_OPENING } from '../config/opening';

const FLAGS = {
  UPPERBOUND: 0,
  LOWERBOUND: 1,
  EXACT: 2,
};

interface TranspositionData {
  value: number;
  depth: number;
  flag: number;
}

interface MatingTree {
  children: MatingTree[];
  move: Move;
  count: number;
  mate: boolean;
  state: string;
}

interface Opening {
  [key: string]: { [key: string]: Opening }
}

class AI {
  checkers: Checkers;
  board: Board;
  heuristic: Heuristic;
  heuristicMemo: { [key: string]: number } = {};
  transpositionTable: { [key: string]: TranspositionData } = {};
  treeWalk: { [key: string]: boolean } = {};
  matingTree: MatingTree | undefined;
  mateMemo: { [key: string]: { node: MatingTree; depth: number; } } = {};
  opening: Opening = {};
  repetitions: { [key: string]: boolean } = {};

  constructor(checkers: Checkers) {
    this.checkers = checkers;
    this.board = checkers.board;
    this.heuristic = new Heuristic(checkers);
  }

  setup() {
    this.opening = this.board.playerFirst ? AI_SECOND_OPENING : AI_FIRST_OPENING;
  }

  resetOpening() {
    this.checkers.state = STATES.START;
    this.opening = this.board.playerFirst ? AI_SECOND_OPENING : AI_FIRST_OPENING;

    for (const move of this.checkers.moveStack) {
      this.opening = this.opening[move.notation || ''];
      if (this.opening === undefined) {
        this.checkers.state = STATES.MID;
        return;
      }
    }
  }

  private searchAllPossibleJumps(
    piece: Piece, position: number,
    moves: number[], output: number[][]
  ) {
    // TODO: Look into this
    const move: Move = {
      moves: [ piece.pos, position ],
      jumping: true,
      promoting: !piece.king && (piece.player ?
        this.board.isTopEdge(piece.pos) :
        this.board.isBottomEdge(piece.pos)
      ),
    };
    this.board.jump(move);
    moves.push(position);

    if (!move.promoting) {
      const temp = this.getAllPossibleJump(piece, [ ...moves ]);
      if (temp.length < 1) {
        output.push([ ...moves ]);
      } else {
        output.push(...temp);
      }
    } else {
      output.push([ ...moves ]);
    }

    moves.pop();
    this.board.reverseJump(move);
  }

  private getAllPossibleJump(piece: Piece, moves: number[]): number[][] {
    const output: number[][] = [];

    if (piece.player) {
      if (piece.king) {
        if (this.board.isJumpable(piece.pos, DIRECTIONS.BOTTOM_LEFT, false))
          this.searchAllPossibleJumps(
            piece, this.board.getBottomLeftJump(piece.pos), moves, output
          );
        if (this.board.isJumpable(piece.pos, DIRECTIONS.BOTTOM_RIGHT, false))
          this.searchAllPossibleJumps(
            piece, this.board.getBottomRightJump(piece.pos), moves, output
          );
      }

      if (this.board.isJumpable(piece.pos, DIRECTIONS.TOP_LEFT, false))
        this.searchAllPossibleJumps(piece, this.board.getTopLeftJump(piece.pos), moves, output);
      if (this.board.isJumpable(piece.pos, DIRECTIONS.TOP_RIGHT, false))
        this.searchAllPossibleJumps(piece, this.board.getTopRightJump(piece.pos), moves, output);
    } else {
      if (piece.king) {
        if (this.board.isJumpable(piece.pos, DIRECTIONS.TOP_LEFT, true))
          this.searchAllPossibleJumps(piece, this.board.getTopLeftJump(piece.pos), moves, output);
        if (this.board.isJumpable(piece.pos, DIRECTIONS.TOP_RIGHT, true))
          this.searchAllPossibleJumps(piece, this.board.getTopRightJump(piece.pos), moves, output);
      }

      if (this.board.isJumpable(piece.pos, DIRECTIONS.BOTTOM_LEFT, true))
        this.searchAllPossibleJumps(
          piece, this.board.getBottomLeftJump(piece.pos), moves, output
        );
      if (this.board.isJumpable(piece.pos, DIRECTIONS.BOTTOM_RIGHT, true))
        this.searchAllPossibleJumps(
          piece, this.board.getBottomRightJump(piece.pos), moves, output
        );
    }

    return output;
  }

  getAllPossibleMoves(player: boolean): Move[] {
    const rootMoves: Move[] = [];

    const capturePieces = this.checkers.getForceJumps(player);

    if (capturePieces.length > 0) {
      for (const piece of capturePieces) {
        const allMoves = this.getAllPossibleJump(piece, [ piece.pos ]);
        for (const moves of allMoves) {
          rootMoves.push({
            moves,
            jumping: true,
            promoting: !piece.king && (piece.player ?
              this.board.isTopEdge(moves[moves.length - 1]) :
              this.board.isBottomEdge(moves[moves.length - 1])
            ),
          });
        }
      }
    } else if (player) {
      let pos = 0;
      for (const piece of this.board.playerPieces) {
        if (piece.king) {
          if (this.board.isMovable(piece.pos, DIRECTIONS.BOTTOM_LEFT)) {
            pos = this.board.getBottomLeft(piece.pos);
            rootMoves.push({
              moves: [ piece.pos, pos ],
            });
          }

          if (this.board.isMovable(piece.pos, DIRECTIONS.BOTTOM_RIGHT)) {
            pos = this.board.getBottomRight(piece.pos);
            rootMoves.push({
              moves: [ piece.pos, pos ],
            });
          }
        }

        if (this.board.isMovable(piece.pos, DIRECTIONS.TOP_LEFT)) {
          pos = this.board.getTopLeft(piece.pos);
          rootMoves.push({
            moves: [ piece.pos, pos ],
            promoting: !piece.king && this.board.isTopEdge(pos),
          });
        }

        if (this.board.isMovable(piece.pos, DIRECTIONS.TOP_RIGHT)) {
          pos = this.board.getTopRight(piece.pos);
          rootMoves.push({
            moves: [ piece.pos, pos ],
            promoting: !piece.king && this.board.isTopEdge(pos),
          });
        }
      }
    } else {
      let pos = 0;
      for (const piece of this.board.aiPieces) {
        if (piece.king) {
          if (this.board.isMovable(piece.pos, DIRECTIONS.TOP_LEFT)) {
            pos = this.board.getTopLeft(piece.pos);
            rootMoves.push({
              moves: [ piece.pos, pos ],
            });
          }

          if (this.board.isMovable(piece.pos, DIRECTIONS.TOP_RIGHT)) {
            pos = this.board.getTopRight(piece.pos);
            rootMoves.push({
              moves: [ piece.pos, pos ],
            });
          }
        }

        if (this.board.isMovable(piece.pos, DIRECTIONS.BOTTOM_LEFT)) {
          pos = this.board.getBottomLeft(piece.pos);
          rootMoves.push({
            moves: [ piece.pos, pos ],
            promoting: !piece.king && this.board.isBottomEdge(pos),
          });
        }

        if (this.board.isMovable(piece.pos, DIRECTIONS.BOTTOM_RIGHT)) {
          pos = this.board.getBottomRight(piece.pos);
          rootMoves.push({
            moves: [ piece.pos, pos ],
            promoting: !piece.king && this.board.isBottomEdge(pos),
          });
        }
      }
    }

    return rootMoves;
  }

  private _move(move: Move) {
    if (move.jumping) {
      this.board.jump(move);
    } else {
      this.board.move(move);
    }

    this.board.playerTurn = !this.board.playerTurn;
  }

  private _reverseMove(move: Move) {
    if (move.jumping) {
      this.board.reverseJump(move);
    } else {
      this.board.reverseMove(move);
    }

    this.board.playerTurn = !this.board.playerTurn;
  }

  private quiescentSearch(
    alpha: number, beta: number,
    player: boolean
  ): number {
    if (this.board.playerPieces.length === 0)
      return 2000;
    if (this.board.aiPieces.length === 0)
      return -2000;

    const capturePieces = this.checkers.getForceJumps(player);
    const capturing = capturePieces.length > 0;

    if (!capturing) {
      const heuristic = this.heuristic.getHeuristic();
      const state = this.board.getState();
      this.heuristicMemo[state] = heuristic;
      return heuristic;
    }

    let val = 0;
    if (player) { // Player
      val = Infinity;
      for (const piece of capturePieces) {
        const captureMoves = this.getAllPossibleJump(piece, [ piece.pos ]);
        for (const moves of captureMoves) {
          const move: Move = {
            moves,
            jumping: true,
            promoting: !piece.king && this.board.isTopEdge(moves[moves.length - 1]),
          };
          this._move(move);
          val = Math.min(val, this.quiescentSearch(alpha, beta, false));
          this._reverseMove(move);

          if (val <= alpha) return val;
          beta = Math.min(beta, val);
        }
      }
    } else { // AI
      val = -Infinity;
      for (const piece of capturePieces) {
        const captureMoves = this.getAllPossibleJump(piece, [ piece.pos ]);
        for (const moves of captureMoves) {
          const move: Move = {
            moves,
            jumping: true,
            promoting: !piece.king && this.board.isBottomEdge(moves[moves.length - 1]),
          };
          this._move(move);
          val = Math.max(val, this.quiescentSearch(alpha, beta, true));
          this._reverseMove(move);

          if (val >= beta) return val;
          alpha = Math.max(alpha, val);
        }
      }
    }

    return val;
  }

  private sortMoves(moves: Move[]) {
    // average for player movements
    moves.sort((m1, m2) => {
      return m1.moves.length - m2.moves.length;
    });
  }

  private negamax(depth: number, alpha: number, beta: number, color: number): number {
    const player = color < 0;
    const state = this.board.getState();
    const originalAlpha = alpha;

    // Transposition Table
    let entry: TranspositionData | undefined = this.transpositionTable[state];
    if (entry && entry.depth >= depth) {
      if (entry.flag === FLAGS.EXACT)
        return entry.value;
      else if (entry.flag === FLAGS.LOWERBOUND)
        alpha = Math.max(alpha, entry.value);
      else
        beta = Math.min(beta, entry.value);

      if (alpha >= beta)
        return entry.value;
    }

    if (this.board.playerPieces.length === 0)
      return 2000 * color;
    if (this.board.aiPieces.length === 0)
      return -2000 * color;

    if (depth < 1)
      return this.quiescentSearch(alpha, beta, player) * color;

    let max = -2000;

    const allMoves = this.getAllPossibleMoves(player);
    this.sortMoves(allMoves);

    this.treeWalk[state] = true;
    for (const moves of allMoves) {
      this._move(moves);
      max = Math.max(max, -this.negamax(depth - 1, -beta, -alpha, -color));
      this._reverseMove(moves);

      alpha = Math.max(alpha, max);
      if (alpha >= beta) break;
    }
    this.treeWalk[state] = false;

    let flag = FLAGS.EXACT;
    if (max <= originalAlpha)
      flag = FLAGS.UPPERBOUND;
    else if (max >= beta)
      flag = FLAGS.LOWERBOUND;

    entry = {
      value: max,
      depth,
      flag,
    };
    this.transpositionTable[state] = entry;

    return max;
  }

  private minimax(
    depth: number,
    alpha: number, beta: number,
    player: boolean
  ): number {
    if (player)
      return -this.negamax(depth, -beta, -alpha, -1);
    else
      return this.negamax(depth, alpha, beta, 1);
  }

  private mateSearch(move: Move, depth: number, player: boolean): MatingTree {
    const state = this.board.getState();

    const cache = this.mateMemo[state];
    if (cache && cache.depth >= depth) {
      const node = {
        ...cache.node,
      };
      node.move = move;
      return node;
    }

    const node: MatingTree = {
      children: [],
      move,
      count: Infinity,
      mate: false,
      state,
    };

    if (this.treeWalk[state]) {
      node.count = MAX_DEPTH_END;
      node.mate = true;
      return node;
    }

    if (this.board.playerPieces.length === 0) {
      node.count = 0;
      node.mate = true;
      this.mateMemo[state] = {
        node,
        depth,
      };

      return node;
    }

    if (this.board.aiPieces.length === 0) {
      this.mateMemo[state] = {
        node,
        depth,
      };

      return node;
    }

    if (depth < 1) {
      const mate = this.quiescentSearch(-Infinity, Infinity, player) > 999;
      node.count = mate ? 0 : MAX_DEPTH_END;
      node.mate = mate;
      return node;
    }

    const allMoves = this.getAllPossibleMoves(player);
    if (allMoves.length === 0) {
      this.mateMemo[state] = {
        node,
        depth,
      };
      return node;
    }

    this.treeWalk[state] = false;

    if (player) {
      // All should be a mate threat
      let max = -Infinity;
      node.mate = true;

      for (const newMove of allMoves) {
        this._move(newMove);
        const child = this.mateSearch({
          ...newMove,
        }, depth - 1, false);
        this._reverseMove(newMove);

        if (!child.mate) {
          max = Infinity;
          node.children = [];
          node.mate = false;
          break;
        }

        max = Math.max(max, child.count);
        node.children.push(child);
      }

      node.count = max;
    } else {
      // At least 1 mate threat
      let min = Infinity;
      for (const newMove of allMoves) {
        this._move(newMove);
        const child = this.mateSearch({
          ...newMove,
        }, depth - 1, true);

        if (child.mate) {
          if (child.count < min) {
            min = child.count;
            node.count = min;
            node.children = [ {
              ...child,
            } ];
          }
          node.mate = true;
        }

        this._reverseMove(newMove);
      }
      node.count++;
    }

    this.mateMemo[state] = {
      node,
      depth,
    };
    this.treeWalk[state] = false;

    return node;
  }

  private searchOpening(): Move | null {
    const length = this.checkers.moveStack.length;
    let tree: Opening = {};
    if (length > 0) {
      // Get the first move
      const lastNotation = this.checkers.moveStack[length - 1].notation || '';
      tree = this.opening[lastNotation];
    } else {
      tree = this.opening;
    }

    if (!tree)
      return null;

    const keys = Object.keys(tree);
    if (keys.length === 0)
      return null;

    const notation = keys[Math.floor(Math.random() * keys.length)];
    const move = this.board.convertNotationToMove(notation);
    this.opening = tree[notation];

    return move;
  }

  move() {
    if (this.checkers.state === STATES.START) {
      const move = this.searchOpening();
      if (move) {
        this._move(move);
        this.checkers.pushToMoveStack(move);
        return;
      }
      this.checkers.state = STATES.MID;
    }

    if (this.matingTree) {
      const state = this.board.getState();
      const matingTree = this.matingTree.children.find((mt) => mt.state === state)!;

      if (matingTree) {
        this.matingTree = matingTree.children[0];
        if (this.matingTree) {
          this._move(this.matingTree.move);
          this.checkers.pushToMoveStack(this.matingTree.move);
          return;
        }
      }
    }

    let depth = 0, count = 0;
    switch (this.checkers.state) {
    case STATES.MID:
      depth = MAX_DEPTH_MID;
      break;
    case STATES.END:
      count = this.board.aiPieces.length + this.board.playerPieces.length;
      if (count < 5) {
        depth = MAX_DEPTH_END_4;
      }  else {
        depth = MAX_DEPTH_END;
      }
      break;
    }

    // Check for moves
    const rootMoves = this.getAllPossibleMoves(false);

    if (rootMoves.length === 1) {
      const bestMove = rootMoves[0];
      this._move(bestMove);
      this.checkers.pushToMoveStack(bestMove);
      return;
    }

    // Minimax for rootMoves
    let bestMove: Move = rootMoves[0];
    let heuristic = 0;
    let max = -Infinity;

    for (const move of rootMoves) {
      this._move(move);
      heuristic = this.minimax(depth, -Infinity, Infinity, true);
      // console.log(heuristic, move);
      if (heuristic > max) {
        max = heuristic;
        bestMove = move;
      }

      this._reverseMove(move);

      if (heuristic > 999) {
        break;
      }
    }

    if (heuristic > 999) {
      rootMoves.splice(0, rootMoves.indexOf(bestMove) + 1);

      this._move(bestMove);
      this.matingTree = this.mateSearch(bestMove, depth, true);
      this._reverseMove(bestMove);
      // Mate search
      let matingTree: MatingTree | undefined;
      for (const move of rootMoves) {
        this._move(move);
        heuristic = this.minimax(depth, -Infinity, Infinity, true);

        if (heuristic < 1000) {
          this._reverseMove(move);
          continue;
        }

        matingTree = this.mateSearch(move, depth, true);

        this._reverseMove(move);

        if (matingTree.count < this.matingTree.count) {
          this.matingTree = matingTree;
          bestMove = move;
        }
      }
    }

    this._move(bestMove);
    this.transpositionTable = {};
    this.heuristicMemo = {};

    this.checkers.pushToMoveStack(bestMove);
  }
}

export default AI;
